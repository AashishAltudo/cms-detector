import type { ScanResult, ScanOptions, AlternativeMatch, DetectorMatch, PlatformCategory } from "../types/index.js";
import { aggregateMatches, scoreMatch } from "./confidence-engine.js";
import { normalizePlatformName, TARGET_PLATFORMS } from "../signatures/target-platforms.js";

/** Minimum confidence required before reporting a platform match. */
export const MIN_REPORT_CONFIDENCE = 30;

/** Prefer purpose-built CMS/commerce platforms over generic framework fingerprints. */
const CATEGORY_PRIORITY: Record<PlatformCategory, number> = {
  "Traditional CMS": 100,
  "Commerce Platform": 95,
  "Website Builder": 90,
  "Headless CMS": 80,
  "Enterprise DXP": 75,
  "Static Site Generator": 65,
  "Web Framework": 35,
  Hosting: 30,
};

function aggregateByCanonical(matches: DetectorMatch[]): Map<string, DetectorMatch> {
  const raw = aggregateMatches(matches);
  const canonical = new Map<string, DetectorMatch>();

  for (const match of raw.values()) {
    const platform = (normalizePlatformName(match.platform) ?? match.platform) as string;
    const existing = canonical.get(platform);
    if (!existing) {
      canonical.set(platform, { ...match, platform });
      continue;
    }
    existing.evidence.push(...match.evidence);
    existing.headless = existing.headless || match.headless;
    existing.framework = existing.framework ?? match.framework;
  }

  return canonical;
}

/**
 * Ranking is confidence-first. Category priority and target-platform membership
 * only act as gentle tiebreakers so that, at similar confidence, a purpose-built
 * CMS/commerce platform is preferred over a generic framework fingerprint.
 * (Confidence guardrails already live in scoreMatch, so no penalties here.)
 */
function computeRankScore(match: DetectorMatch, confidence: number): number {
  let rank = confidence;
  const canonical = normalizePlatformName(match.platform);

  rank += (CATEGORY_PRIORITY[match.category] ?? 50) * 0.08;

  if (canonical && (TARGET_PLATFORMS as readonly string[]).includes(canonical)) {
    rank += 6;
  }

  // Presentation-layer tech (the rendering framework / SSG) should not outrank
  // the backing CMS/DXP/commerce platform it merely renders. In headless setups
  // (e.g. Sitecore + Next.js) the CMS is the answer the user wants; the framework
  // is reported separately in the `framework` field.
  if (match.category === "Web Framework") rank -= 12;
  if (match.category === "Static Site Generator") rank -= 8;

  return rank;
}

function prioritizeResults(
  ranked: Array<{ match: DetectorMatch; confidence: number; rankScore: number }>,
): typeof ranked {
  const wooIndex = ranked.findIndex((item) => normalizePlatformName(item.match.platform) === "WooCommerce");
  const wpIndex = ranked.findIndex((item) => normalizePlatformName(item.match.platform) === "WordPress");

  if (wooIndex > 0 && wpIndex === 0 && ranked[wooIndex].confidence >= MIN_REPORT_CONFIDENCE) {
    const [woo] = ranked.splice(wooIndex, 1);
    ranked.unshift(woo);
  }

  return ranked;
}

export function buildScanResult(
  url: string,
  finalUrl: string,
  matches: DetectorMatch[],
  hosting: string | null,
  error?: string,
): ScanResult {
  const grouped = aggregateByCanonical(matches);
  const allRanked = [...grouped.values()]
    .map((match) => {
      const confidence = scoreMatch(match);
      return { match, confidence, rankScore: computeRankScore(match, confidence) };
    })
    .sort((a, b) => b.rankScore - a.rankScore || b.confidence - a.confidence);

  let ranked = allRanked.filter(({ confidence }) => confidence >= MIN_REPORT_CONFIDENCE);

  ranked = prioritizeResults(ranked);

  const top = ranked[0];
  const candidateList = ranked.length > 0 ? ranked : allRanked;
  const alternativeStart = top ? 1 : 0;
  const alternatives: AlternativeMatch[] = candidateList
    .slice(alternativeStart, alternativeStart + 4)
    .map(({ match, confidence }) => ({
      platform: (normalizePlatformName(match.platform) ?? match.platform) as string,
      confidence,
    }));

  const frameworkMatch = ranked.find(({ match }) => match.framework && match.category === "Web Framework");
  const topPlatform = top ? (normalizePlatformName(top.match.platform) ?? top.match.platform) : null;

  return {
    url,
    finalUrl,
    platform: topPlatform,
    category: top?.match.category ?? null,
    confidence: top?.confidence ?? 0,
    hosting,
    headless: top?.match.headless ?? null,
    framework:
      ranked.find(({ match }) => match.framework && match.platform !== top?.match.platform)?.match.framework ??
      top?.match.framework ??
      frameworkMatch?.match.framework ??
      null,
    evidence: top ? [...new Set(top.match.evidence.map((item) => item.description))] : [],
    alternatives,
    rawEvidence: top?.match.evidence ?? [],
    error,
  };
}

export function mergeScanOptions(options: ScanOptions = {}): Required<
  Pick<
    ScanOptions,
    | "timeoutMs"
    | "usePlaywright"
    | "autoPlaywrightFallback"
    | "useCache"
    | "maxRetries"
    | "concurrency"
    | "probeApis"
    | "rateLimitMs"
  >
> &
  ScanOptions {
  return {
    timeoutMs: options.timeoutMs ?? 30000,
    usePlaywright: options.usePlaywright ?? false,
    autoPlaywrightFallback: options.autoPlaywrightFallback ?? true,
    useCache: options.useCache ?? true,
    maxRetries: options.maxRetries ?? 2,
    concurrency: options.concurrency ?? 4,
    probeApis: options.probeApis ?? true,
    rateLimitMs: options.rateLimitMs ?? 250,
    ...options,
  };
}
