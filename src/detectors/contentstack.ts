import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("contentstack");

export class ContentstackDetector extends BaseDetector {
  readonly id = "contentstack";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    if (!/contentstack/i.test(context.artifacts.scripts.join("\n") + context.artifacts.html)) {
      return [];
    }

    return [
      {
        platform: "Contentstack",
        category: "Enterprise DXP",
        headless: true,
        evidence: [
          {
            type: "js_sdk",
            platform: "Contentstack",
            description: "Contentstack SDK loaded",
            weight: EVIDENCE_WEIGHTS.js_sdk,
          },
        ],
      },
    ];
  }
}

export const contentstackDetector = new ContentstackDetector();
