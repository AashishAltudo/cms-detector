import { describe, expect, it } from "vitest";
import { aemDetector } from "./aem.js";
import { createContext } from "../test/helpers.js";

describe("AemDetector", () => {
  it("detects AEM clientlibs and DAM paths", async () => {
    const matches = await aemDetector.detect(
      createContext({
        html: '<script src="/etc.clientlibs/core/wcm/components/content.js"></script>',
      }),
    );

    expect(matches.some((match) => match.platform.includes("Adobe Experience Manager"))).toBe(true);
  });
});
