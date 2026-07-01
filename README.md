# CMS & DXP Detection Web Scraper

Production-ready TypeScript scanner that detects CMS, DXP, SSG, commerce platforms, website builders, headless CMS tools, and web frameworks from a website URL.

## Features

- Multi-signal detection: HTML, headers, cookies, JavaScript, API probes, manifests, hosting
- Weighted confidence engine with evidence output
- Modular detector architecture
- Parallel scanning with rate limiting, retries, caching, and optional proxy support
- Optional Playwright rendering for client-side apps
- CLI and programmatic API
- Vitest unit tests for core detectors
- Benchmark script for sample sites

## Quick Start

```bash
cd cms-detector
npm install
npx playwright install chromium
npm run dev -- https://wordpress.org --json
```

Build and run:

```bash
npm run build
npm start -- https://wordpress.org https://www.drupal.org
```

## CLI Usage

```bash
# Single URL
npm run dev -- https://example.com

# JSON output
npm run dev -- https://example.com --json

# Enable Playwright rendering
npm run dev -- https://example.com --playwright

# Batch scan
npm run dev -- https://wordpress.org https://www.shopify.com https://webflow.com --json

# Disable API probing / cache
npm run dev -- https://example.com --no-probe --no-cache
```

## Example JSON Output

```json
{
  "url": "https://example.com",
  "finalUrl": "https://example.com",
  "platform": "WordPress",
  "category": "Traditional CMS",
  "confidence": 92,
  "hosting": "Cloudflare Pages",
  "headless": false,
  "framework": null,
  "evidence": [
    "Generator meta matches WordPress",
    "HTML signature: /wp-content/",
    "WordPress REST API detected at /wp-json/"
  ],
  "alternatives": [
    { "platform": "HubSpot CMS", "confidence": 18 }
  ]
}
```

## Programmatic API

```typescript
import { scanUrl } from "cms-dxp-detector";

const result = await scanUrl("https://example.com", {
  usePlaywright: false,
  probeApis: true,
  timeoutMs: 15000,
});

console.log(result.platform, result.confidence, result.evidence);
```

## Detection Methods

| Method | Weight |
|--------|--------|
| Generator meta | 100 |
| CMS API endpoint | 95 |
| Cookie match | 80 |
| JS SDK | 80 |
| Asset folder | 70 |
| HTTP header | 65 |
| HTML signature | 60 |
| Manifest / robots | 55 |
| DNS / hosting | 40 |

## Project Structure

```
src/
 ├── detectors/          # Platform-specific detectors
 │    ├── wordpress.ts
 │    ├── sitecore.ts
 │    ├── aem.ts
 │    ├── contentstack.ts
 │    ├── contentful.ts
 │    ├── shopify.ts
 │    ├── nextjs.ts
 │    └── signature-registry.ts
 ├── engine/             # Confidence scoring and result builder
 ├── signatures/         # Platform and hosting signatures
 ├── services/           # HTTP, Playwright, probes, cache, rate limit
 ├── utils/
 ├── types/
 ├── scanner.ts
 ├── index.ts
 └── cli.ts
```

## Supported Platforms

The scanner is configured to detect these **38 target platforms**:

WordPress, Shopify, Wix, Drupal, Joomla, Magento, Webflow, Squarespace, Ghost, TYPO3, Sitecore, Kentico, Contentful, Contentstack, Strapi, HubSpot, Adobe Experience Manager, Optimizely, Sitefinity, Umbraco, Magnolia, Liferay, dotCMS, Craft CMS, Storyblok, Sanity, Hygraph, Prismic, Directus, Payload, Shopware, WooCommerce, BigCommerce, PrestaShop, OpenCart, Znode, Acquia, Q4 Web.

Sitecore, AEM, Optimizely, and Acquia variants are normalized to a single canonical name in results (e.g. `Sitecore JSS` → `Sitecore`).

Additional signatures exist in `src/signatures/platforms.ts` for extended detection beyond this list.

## Adding a New Platform

1. Add a signature in `src/signatures/platforms.ts`:

```typescript
sig("my-platform", "My Platform", "Traditional CMS", {
  metaGenerator: [/My Platform/i],
  html: [/my-platform/i, /\/my-assets\//i],
  cookies: [/myplatform_/i],
  apiEndpoints: [{ path: "/api/status", pattern: /ok/i }],
});
```

2. For advanced logic, create `src/detectors/my-platform.ts` extending `BaseDetector`.
3. Register it in `src/detectors/index.ts`.
4. Add tests in `src/detectors/my-platform.test.ts`.

## Testing

```bash
npm test
npm run lint
```

## Benchmark

```bash
npm run benchmark
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `timeoutMs` | 15000 | HTTP timeout |
| `usePlaywright` | false | Render page with Chromium |
| `probeApis` | true | Probe known CMS API paths |
| `useCache` | true | In-memory response cache |
| `concurrency` | 4 | Parallel workers |
| `rateLimitMs` | 250 | Minimum delay between requests |
| `maxRetries` | 2 | Retry count for failed requests |
| `userAgents` | built-in list | Rotating user agents |
| `proxyUrl` | undefined | Optional HTTP proxy |

## Limitations

- Detection is heuristic; some sites obfuscate platform fingerprints.
- API probing is conservative and only checks common public endpoints.
- Heavy JavaScript apps may require `--playwright`.
- Respect target site terms of service and robots rules.