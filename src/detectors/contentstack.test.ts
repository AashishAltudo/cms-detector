import { describe, expect, it } from "vitest";
import { contentstackDetector } from "./contentstack.js";
import { createContext } from "../test/helpers.js";

describe("ContentstackDetector", () => {
  it("detects Contentstack SDK references", async () => {
    const matches = await contentstackDetector.detect(
      createContext({
        html: "https://cdn.contentstack.io/v3/assets",
        scripts: ["Contentstack.Stack()"],
      }),
    );

    expect(matches[0]?.platform).toBe("Contentstack");
  });
});
