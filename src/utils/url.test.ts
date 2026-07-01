import { describe, expect, it } from "vitest";
import { normalizeUrl, getOrigin } from "./url.js";

describe("url utils", () => {
  it("prepends https when missing", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });

  it("preserves explicit scheme", () => {
    expect(getOrigin("http://example.com/path")).toBe("http://example.com");
  });
});
