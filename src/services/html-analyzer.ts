import * as cheerio from "cheerio";
import type { PageArtifacts } from "../types/index.js";
import type { HttpResponsePayload } from "./http-client.js";

export function analyzeHtml(response: HttpResponsePayload): Pick<
  PageArtifacts,
  "html" | "scripts" | "comments" | "metaGenerator" | "resourceUrls"
> {
  const html = response.data ?? "";
  const $ = cheerio.load(html);
  const scripts: string[] = [];
  const comments: string[] = [];
  const metaGenerator: string[] = [];
  const resourceUrlParts: string[] = [];

  $("script[src]").each((_, element) => {
    const src = $(element).attr("src");
    if (src) {
      scripts.push(src);
      resourceUrlParts.push(src);
    }
  });

  $("script").each((_, element) => {
    const inline = $(element).html()?.trim();
    if (inline) scripts.push(inline.slice(0, 5000));
  });

  $("link[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href) resourceUrlParts.push(href);
  });

  $("img[src], source[src], iframe[src]").each((_, element) => {
    const src = $(element).attr("src");
    if (src) resourceUrlParts.push(src);
  });

  $("meta[name='generator'], meta[name='Generator']").each((_, element) => {
    const content = $(element).attr("content");
    if (content) metaGenerator.push(content);
  });

  const commentRegex = /<!--([\s\S]*?)-->/g;
  let match: RegExpExecArray | null;
  while ((match = commentRegex.exec(html)) !== null) {
    comments.push(match[1].trim().slice(0, 500));
  }

  return {
    html,
    scripts,
    comments,
    metaGenerator,
    resourceUrls: resourceUrlParts.join("\n"),
  };
}

export function extractJsGlobals(scriptBlob: string): string[] {
  const globals = new Set<string>();
  const patterns = [
    /window\.(\w+)\s*=/g,
    /globalThis\.(\w+)\s*=/g,
    /typeof\s+(\w+)\s*!==\s*["']undefined["']/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(scriptBlob)) !== null) {
      globals.add(match[1]);
    }
  }

  return [...globals];
}

export function isThinHtml(html: string): boolean {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").trim();
  return html.length < 2500 || stripped.length < 200;
}
