import { describe, expect, it } from "vitest";
import { drupalDetector } from "./drupal.js";
import { createContext } from "../test/helpers.js";

describe("DrupalDetector", () => {
  it("detects Drupal generator and JSON:API", async () => {
    const matches = await drupalDetector.detect(
      createContext({
        metaGenerator: ["Drupal 10"],
        html: '<script src="/core/misc/drupal.js"></script>',
        probes: [{ path: "/jsonapi", status: 200, matched: true }],
      }),
    );

    expect(matches.some((match) => match.platform === "Drupal")).toBe(true);
  });
});
