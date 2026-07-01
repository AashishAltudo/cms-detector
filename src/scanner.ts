import pLimit from "p-limit";
import type { PageArtifacts, ScanOptions, ScanResult } from "./types/index.js";
import { HttpClient } from "./services/http-client.js";
import { analyzeHtml, extractJsGlobals, isThinHtml } from "./services/html-analyzer.js";
import { COMMON_API_PROBES, ProbeService } from "./services/probe-service.js";
import { PlaywrightService } from "./services/playwright-service.js";
import { detectHosting, mergeArtifacts } from "./signatures/hosting.js";
import { ALL_DETECTORS } from "./detectors/index.js";
import { buildScanResult, mergeScanOptions, MIN_REPORT_CONFIDENCE } from "./engine/result-builder.js";
import { scoreMatch } from "./engine/confidence-engine.js";
import { STRONG_EVIDENCE_TYPES } from "./signatures/weights.js";
import { createLogger } from "./utils/logger.js";
import { getOrigin, normalizeUrl } from "./utils/url.js";
import type { DetectorMatch } from "./types/index.js";
import type { HttpResponsePayload } from "./services/http-client.js";

export class Scanner {
  private readonly options: ReturnType<typeof mergeScanOptions>;
  private readonly http: HttpClient;
  private readonly probes: ProbeService;
  private readonly playwright: PlaywrightService;
  private readonly logger = createLogger({ level: "info" });
  private playwrightSessions = 0;

  constructor(options: ScanOptions = {}) {
    this.options = mergeScanOptions(options);
    this.http = new HttpClient({
      timeoutMs: this.options.timeoutMs,
      maxRetries: this.options.maxRetries,
      useCache: this.options.useCache,
      rateLimitMs: this.options.rateLimitMs,
      userAgents: this.options.userAgents,
      proxyUrl: this.options.proxyUrl,
    });
    this.probes = new ProbeService(this.http, this.options.concurrency);
    this.playwright = new PlaywrightService();
  }

  async scan(url: string): Promise<ScanResult> {
    const normalized = normalizeUrl(url);

    try {
      let artifacts = await this.collectArtifacts(normalized);
      let matches = await this.runDetectors({ artifacts });

      if (this.shouldUsePlaywrightFallback(artifacts, matches)) {
        this.logger.info(`No strong match for ${normalized} — retrying with Playwright`);
        this.playwrightSessions += 1;
        try {
          const rendered = await this.playwright.render(artifacts.finalUrl, this.options.timeoutMs);
          artifacts = {
            ...artifacts,
            html: rendered.html,
            jsGlobals: [...new Set([...artifacts.jsGlobals, ...rendered.jsGlobals])],
          };
          matches = await this.runDetectors({ artifacts });
        } catch (playwrightError) {
          this.logger.warn(`Playwright fallback failed for ${normalized}`, playwrightError);
        }
      }

      const hosting = artifacts.hostingSignals[0] ?? null;
      const bestScore = matches.reduce((max, m) => Math.max(max, scoreMatch(m)), 0);
      let hint: string | undefined;
      if (bestScore < MIN_REPORT_CONFIDENCE) {
        if (isThinHtml(artifacts.html)) {
          hint =
            "Site returned minimal content — likely bot protection, geo-restriction, or requires browser login";
        } else if (matches.length === 0) {
          hint = "No CMS fingerprints found in page source — site may use a custom or obfuscated platform";
        }
      }
      return buildScanResult(normalized, artifacts.finalUrl, matches, hosting, hint);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Scan failed for ${normalized}`, message);
      return buildScanResult(normalized, normalized, [], null, message);
    }
  }

  async scanMany(urls: string[]): Promise<ScanResult[]> {
    const limit = pLimit(this.options.concurrency);
    try {
      return await Promise.all(urls.map((url) => limit(() => this.scan(url))));
    } finally {
      if (this.playwrightSessions > 0 || this.options.usePlaywright) {
        await this.playwright.close();
      }
    }
  }

  private shouldUsePlaywrightFallback(artifacts: PageArtifacts, matches: DetectorMatch[]): boolean {
    if (this.options.usePlaywright || !this.options.autoPlaywrightFallback) {
      return false;
    }

    let best: DetectorMatch | null = null;
    let bestScore = 0;
    for (const match of matches) {
      const score = scoreMatch(match);
      if (score > bestScore) {
        best = match;
        bestScore = score;
      }
    }

    // A confident, corroborated result needs no rendering.
    if (bestScore >= 60) return false;

    const hasStrongSignal = best?.evidence.some((item) => STRONG_EVIDENCE_TYPES.has(item.type)) ?? false;
    if (hasStrongSignal && bestScore >= 40) return false;

    // Otherwise the page is undetected or only weakly/circumstantially matched —
    // client-side rendering frequently reveals the real platform (SPA shells,
    // hydration markers, JS SDKs), so it's worth a render pass.
    return true;
  }

  private async fetchPage(url: string): Promise<HttpResponsePayload> {
    let response = await this.http.get(url);

    if (response.status >= 400 || isThinHtml(response.data ?? "")) {
      const parsed = new URL(response.finalUrl || url);
      const host = parsed.hostname;
      const altHost = host.startsWith("www.") ? host.slice(4) : `www.${host}`;
      const altUrl = `${parsed.protocol}//${altHost}${parsed.pathname}${parsed.search}`;
      if (altUrl !== response.finalUrl) {
        try {
          const altResponse = await this.http.get(altUrl);
          if ((altResponse.data?.length ?? 0) > (response.data?.length ?? 0)) {
            response = altResponse;
          }
        } catch {
          // keep original response
        }
      }
    }

    return response;
  }

