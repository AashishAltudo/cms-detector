import { getRequiredSignature } from "../signatures/platforms.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const signature = getRequiredSignature("aem");

export class AemDetector extends BaseDetector {
  readonly id = "aem";

  constructor() {
    super(signature);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const matches: DetectorMatch[] = [];
    const html = context.artifacts.html;

    if (/adobe experience manager as a cloud service|aem cloud/i.test(html)) {
      matches.push({
        platform: "Adobe Experience Manager as a Cloud Service",
        category: "Enterprise DXP",
        evidence: [
          {
            type: "html_signature",
            platform: "Adobe Experience Manager as a Cloud Service",
            description: "AEM Cloud Service signature detected",
            weight: EVIDENCE_WEIGHTS.html_signature,
          },
        ],
      });
    }

    if (/etc\.clientlibs|\/content\/dam\/|granite\.js/i.test(html)) {
      matches.push({
        platform: "Adobe Experience Manager",
        category: "Enterprise DXP",
        evidence: [
          {
            type: "asset_folder",
            platform: "Adobe Experience Manager",
            description: "Adobe ClientLibs or DAM path detected",
            weight: EVIDENCE_WEIGHTS.asset_folder,
          },
        ],
      });
    }

    const graphqlProbe = context.artifacts.probes.find((probe) => probe.path.includes("graphql"));
    if (graphqlProbe?.matched && /aem|adobe/i.test(html)) {
      matches.push({
        platform: "Adobe Experience Manager",
        category: "Enterprise DXP",
        evidence: [
          {
            type: "cms_api",
            platform: "Adobe Experience Manager",
            description: "Adobe GraphQL endpoint discovered",
            weight: EVIDENCE_WEIGHTS.cms_api,
          },
        ],
      });
    }

    return matches;
  }
}

export const aemDetector = new AemDetector();
