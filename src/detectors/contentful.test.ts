import { describe, expect, it } from "vitest";
import { contentfulDetector } from "./contentful.js";
import { createContext } from "../test/helpers.js";

describe("ContentfulDetector", () => {
  it("detects Contentful CDN assets", async () => {
    const matches = await contentfulDetector.detect(
      createContext({
        html: '<img src="https://images.ctfassets.net/abc/image.png" />',
      }),
    );

    expect(matches[0]?.platform).toBe("Contentful");
  });
});
