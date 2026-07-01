import { PLATFORM_SIGNATURES } from "../signatures/platforms.js";
import { aemDetector } from "./aem.js";
import { contentfulDetector } from "./contentful.js";
import { contentstackDetector } from "./contentstack.js";
import { drupalDetector } from "./drupal.js";
import { woocommerceDetector } from "./woocommerce.js";
import { nextjsDetector } from "./nextjs.js";
import { shopifyDetector } from "./shopify.js";
import { sitecoreDetector } from "./sitecore.js";
import { signatureRegistryDetector } from "./signature-registry.js";
import { wordpressDetector } from "./wordpress.js";
import type { PlatformDetector } from "../types/index.js";

export const ENHANCED_DETECTORS: PlatformDetector[] = [
  wordpressDetector,
  woocommerceDetector,
  drupalDetector,
  sitecoreDetector,
  aemDetector,
  contentstackDetector,
  contentfulDetector,
  shopifyDetector,
  nextjsDetector,
  signatureRegistryDetector,
];

export const ALL_DETECTORS: PlatformDetector[] = ENHANCED_DETECTORS;

export { PLATFORM_SIGNATURES };

export function getDetectorById(id: string): PlatformDetector | undefined {
  return ALL_DETECTORS.find((detector) => detector.id === id);
}
