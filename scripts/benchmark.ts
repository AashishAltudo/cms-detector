import { scanUrl } from "../src/scanner.js";

const SITES = [
  "https://wordpress.org",
  "https://www.drupal.org",
  "https://www.shopify.com",
  "https://www.wix.com",
  "https://webflow.com",
];

async function main(): Promise<void> {
  console.log("CMS/DXP Detector Benchmark\n");

  for (const url of SITES) {
    const started = Date.now();
    const result = await scanUrl(url, { probeApis: true, usePlaywright: false });
    const elapsed = Date.now() - started;

    console.log(`URL: ${url}`);
    console.log(`Platform: ${result.platform ?? "Unknown"} (${result.confidence}%)`);
    console.log(`Category: ${result.category ?? "n/a"}`);
    console.log(`Duration: ${elapsed}ms`);
    if (result.evidence.length > 0) {
      console.log(`Evidence: ${result.evidence.slice(0, 3).join(" | ")}`);
    }
    console.log("");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
