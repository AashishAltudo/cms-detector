import { PLATFORM_SIGNATURES } from "../signatures/platforms.js";
import { matchSignature } from "../engine/confidence-engine.js";
import type { DetectionContext, DetectorMatch, PlatformDetector } from "../types/index.js";

const ENHANCED_IDS = new Set([
  "wordpress",
  "woocommerce",
  "drupal",
  "craft-cms",
  "shopware",
  "znode",
  "q4web",
  "sitecore-xp",
  "sitecore-xm",
  "sitecore-xm-cloud",
  "sitecore-headless",
  "sitecore-jss",
  "aem",
  "aem-cloud",
  "contentstack",
  "contentful",
  "shopify",
  "shopify-hydrogen",
  "nextjs",
]);

export class SignatureRegistryDetector implements PlatformDetector {
  readonly id = "signature-registry";

  async detect(context: DetectionContext): Promise<DetectorMatch[]> {
    return PLATFORM_SIGNATURES.filter((signature) => !ENHANCED_IDS.has(signature.id))
      .map((signature) => matchSignature(signature, context))
      .filter((match): match is DetectorMatch => match !== null);
  }
}

export const signatureRegistryDetector = new SignatureRegistryDetector();
