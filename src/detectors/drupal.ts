import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("drupal");

export class DrupalDetector extends BaseDetector {
  readonly id = "drupal";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const jsonApiProbe = context.artifacts.probes.find((probe) => probe.path === "/jsonapi");
    if (!jsonApiProbe?.matched) return [];

    return [
      {
        platform: "Drupal",
        category: "Traditional CMS",
        evidence: [
          {
            type: "cms_api",
            platform: "Drupal",
            description: "Drupal JSON:API endpoint discovered",
            weight: EVIDENCE_WEIGHTS.cms_api,
          },
        ],
      },
    ];
  }
}

export const drupalDetector = new DrupalDetector();
