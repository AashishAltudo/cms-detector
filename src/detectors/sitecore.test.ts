import { describe, expect, it } from "vitest";
import { sitecoreDetector } from "./sitecore.js";
import { createContext } from "../test/helpers.js";

describe("SitecoreDetector", () => {
  it("detects Sitecore JSS when explicit SDK markers are present", async () => {
    const matches = await sitecoreDetector.detect(
      createContext({
        html: '<script>@sitecore-jss/sitecore-jss-react</script>',
        scripts: ["@sitecore-jss/sitecore-jss-react"],
        probes: [
          {
            path: "/sitecore/api/ssc/item",
            platform: "Sitecore",
            status: 401,
            matched: true,
            snippet: '{"Sitecore":"unauthorized"}',
          },
        ],
      }),
    );

    const platforms = matches.map((match) => match.platform);
    expect(platforms.some((name) => name.includes("Sitecore"))).toBe(true);
  });

  it("does not detect Sitecore on unrelated HTML", async () => {
    const matches = await sitecoreDetector.detect(
      createContext({
        html: '<html><body><h1>Hello WordPress</h1><link href="/wp-content/style.css" /></body></html>',
        probes: [
          { path: "/sitecore/api/ssc/item", platform: "Sitecore", status: 403, matched: false },
        ],
      }),
    );

    expect(matches).toHaveLength(0);
  });
});
