export type PlatformCategory =
  | "Traditional CMS"
  | "Enterprise DXP"
  | "Commerce Platform"
  | "Website Builder"
  | "Headless CMS"
  | "Static Site Generator"
  | "Web Framework"
  | "Hosting";

export type EvidenceType =
  | "generator_meta"
  | "cms_api"
  | "cookie"
  | "js_sdk"
  | "asset_folder"
  | "http_header"
  | "html_signature"
  | "dns_hosting"
  | "manifest"
  | "javascript"
  | "comment";

export interface Evidence {
  type: EvidenceType;
  description: string;
  weight: number;
  platform: string;
}

export interface AlternativeMatch {
  platform: string;
  confidence: number;
}

export interface ScanResult {
  url: string;
  finalUrl: string;
  platform: string | null;
  category: PlatformCategory | null;
  confidence: number;
  hosting: string | null;
  headless: boolean | null;
  framework: string | null;
  evidence: string[];
  alternatives: AlternativeMatch[];
  rawEvidence: Evidence[];
  error?: string;
}

export interface ScanOptions {
  timeoutMs?: number;
  usePlaywright?: boolean;
  /** Re-render with Playwright when the first pass finds no CMS match (default: true) */
  autoPlaywrightFallback?: boolean;
  useCache?: boolean;
  maxRetries?: number;
  concurrency?: number;
  userAgents?: string[];
  proxyUrl?: string;
  probeApis?: boolean;
  rateLimitMs?: number;
}

export interface NormalizedHeaders {
  [key: string]: string;
}

export interface ProbeResult {
  path: string;
  platform?: string;
  status: number;
  matched: boolean;
  snippet?: string;
}

export interface PageArtifacts {
  url: string;
  finalUrl: string;
  html: string;
  headers: NormalizedHeaders;
  cookies: Record<string, string>;
  scripts: string[];
  comments: string[];
  metaGenerator: string[];
  robotsTxt: string | null;
  sitemapXml: string | null;
  manifestJson: string | null;
  probes: ProbeResult[];
  hostingSignals: string[];
  jsGlobals: string[];
  /** URLs from script src, link href, img src — useful when HTML body is a JS shell */
  resourceUrls: string;
}

export interface DetectionContext {
  artifacts: PageArtifacts;
}

export interface DetectorMatch {
  platform: string;
  category: PlatformCategory;
  headless?: boolean;
  framework?: string;
  evidence: Evidence[];
}

export interface PlatformDetector {
  readonly id: string;
  detect(context: DetectionContext): Promise<DetectorMatch[]>;
}

export interface PlatformSignature {
  id: string;
  name: string;
  category: PlatformCategory;
  headless?: boolean;
  framework?: string;
  html?: RegExp[];
  comments?: RegExp[];
  metaGenerator?: RegExp[];
  headers?: Array<{ name: string; pattern: RegExp }>;
  cookies?: RegExp[];
  scripts?: RegExp[];
  assetPaths?: RegExp[];
  jsGlobals?: RegExp[];
  robots?: RegExp[];
  apiEndpoints?: Array<{
    path: string;
    pattern?: RegExp;
    successStatuses?: number[];
  }>;
}
