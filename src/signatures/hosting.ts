import type { PageArtifacts } from "../types/index.js";
import type { NormalizedHeaders } from "../types/index.js";

export interface HostingSignature {
  name: string;
  headerPatterns?: Array<{ name: string; pattern: RegExp }>;
  htmlPatterns?: RegExp[];
}

export const HOSTING_SIGNATURES: HostingSignature[] = [
  { name: "Vercel", headerPatterns: [{ name: "server", pattern: /vercel/i }, { name: "x-vercel-id", pattern: /.+/ }] },
  { name: "Netlify", headerPatterns: [{ name: "server", pattern: /netlify/i }, { name: "x-nf-request-id", pattern: /.+/ }] },
  { name: "Cloudflare Pages", headerPatterns: [{ name: "server", pattern: /cloudflare/i }, { name: "cf-ray", pattern: /.+/ }] },
  { name: "Pantheon", headerPatterns: [{ name: "x-pantheon-styx-host", pattern: /.+/ }, { name: "x-pantheon-environment", pattern: /.+/ }] },
  { name: "WP Engine", headerPatterns: [{ name: "x-powered-by", pattern: /WP Engine/i }, { name: "x-wpe-loopback-upstream-addr", pattern: /.+/ }] },
  { name: "Acquia", headerPatterns: [{ name: "x-acquia-host", pattern: /.+/ }, { name: "x-acquia-search", pattern: /.+/ }] },
  { name: "Azure", headerPatterns: [{ name: "x-azure-ref", pattern: /.+/ }, { name: "x-ms-request-id", pattern: /.+/ }] },
  { name: "Adobe Cloud", headerPatterns: [{ name: "x-adobe-content", pattern: /.+/ }, { name: "x-aem-", pattern: /.+/ }] },
  { name: "Sitecore XM Cloud", headerPatterns: [{ name: "x-sitecore-", pattern: /.+/ }] },
];

export function detectHosting(headers: NormalizedHeaders, html: string): string[] {
  const matches: string[] = [];

  for (const signature of HOSTING_SIGNATURES) {
    const headerHit = signature.headerPatterns?.some(({ name, pattern }) => {
      const lowerName = name.toLowerCase();
      if (lowerName.endsWith("-")) {
        return Object.entries(headers).some(
          ([key, value]) => key.startsWith(lowerName) && pattern.test(value),
        );
      }
      const value = headers[lowerName] ?? "";
      return pattern.test(value);
    });

    const htmlHit = signature.htmlPatterns?.some((pattern) => pattern.test(html));

    if (headerHit || htmlHit) {
      matches.push(signature.name);
    }
  }

  return [...new Set(matches)];
}

export function mergeArtifacts(
  base: PageArtifacts,
  renderedHtml: string,
  jsGlobals: string[],
): PageArtifacts {
  return {
    ...base,
    html: renderedHtml || base.html,
    jsGlobals: [...new Set([...base.jsGlobals, ...jsGlobals])],
  };
}
