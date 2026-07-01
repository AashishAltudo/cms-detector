import { describe, expect, it } from "vitest";
import { aggregateMatches, scoreMatch } from "./confidence-engine.js";
import type { DetectorMatch } from "../types/index.js";

describe("confidence-engine", () => {
  it("scores stronger evidence higher", () => {
    const match: DetectorMatch = {
      platform: "WordPress",
      category: "Traditional CMS",
      evidence: [
        { type: "generator_meta", platform: "WordPress", description: "Generator", weight: 100 },
        { type: "cms_api", platform: "WordPress", description: "API", weight: 95 },
      ],
    };

    expect(scoreMatch(match)).toBeGreaterThan(60);
  });

  it("aggregates duplicate platform evidence", () => {
    const grouped = aggregateMatches([
      {
        platform: "Drupal",
        category: "Traditional CMS",
        evidence: [{ type: "html_signature", platform: "Drupal", description: "a", weight: 60 }],
      },
      {
        platform: "Drupal",
        category: "Traditional CMS",
        evidence: [{ type: "cookie", platform: "Drupal", description: "b", weight: 80 }],
      },
    ]);

    expect(grouped.get("Drupal")?.evidence).toHaveLength(2);
  });
});
