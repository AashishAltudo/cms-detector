import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("nextjs");

export class NextJsDetector extends BaseDetector {
  readonly id = "nextjs";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const matches: DetectorMatch[] = [];
    const nextDataMatch = context.artifacts.html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);

    if (nextDataMatch) {
      matches.push({
        platform: "Next.js",
        category: "Static Site Generator",
        framework: "Next.js",
        evidence: [
          {
            type: "javascript",
            platform: "Next.js",
            description: "Next.js runtime detected via __NEXT_DATA__",
            weight: EVIDENCE_WEIGHTS.javascript,
          },
        ],
      });
    }

    return matches;
  }
}

export const nextjsDetector = new NextJsDetector();
