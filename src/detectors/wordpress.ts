import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("wordpress");

export class WordPressDetector extends BaseDetector {
  readonly id = "wordpress";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const matches: DetectorMatch[] = [];
    const wpJsonProbe = context.artifacts.probes.find((probe) => probe.path === "/wp-json/");

    if (wpJsonProbe?.matched) {
      matches.push({
        platform: "WordPress",
        category: "Traditional CMS",
        evidence: [
          {
            type: "cms_api",
            platform: "WordPress",
            description: "WordPress REST API detected at /wp-json/",
            weight: EVIDENCE_WEIGHTS.cms_api,
          },
        ],
      });
    }

    if (/<!--\s*This site is optimized with the Yoast SEO plugin/i.test(context.artifacts.html)) {
      matches.push({
        platform: "WordPress",
        category: "Traditional CMS",
        evidence: [
          {
            type: "comment",
            platform: "WordPress",
            description: "Yoast SEO plugin comment detected",
            weight: EVIDENCE_WEIGHTS.comment,
          },
        ],
      });
    }

    return matches;
  }
}

export const wordpressDetector = new WordPressDetector();
