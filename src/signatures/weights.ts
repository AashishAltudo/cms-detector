import type { EvidenceType } from "../types/index.js";

/**
 * Display weights (0-100) shown to users as a rough "importance" of each signal.
 * These are NOT used directly for probability math — see TYPE_RELIABILITY.
 */
export const EVIDENCE_WEIGHTS: Record<EvidenceType, number> = {
  generator_meta: 100,
  cms_api: 95,
  cookie: 80,
  js_sdk: 80,
  asset_folder: 70,
  http_header: 65,
  html_signature: 60,
  dns_hosting: 40,
  manifest: 55,
  javascript: 75,
  comment: 50,
};

/**
 * Reliability = P(platform is correct | a single signal of this type matched).
 *
 * Used by the noisy-OR confidence model. Strong, explicit signals (generator
 * meta tag, a confirmed CMS API response, a platform-specific cookie or SDK)
 * are highly reliable. Generic signals (a keyword appearing somewhere in HTML)
 * are weak on their own and only build confidence when they corroborate.
 */
export const TYPE_RELIABILITY: Record<EvidenceType, number> = {
  generator_meta: 0.94,
  cms_api: 0.9,
  js_sdk: 0.8,
  cookie: 0.74,
  http_header: 0.72,
  javascript: 0.68,
  asset_folder: 0.55,
  comment: 0.5,
  manifest: 0.42,
  html_signature: 0.4,
  dns_hosting: 0.25,
};

/**
 * Signal types that, on their own, are strong enough to trust. When a match
 * contains none of these, it is treated as "circumstantial" and capped lower.
 */
export const STRONG_EVIDENCE_TYPES: ReadonlySet<EvidenceType> = new Set<EvidenceType>([
  "generator_meta",
  "cms_api",
  "js_sdk",
  "cookie",
  "http_header",
]);

/**
 * Diminishing-returns multiplier for the Nth (0-indexed) piece of evidence of
 * the same type. The first counts fully; each additional one of the same type
 * contributes progressively less, so ten generic HTML hits cannot masquerade
 * as certainty.
 */
export function repeatDecay(indexWithinType: number): number {
  if (indexWithinType <= 0) return 1;
  return Math.pow(0.4, indexWithinType);
}

export function normalizeConfidence(rawScore: number, maxPossible: number): number {
  if (maxPossible <= 0) return 0;
  const ratio = rawScore / maxPossible;
  return Math.min(100, Math.round(ratio * 100));
}
