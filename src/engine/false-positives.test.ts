import { describe, expect, it } from "vitest";
import { matchSignature } from "./confidence-engine.js";
import { buildScanResult } from "./result-builder.js";
import { getSignatureById } from "../signatures/platforms.js";
import { ALL_DETECTORS } from "../detectors/index.js";
import { createContext } from "../test/helpers.js";
import type { DetectorMatch } from "../types/index.js";

describe("false positive prevention", () => {
  it("does not match Sitecore on generic WordPress HTML", () => {
    const sitecore = getSignatureById("sitecore-xp");
    expect(sitecore).toBeDefined();

    const match = matchSignature(
      sitecore!,
      createContext({
        html: `
          <html>
            <meta name="generator" content="WordPress 6.7" />
            <link href="/wp-content/themes/twentytwenty/style.css" />
          </html>
        `,
        metaGenerator: ["WordPress 6.7"],
        probes: [
          { path: "/sitecore/api/ssc/item", platform: "Sitecore", status: 403, matched: false },
          { path: "/-/jss/render", platform: "Sitecore", status: 404, matched: false },
        ],
      }),
    );

    expect(match).toBeNull();
  });

  it("does not match Drupal on WordPress /themes/ paths", () => {
    const drupal = getSignatureById("drupal");
    const match = matchSignature(
      drupal!,
      createContext({
        html: '<link href="/wp-content/themes/twentytwenty/style.css" rel="stylesheet" />',
      }),
    );

    expect(match).toBeNull();
  });

  it("does not match Strapi on generic /api JSON responses", () => {
    const strapi = getSignatureById("strapi");
    const match = matchSignature(
      strapi!,
      createContext({
        html: "<html></html>",
        probes: [
          {
            path: "/api",
            platform: "Strapi",
            status: 200,
            matched: false,
            snippet: '{"data":[{"id":1}]}',
          },
        ],
      }),
    );

    expect(match).toBeNull();
  });

  it("ranks WordPress above Sitecore and React on typical WordPress HTML", () => {
    const wordpress = getSignatureById("wordpress");
    const sitecore = getSignatureById("sitecore-xp");
    const react = getSignatureById("react");

    const context = createContext({
      html: `
        <meta name="generator" content="WordPress 6.7" />
        <link href="/wp-content/themes/style.css" />
        <script src="/wp-includes/js/wp-emoji-release.min.js"></script>
      `,
      metaGenerator: ["WordPress 6.7"],
      probes: [
        {
          path: "/wp-json/",
          platform: "WordPress",
          status: 200,
          matched: true,
          snippet: '{"namespaces":["wp/v2"]}',
        },
        { path: "/sitecore/api/ssc/item", platform: "Sitecore", status: 403, matched: false },
      ],
    });

    const wpMatch = matchSignature(wordpress!, context);
    const scMatch = matchSignature(sitecore!, context);
    const reactMatch = matchSignature(react!, context);

    expect(wpMatch).not.toBeNull();
    expect(scMatch).toBeNull();
    expect(reactMatch).toBeNull();

    const result = buildScanResult(
      "https://wordpress.org",
      "https://wordpress.org",
      [wpMatch!, scMatch, reactMatch].filter(Boolean) as DetectorMatch[],
      null,
    );

    expect(result.platform).toBe("WordPress");
  });

  it("does not report enterprise DXP on a single weak HTML hit alone", () => {
    const weakMatch: DetectorMatch = {
      platform: "Sitecore XP",
      category: "Enterprise DXP",
      evidence: [
        {
          type: "html_signature",
          platform: "Sitecore XP",
          description: "HTML signature: layout",
          weight: 60,
        },
      ],
    };

    const result = buildScanResult("https://example.com", "https://example.com", [weakMatch], null);
    expect(result.platform).toBeNull();
  });
});

describe("detector registry", () => {
  it("does not include duplicate Sitecore signatures in the registry pass", () => {
    const sitecoreIds = ["sitecore-xm", "sitecore-xm-cloud", "sitecore-headless"];
    for (const id of sitecoreIds) {
      expect(ALL_DETECTORS.some((detector) => detector.id === id)).toBe(false);
    }
  });
});
