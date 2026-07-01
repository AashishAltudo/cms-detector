import type { DetectionContext, PageArtifacts } from "../types/index.js";

export function createContext(partial: Partial<PageArtifacts> = {}): DetectionContext {
  const artifacts: PageArtifacts = {
    url: "https://example.com",
    finalUrl: "https://example.com",
    html: "",
    headers: {},
    cookies: {},
    scripts: [],
    comments: [],
    metaGenerator: [],
    robotsTxt: null,
    sitemapXml: null,
    manifestJson: null,
    probes: [],
    hostingSignals: [],
    jsGlobals: [],
    resourceUrls: "",
    ...partial,
  };

  return { artifacts };
}
