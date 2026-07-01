import type { DetectorMatch, DetectionContext, Evidence, PlatformSignature } from "../types/index.js";
import {
  EVIDENCE_WEIGHTS,
  STRONG_EVIDENCE_TYPES,
  TYPE_RELIABILITY,
  repeatDecay,
} from "../signatures/weights.js";

function addEvidence(
  bucket: Evidence[],
  type: Evidence["type"],
  platform: string,
  description: string,
): void {
  bucket.push({
    type,
    platform,
    description,
    weight: EVIDENCE_WEIGHTS[type],
  });
}

export function matchSignature(
  signature: PlatformSignature,
  context: DetectionContext,
): DetectorMatch | null {
  const { artifacts } = context;
  const evidence: Evidence[] = [];
  const haystack = {
    html: `${artifacts.html}\n${artifacts.resourceUrls}`,
    scripts: artifacts.scripts.join("\n"),
    comments: artifacts.comments.join("\n"),
    generators: artifacts.metaGenerator.join("\n"),
    headers: Object.entries(artifacts.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n"),
    cookies: Object.entries(artifacts.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n"),
    robots: artifacts.robotsTxt ?? "",
    jsGlobals: artifacts.jsGlobals.join("\n"),
  };

  for (const pattern of signature.metaGenerator ?? []) {
    if (pattern.test(haystack.generators)) {
      addEvidence(evidence, "generator_meta", signature.name, `Generator meta matches ${signature.name}`);
    }
  }

  for (const pattern of signature.html ?? []) {
    const match = pattern.exec(haystack.html);
    if (match) {
      addEvidence(evidence, "html_signature", signature.name, `HTML signature: ${match[0]}`);
    }
  }

  for (const pattern of signature.comments ?? []) {
    const match = pattern.exec(haystack.comments);
    if (match) {
      addEvidence(evidence, "comment", signature.name, `HTML comment: ${match[0].slice(0, 80)}`);
    }
  }

  for (const pattern of signature.scripts ?? []) {
    const match = pattern.exec(haystack.scripts);
    if (match) {
      addEvidence(evidence, "js_sdk", signature.name, `JavaScript SDK: ${match[0]}`);
    }
  }

  for (const pattern of signature.assetPaths ?? []) {
    const match = pattern.exec(haystack.html);
    if (match) {
      addEvidence(evidence, "asset_folder", signature.name, `Asset path: ${match[0]}`);
    }
  }

  for (const { name, pattern } of signature.headers ?? []) {
    const headerValue = artifacts.headers[name.toLowerCase()];
    if (headerValue && pattern.test(headerValue)) {
      addEvidence(evidence, "http_header", signature.name, `Header ${name}: ${headerValue}`);
    }
  }

  for (const pattern of signature.cookies ?? []) {
    const cookieName = Object.keys(artifacts.cookies).find((name) => pattern.test(name));
    if (cookieName) {
      addEvidence(evidence, "cookie", signature.name, `Cookie: ${cookieName}`);
    }
  }

  for (const pattern of signature.robots ?? []) {
    if (pattern.test(haystack.robots)) {
      addEvidence(evidence, "manifest", signature.name, "robots.txt signature matched");
    }
  }

  for (const pattern of signature.jsGlobals ?? []) {
    const global = artifacts.jsGlobals.find((name) => pattern.test(name));
    if (global) {
      addEvidence(evidence, "javascript", signature.name, `Global JS object: ${global}`);
    }
  }

  for (const endpoint of signature.apiEndpoints ?? []) {
    const probeHit = artifacts.probes.some(
      (probe) =>
        probe.matched &&
        probe.path === endpoint.path &&
        platformNamesAlign(probe.platform, signature.name),
    );
    if (probeHit) {
      addEvidence(evidence, "cms_api", signature.name, `API endpoint discovered: ${endpoint.path}`);
    }
  }

  if (evidence.length === 0) return null;

  return {
    platform: signature.name,
    category: signature.category,
    headless: signature.headless,
    framework: signature.framework,
    evidence,
  };
}

function platformNamesAlign(probePlatform: string | undefined, signatureName: string): boolean {
  if (!probePlatform) return true;

  const probe = probePlatform.toLowerCase();
  const signature = signatureName.toLowerCase();

  if (signature.includes(probe) || probe.includes(signature.split(" ")[0] ?? "")) {
    return true;
  }

  // e.g. probe "Sitecore" applies to "Sitecore XP", "Sitecore JSS"
  if (probe === "sitecore" && signature.includes("sitecore")) return true;
  if (probe === "wordpress" && signature.includes("wordpress")) return true;
  if (probe === "woocommerce" && signature.includes("woocommerce")) return true;
  if (probe.includes("adobe") && signature.includes("adobe")) return true;

  return false;
}

export function aggregateMatches(matches: DetectorMatch[]): Map<string, DetectorMatch> {
  const grouped = new Map<string, DetectorMatch>();

  for (const match of matches) {
    const existing = grouped.get(match.platform);
    if (!existing) {
      grouped.set(match.platform, { ...match, evidence: [...match.evidence] });
      continue;
    }

    existing.evidence.push(...match.evidence);
    existing.headless = existing.headless || match.headless;
    existing.framework = existing.framework ?? match.framework;
  }

  return grouped;
}

/**
 * Confidence via a noisy-OR probabilistic model.
 *
 * Each unique piece of evidence has a reliability p (see TYPE_RELIABILITY).
 * Assuming rough independence, the probability that ALL signals are misleading
 * is Π(1 - p_i); confidence is the complement of that. Repeated signals of the
 * same type get diminishing weight so that a pile of generic HTML keyword hits
 * cannot fabricate certainty — you need either one strong, explicit signal or
 * several corroborating ones.
 */
export function scoreMatch(match: DetectorMatch): number {
  const uniqueEvidence = new Map<string, Evidence>();
  for (const item of match.evidence) {
    uniqueEvidence.set(`${item.type}:${item.description}`, item);
  }
  const evidenceList = [...uniqueEvidence.values()];
  if (evidenceList.length === 0) return 0;

  const countByType = new Map<Evidence["type"], number>();
  let complement = 1;
  for (const item of evidenceList) {
    const seen = countByType.get(item.type) ?? 0;
    countByType.set(item.type, seen + 1);
    const reliability = TYPE_RELIABILITY[item.type] ?? 0.4;
    const effective = reliability * repeatDecay(seen);
    complement *= 1 - effective;
  }

  let confidence = (1 - complement) * 100;

  const hasStrongSignal = evidenceList.some((item) => STRONG_EVIDENCE_TYPES.has(item.type));

  // Circumstantial matches (only generic HTML/asset/manifest hits) are capped so
  // that a purely keyword-based guess never reads as near-certain.
  if (!hasStrongSignal) {
    if (match.category === "Enterprise DXP") {
      confidence = evidenceList.length <= 1 ? confidence * 0.35 : Math.min(confidence, 55);
    } else if (match.category === "Web Framework") {
      confidence = evidenceList.length <= 1 ? confidence * 0.5 : Math.min(confidence, 60);
    } else if (evidenceList.length <= 1) {
      confidence = Math.min(confidence, 55);
    } else {
      confidence = Math.min(confidence, 80);
    }
  }

  return Math.max(0, Math.min(100, Math.round(confidence)));
}
