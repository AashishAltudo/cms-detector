import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("shopify");

export class ShopifyDetector extends BaseDetector {
  readonly id = "shopify";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const matches: DetectorMatch[] = [];
    const cartProbe = context.artifacts.probes.find((probe) => probe.path === "/cart.js");

    if (cartProbe?.matched) {
      matches.push({
        platform: "Shopify",
        category: "Commerce Platform",
        evidence: [
          {
            type: "cms_api",
            platform: "Shopify",
            description: "Shopify cart.js endpoint discovered",
            weight: EVIDENCE_WEIGHTS.cms_api,
          },
        ],
      });
    }

    if (/@shopify\/hydrogen/i.test(context.artifacts.scripts.join("\n"))) {
      matches.push({
        platform: "Shopify Hydrogen",
        category: "Commerce Platform",
        headless: true,
        framework: "React",
        evidence: [
          {
            type: "js_sdk",
            platform: "Shopify Hydrogen",
            description: "Shopify Hydrogen runtime detected",
            weight: EVIDENCE_WEIGHTS.js_sdk,
          },
        ],
      });
    }

    return matches;
  }
}

export const shopifyDetector = new ShopifyDetector();
