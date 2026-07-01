import { describe, expect, it } from "vitest";
import { wordpressDetector } from "../detectors/wordpress.js";
import { createContext } from "../test/helpers.js";

describe("WordPressDetector", () => {
  it("detects generator meta and wp-content paths", async () => {
    const context = createContext({
      metaGenerator: ["WordPress 6.7"],
      html: '<link href="/wp-content/themes/twentytwentyfour/style.css" />',
      probes: [{ path: "/wp-json/", status: 200, matched: true }],
    });

    const matches = await wordpressDetector.detect(context);
    expect(matches.some((match) => match.platform === "WordPress")).toBe(true);
    expect(matches.flatMap((match) => match.evidence).some((item) => item.type === "cms_api")).toBe(true);
  });

  it("returns empty when no WordPress signals exist", async () => {
    const matches = await wordpressDetector.detect(createContext({ html: "<html></html>" }));
    expect(matches).toHaveLength(0);
  });
});