  private async collectArtifacts(url: string): Promise<PageArtifacts> {
    this.logger.info(`Fetching ${url}`);
    const response = await this.fetchPage(url);
    const parsed = analyzeHtml(response);
    const scriptBlob = parsed.scripts.join("\n");
    let html = parsed.html;
    let jsGlobals = extractJsGlobals(scriptBlob);

    if (this.options.usePlaywright) {
      this.logger.info(`Rendering ${url} with Playwright`);
      this.playwrightSessions += 1;
      const rendered = await this.playwright.render(response.finalUrl, this.options.timeoutMs);
      html = rendered.html;
      jsGlobals = [...new Set([...jsGlobals, ...rendered.jsGlobals])];
    }

    const origin = getOrigin(response.finalUrl);
    const [robotsTxt, sitemapXml, manifestJson, probeResults] = await Promise.all([
      this.safeFetchText(origin, "/robots.txt"),
      this.safeFetchText(origin, "/sitemap.xml"),
      this.safeFetchText(origin, "/manifest.json"),
      this.options.probeApis ? this.probes.probeEndpoints(origin, COMMON_API_PROBES) : Promise.resolve([]),
    ]);

    const hostingSignals = detectHosting(response.headers, html);

    const artifacts: PageArtifacts = {
      url,
      finalUrl: response.finalUrl,
      html,
      headers: response.headers,
      cookies: response.cookies,
      scripts: parsed.scripts,
      comments: parsed.comments,
      metaGenerator: parsed.metaGenerator,
      resourceUrls: parsed.resourceUrls,
      robotsTxt,
      sitemapXml,
      manifestJson,
      probes: probeResults,
      hostingSignals,
      jsGlobals,
    };

    if (this.options.usePlaywright && html !== parsed.html) {
      return mergeArtifacts(artifacts, html, jsGlobals);
    }

    return artifacts;
  }

  private async safeFetchText(origin: string, path: string): Promise<string | null> {
    try {
      const response = await this.http.get(new URL(path, origin).toString());
      if (response.status >= 200 && response.status < 400) return response.data;
      return null;
    } catch {
      return null;
    }
  }

  private async runDetectors(context: { artifacts: PageArtifacts }): Promise<DetectorMatch[]> {
    const limit = pLimit(this.options.concurrency);
    const nested = await Promise.all(
      ALL_DETECTORS.map((detector) =>
        limit(async () => {
          try {
            return await detector.detect(context);
          } catch (error) {
            this.logger.warn(`Detector ${detector.id} failed`, error);
            return [];
          }
        }),
      ),
    );

    return nested.flat();
  }

  async dispose(): Promise<void> {
    await this.playwright.close();
  }
}

export async function scanUrl(url: string, options?: ScanOptions): Promise<ScanResult> {
  const scanner = new Scanner(options);
  try {
    return await scanner.scan(url);
  } finally {
    await scanner.dispose();
  }
}

export async function scanUrls(urls: string[], options?: ScanOptions): Promise<ScanResult[]> {
  const scanner = new Scanner(options);
  try {
    return await scanner.scanMany(urls);
  } finally {
    await scanner.dispose();
  }
}
