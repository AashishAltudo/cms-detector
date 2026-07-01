import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("contentful");

export class ContentfulDetector extends BaseDetector {
  readonly id = "contentful";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const blob = context.artifacts.scripts.join("\n") + context.artifacts.html;
    if (!/contentful|ctfassets/i.test(blob)) return [];

    return [
      {
        platform: "Contentful",
        category: "Enterprise DXP",
        headless: true,
        evidence: [
          {
            type: "js_sdk",
            platform: "Contentful",
            description: "Contentful SDK or CDN assets detected",
            weight: EVIDENCE_WEIGHTS.js_sdk,
          },
        ],
      },
    ];
  }
}

export const contentfulDetector = new ContentfulDetector();
