import { describe, expect, it } from "vitest";
import { shopifyDetector } from "./shopify.js";
import { createContext } from "../test/helpers.js";

describe("ShopifyDetector", () => {
  it("detects Shopify storefront and cart API", async () => {
    const matches = await shopifyDetector.detect(
      createContext({
        html: '<script src="https://cdn.shopify.com/s/files/1/theme.js"></script>',
        cookies: { _shopify_y: "abc" },
        probes: [{ path: "/cart.js", status: 200, matched: true }],
      }),
    );

    expect(matches.some((match) => match.platform === "Shopify")).toBe(true);
  });
});
