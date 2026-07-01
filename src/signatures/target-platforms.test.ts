import { describe, expect, it } from "vitest";
import { TARGET_PLATFORMS, normalizePlatformName } from "./target-platforms.js";
import { getSignatureById } from "./platforms.js";

describe("target platforms", () => {
  it("lists all requested CMS platforms", () => {
    expect(TARGET_PLATFORMS).toHaveLength(38);
    expect(TARGET_PLATFORMS).toContain("WordPress");
    expect(TARGET_PLATFORMS).toContain("Shopware");
    expect(TARGET_PLATFORMS).toContain("WooCommerce");
    expect(TARGET_PLATFORMS).toContain("Craft CMS");
    expect(TARGET_PLATFORMS).toContain("Znode");
    expect(TARGET_PLATFORMS).toContain("Q4 Web");
  });

  it("normalizes Sitecore variants to Sitecore", () => {
    expect(normalizePlatformName("Sitecore JSS")).toBe("Sitecore");
    expect(normalizePlatformName("Sitecore XP")).toBe("Sitecore");
  });

  it("normalizes AEM variants to Adobe Experience Manager", () => {
    expect(normalizePlatformName("Adobe Experience Manager as a Cloud Service")).toBe(
      "Adobe Experience Manager",
    );
  });

  it("has signatures for newly added platforms", () => {
    expect(getSignatureById("craft-cms")).toBeDefined();
    expect(getSignatureById("shopware")).toBeDefined();
    expect(getSignatureById("woocommerce")).toBeDefined();
    expect(getSignatureById("znode")).toBeDefined();
    expect(getSignatureById("q4web")).toBeDefined();
  });
});
