import { describe, expect, it } from "vitest";
import { nextjsDetector } from "./nextjs.js";
import { createContext } from "../test/helpers.js";

describe("NextJsDetector", () => {
  it("detects __NEXT_DATA__ bootstrap payload", async () => {
    const matches = await nextjsDetector.detect(
      createContext({
        html: '<script id="__NEXT_DATA__" type="application/json">{"props":{}}</script>',
      }),
    );

    expect(matches.some((match) => match.platform === "Next.js")).toBe(true);
  });
});
