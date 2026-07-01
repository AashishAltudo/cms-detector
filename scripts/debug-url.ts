import { scanUrl } from "../src/scanner.js";
import { HttpClient } from "../src/services/http-client.js";
import { analyzeHtml } from "../src/services/html-analyzer.js";
import { PlaywrightService } from "../src/services/playwright-service.js";

const url = process.argv[2] ?? "https://www.drupal.org";
const keywords = (process.argv[3] ?? "drupal,wordpress,sites/default/files,drupalSettings,data-drupal,/core/,demandware,shopify,__NEXT,sitecore,wp-content")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const http = new HttpClient();
const res = await http.get(url);
const parsed = analyzeHtml(res);
const httpHaystack = `${parsed.html}\n${parsed.resourceUrls}\n${parsed.scripts.join("\n")}`;

console.log("URL:", res.finalUrl, "| status:", res.status);
console.log("HTTP html length:", parsed.html.length);
console.log("meta generator:", parsed.metaGenerator);
console.log("interesting headers:", Object.fromEntries(
  Object.entries(res.headers).filter(([k]) => /server|powered|generator|drupal|aem|sitecore|acquia|pantheon|via|x-/i.test(k)),
));
console.log("cookies:", Object.keys(res.cookies));
console.log("HTTP keyword hits:", keywords.filter((k) => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(httpHaystack)));

const pw = new PlaywrightService();
try {
  const rendered = await pw.render(res.finalUrl, 30000);
  console.log("PW html length:", rendered.html.length);
  console.log("PW keyword hits:", keywords.filter((k) => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(rendered.html)));
} catch (e) {
  console.log("PW error:", (e as Error).message);
}
await pw.close();

const result = await scanUrl(url);
console.log("\nScan:", JSON.stringify({ platform: result.platform, confidence: result.confidence, alternatives: result.alternatives, evidence: result.evidence, error: result.error }, null, 2));
