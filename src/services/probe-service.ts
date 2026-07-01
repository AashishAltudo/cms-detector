import pLimit from "p-limit";
import type { ProbeResult } from "../types/index.js";
import type { HttpClient } from "./http-client.js";
import { joinUrl } from "../utils/url.js";

export interface ProbeDefinition {
  platform: string;
  path: string;
  pattern?: RegExp;
  successStatuses?: number[];
}

/**
 * A probe only counts as a match when the response body confirms the platform
 * (when a pattern is set), or when a successful HTTP status is returned without
 * relying on generic 403/404 fallthrough.
 */
export function evaluateProbeMatch(
  status: number,
  body: string,
  definition: ProbeDefinition,
): boolean {
  const allowedStatuses = definition.successStatuses ?? [200, 301, 302];

  if (definition.pattern) {
    if (!definition.pattern.test(body)) {
      return false;
    }
    return allowedStatuses.includes(status);
  }

  // Without a body pattern, only trust unambiguous success responses.
  return allowedStatuses.includes(status) && status >= 200 && status < 300;
}

export class ProbeService {
  constructor(
    private readonly http: HttpClient,
    private readonly concurrency = 4,
  ) {}

  async probeEndpoints(origin: string, definitions: ProbeDefinition[]): Promise<ProbeResult[]> {
    const limit = pLimit(this.concurrency);
    const paths = [...new Set(definitions.map((item) => item.path))];

    const responses = new Map<
      string,
      { status: number; snippet: string }
    >();

    await Promise.all(
      paths.map((path) =>
        limit(async () => {
          const url = joinUrl(origin, path);
          try {
            const response = await this.http.get(url);
            responses.set(path, {
              status: response.status,
              snippet: (response.data ?? "").slice(0, 2000),
            });
          } catch {
            responses.set(path, { status: 0, snippet: "" });
          }
        }),
      ),
    );

    return definitions.map((definition) => {
      const response = responses.get(definition.path) ?? { status: 0, snippet: "" };
      const matched = evaluateProbeMatch(response.status, response.snippet, definition);

      return {
        path: definition.path,
        platform: definition.platform,
        status: response.status,
        matched,
        snippet: response.snippet.slice(0, 500),
      };
    });
  }
}

export const COMMON_API_PROBES: ProbeDefinition[] = [
  { platform: "WordPress", path: "/wp-json/", pattern: /"namespaces"/, successStatuses: [200] },
  { platform: "WordPress", path: "/wp-json/wp/v2/types", pattern: /"rest_base"/, successStatuses: [200] },
  { platform: "Drupal", path: "/core/misc/drupal.js", pattern: /Drupal|drupal/i, successStatuses: [200] },
  { platform: "Drupal", path: "/jsonapi", pattern: /jsonapi|"jsonapi\.org"/i, successStatuses: [200] },
  { platform: "Ghost", path: "/ghost/api/content/posts/", pattern: /"posts"|ghost/i, successStatuses: [200] },
  { platform: "Strapi", path: "/api", pattern: /\bstrapi\b/i, successStatuses: [200] },
  { platform: "Shopify", path: "/cart.js", pattern: /items|token|cart/i, successStatuses: [200] },
  {
    platform: "Sitecore",
    path: "/sitecore/api/ssc/item",
    pattern: /sitecore|Sitecore|"ItemId"|"ItemName"|"Database"/i,
    successStatuses: [200, 401],
  },
  {
    platform: "Sitecore",
    path: "/-/jss/render",
    pattern: /sitecore|jss|layoutService|Layout Service/i,
    successStatuses: [200],
  },
  {
    platform: "Adobe Experience Manager",
    path: "/content/dam",
    pattern: /jcr:|dam:Asset|cq:Page|sling:Folder/i,
    successStatuses: [200],
  },
  {
    platform: "Adobe Experience Manager",
    path: "/etc.clientlibs",
    pattern: /etc\.clientlibs|cq:ClientLibrary|granite\.js/i,
    successStatuses: [200],
  },
  { platform: "Directus", path: "/server/ping", pattern: /pong|directus/i, successStatuses: [200] },
  {
    platform: "WooCommerce",
    path: "/wp-json/wc/store/v1/products",
    pattern: /products|woocommerce|store/i,
    successStatuses: [200],
  },
  {
    platform: "WooCommerce",
    path: "/wp-json/wc/v3/products",
    pattern: /products|woocommerce/i,
    successStatuses: [200],
  },
  {
    platform: "Shopware",
    path: "/store-api/",
    pattern: /shopware|store-api|context/i,
    successStatuses: [200],
  },
  {
    platform: "Craft CMS",
    path: "/cpresources/",
    pattern: /cpresources|craft/i,
    successStatuses: [200],
  },
  { platform: "GraphQL", path: "/graphql", pattern: /graphql|__schema|"query"/i, successStatuses: [200] },
  { platform: "GraphQL", path: "/api/graphql", pattern: /graphql|__schema|"query"/i, successStatuses: [200] },
];
