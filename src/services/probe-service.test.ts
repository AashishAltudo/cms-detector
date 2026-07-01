import { describe, expect, it } from "vitest";
import { evaluateProbeMatch } from "./probe-service.js";

describe("evaluateProbeMatch", () => {
  it("does not match Sitecore API on generic 403 responses", () => {
    const matched = evaluateProbeMatch(
      403,
      "<html><body>Forbidden</body></html>",
      {
        platform: "Sitecore",
        path: "/sitecore/api/ssc/item",
        pattern: /sitecore|Sitecore|"ItemId"|"ItemName"|"Database"/i,
        successStatuses: [200, 401],
      },
    );

    expect(matched).toBe(false);
  });

  it("does not match JSS render endpoint on generic 404", () => {
    const matched = evaluateProbeMatch(
      404,
      "<html><body>Not Found</body></html>",
      {
        platform: "Sitecore",
        path: "/-/jss/render",
        pattern: /sitecore|jss|layoutService|Layout Service/i,
        successStatuses: [200],
      },
    );

    expect(matched).toBe(false);
  });

  it("matches WordPress REST API with valid JSON body", () => {
    const matched = evaluateProbeMatch(
      200,
      '{"namespaces":["wp/v2"],"routes":{}}',
      {
        platform: "WordPress",
        path: "/wp-json/",
        pattern: /"namespaces"/,
        successStatuses: [200],
      },
    );

    expect(matched).toBe(true);
  });
});
