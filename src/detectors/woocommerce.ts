import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("woocommerce");

export class WooCommerceDetector extends BaseDetector {
  readonly id = "woocommerce";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const html = context.artifacts.html;
    const scripts = context.artifacts.scripts.join("\n");

    if (!/woocommerce|wc-cart-fragments|wc_add_to_cart_params/i.test(html + scripts)) {
      return [];
    }

    const wcApiProbe = context.artifacts.probes.find(
      (probe) =>
        probe.matched &&
        (probe.path === "/wp-json/wc/store/v1/products" || probe.path === "/wp-json/wc/v3/products"),
    );

    const matches: DetectorMatch[] = [
      {
        platform: "WooCommerce",
        category: "Commerce Platform",
        evidence: [
          {
            type: "html_signature",
            platform: "WooCommerce",
            description: "WooCommerce plugin assets detected",
            weight: EVIDENCE_WEIGHTS.html_signature,
          },
        ],
      },
    ];

    if (wcApiProbe) {
      matches.push({
        platform: "WooCommerce",
        category: "Commerce Platform",
        evidence: [
          {
            type: "cms_api",
            platform: "WooCommerce",
            description: "WooCommerce Store API detected",
            weight: EVIDENCE_WEIGHTS.cms_api,
          },
        ],
      });
    }

    return matches;
  }
}

export const woocommerceDetector = new WooCommerceDetector();
