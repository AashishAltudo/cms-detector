import { getRequiredSignature } from "../signatures/platforms.js";
import { matchSignature } from "../engine/confidence-engine.js";
import { BaseDetector } from "./base.js";
import type { DetectionContext, DetectorMatch } from "../types/index.js";
import { EVIDENCE_WEIGHTS } from "../signatures/weights.js";

const sitecoreXp = getRequiredSignature("sitecore-xp");
const sitecoreJss = getRequiredSignature("sitecore-jss");

export class SitecoreDetector extends BaseDetector {
  readonly id = "sitecore";

  constructor() {
    super(sitecoreXp);
  }

  protected override async detectExtra(context: DetectionContext): Promise<DetectorMatch[]> {
    const matches: DetectorMatch[] = [];
    const html = context.artifacts.html;
    const scripts = context.artifacts.scripts.join("\n");
    const blob = `${html}\n${scripts}`;

    const jssMatch = matchSignature(sitecoreJss, context);
    if (jssMatch) matches.push(jssMatch);

    const strong = (platform: string, description: string): DetectorMatch => ({
      platform,
      category: "Enterprise DXP",
      headless: true,
      evidence: [
        { type: "js_sdk", platform, description, weight: EVIDENCE_WEIGHTS.js_sdk },
      ],
    });

    // Sitecore XM Cloud (headless SaaS): the Content/Experience Edge and Pages
    // hosts are unambiguous — no generic web page references these.
    if (/\bxmcloud\b/i.test(blob) || /(?:edge|pages|[\w.-]*)\.sitecorecloud\.io/i.test(blob)) {
      matches.push(strong("Sitecore XM Cloud", "Sitecore XM Cloud (Experience Edge) endpoint detected"));
    }

    // Sitecore JSS / headless layout: SDK packages, Layout Service, or the
    // sitecoreContext object embedded in the JSS/Next.js data payload.
    if (
      /@sitecore-jss|@sitecore\/(?:nextjs|react)|Sitecore\.JSS|Sitecore\.LayoutService|Layout Service/i.test(
        blob,
      ) ||
      /["']sitecoreContext["']|["']sitecore["']\s*:\s*\{\s*["']context["']/i.test(blob)
    ) {
      matches.push(strong("Sitecore JSS", "Sitecore JSS headless layout markers detected"));
    }

    // Classic Sitecore-managed markup rendered client-side.
    if (/\/-\/media\/|\/~\/media\/|Sitecore\.PageModes|data-sc-/i.test(blob)) {
      matches.push(strong("Sitecore XP", "Sitecore-managed markup detected"));
    }

    return matches;
  }
}

export const sitecoreDetector = new SitecoreDetector();
