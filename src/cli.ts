#!/usr/bin/env node
import { Command } from "commander";
import { scanUrl, scanUrls } from "./scanner.js";
import type { ScanResult } from "./types/index.js";

const program = new Command();

program
  .name("cms-detect")
  .description("Detect CMS, DXP, SSG, and web framework platforms from a website URL")
  .argument("[urls...]", "Website URL(s) to scan")
  .option("--json", "Output JSON")
  .option("--playwright", "Use Playwright for client-side rendering", false)
  .option("--no-probe", "Disable API endpoint probing")
  .option("--no-cache", "Disable response cache")
  .option("--timeout <ms>", "Request timeout in milliseconds", "30000")
  .option("--concurrency <n>", "Parallel concurrency", "4")
  .option("--min-confidence <n>", "Minimum confidence to display a match", "0")
  .action(async (urls: string[], options) => {
    if (urls.length === 0) {
      program.help();
      return;
    }

    const scanOptions = {
      usePlaywright: Boolean(options.playwright),
      probeApis: options.probe !== false,
      useCache: options.cache !== false,
      timeoutMs: Number(options.timeout),
      concurrency: Number(options.concurrency),
    };

    const results =
      urls.length === 1 ? [await scanUrl(urls[0], scanOptions)] : await scanUrls(urls, scanOptions);

    const minConfidence = Number(options.minConfidence);
    const filtered = results.map((result) => filterByConfidence(result, minConfidence));

    if (options.json) {
      console.log(JSON.stringify(filtered.length === 1 ? filtered[0] : filtered, null, 2));
      return;
    }

    for (const result of filtered) {
      console.log(formatText(result));
      console.log("");
    }
  });

function filterByConfidence(result: ScanResult, minConfidence: number): ScanResult {
  if (result.confidence >= minConfidence) return result;
  return {
    ...result,
    platform: null,
    category: null,
    evidence: [],
  };
}

function formatText(result: ScanResult): string {
  const lines = [
    `URL: ${result.url}`,
    `Final URL: ${result.finalUrl}`,
  ];

  if (result.error && result.error.startsWith("Scan failed")) {
    lines.push(`Error: ${result.error}`);
    return lines.join("\n");
  }

  lines.push(`Platform: ${result.platform ?? "Not detected"}`);
  if (result.category) lines.push(`Category: ${result.category}`);
  lines.push(`Confidence: ${result.confidence}%`);
  if (result.hosting) lines.push(`Hosting: ${result.hosting}`);
  if (result.headless !== null) lines.push(`Headless: ${result.headless}`);
  if (result.framework) lines.push(`Framework: ${result.framework}`);

  if (result.evidence.length > 0) {
    lines.push("Evidence:");
    for (const item of result.evidence.slice(0, 8)) {
      lines.push(`  - ${item}`);
    }
  }

  if (result.alternatives.length > 0) {
    lines.push("Possible matches:");
    for (const alt of result.alternatives) {
      lines.push(`  - ${alt.platform}: ${alt.confidence}%`);
    }
  }

  if (result.error) {
    lines.push(`Note: ${result.error}`);
  }

  return lines.join("\n");
}

program.parse(process.argv);
