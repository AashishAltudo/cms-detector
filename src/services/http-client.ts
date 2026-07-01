import axios, { type AxiosInstance } from "axios";
import { MemoryCache } from "./cache.js";
import { RateLimiter } from "./rate-limiter.js";
import { withRetry } from "../utils/retry.js";
import type { NormalizedHeaders } from "../types/index.js";

const DEFAULT_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
];

export interface HttpClientOptions {
  timeoutMs?: number;
  maxRetries?: number;
  useCache?: boolean;
  rateLimitMs?: number;
  userAgents?: string[];
  proxyUrl?: string;
}

export interface HttpResponsePayload {
  url: string;
  finalUrl: string;
  status: number;
  data: string;
  headers: NormalizedHeaders;
  cookies: Record<string, string>;
}

export class HttpClient {
  private readonly client: AxiosInstance;
  private readonly cache: MemoryCache;
  private readonly rateLimiter: RateLimiter;
  private readonly options: Required<Omit<HttpClientOptions, "proxyUrl">> & { proxyUrl?: string };
  private userAgentIndex = 0;

  constructor(options: HttpClientOptions = {}) {
    this.options = {
      timeoutMs: options.timeoutMs ?? 20000,
      maxRetries: options.maxRetries ?? 2,
      useCache: options.useCache ?? true,
      rateLimitMs: options.rateLimitMs ?? 250,
      userAgents: options.userAgents ?? DEFAULT_USER_AGENTS,
      proxyUrl: options.proxyUrl,
    };

    this.cache = new MemoryCache();
    this.rateLimiter = new RateLimiter(this.options.rateLimitMs);

    this.client = axios.create({
      timeout: this.options.timeoutMs,
      maxRedirects: 8,
      validateStatus: () => true,
      responseType: "text",
      decompress: true,
    });
  }

  private nextUserAgent(): string {
    const agent = this.options.userAgents[this.userAgentIndex % this.options.userAgents.length];
    this.userAgentIndex += 1;
    return agent;
  }

  private browserHeaders(): Record<string, string> {
    return {
      "User-Agent": this.nextUserAgent(),
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
    };
  }

  async get(url: string): Promise<HttpResponsePayload> {
    const cacheKey = `GET:${url}`;
    if (this.options.useCache) {
      const cached = this.cache.get<HttpResponsePayload>(cacheKey);
      if (cached) return cached;
    }

    await this.rateLimiter.wait();

    const response = await withRetry(
      async () => this.client.get<string>(url, { headers: this.browserHeaders() }),
      { maxRetries: this.options.maxRetries },
    );

    const headers: NormalizedHeaders = {};
    for (const [key, value] of Object.entries(response.headers)) {
      if (typeof value === "string") headers[key.toLowerCase()] = value;
      else if (Array.isArray(value)) headers[key.toLowerCase()] = value.join(", ");
    }

    const cookies: Record<string, string> = {};
    const setCookie = response.headers["set-cookie"];
    if (setCookie) {
      for (const cookie of setCookie) {
        const [pair] = cookie.split(";");
        const [name, ...rest] = pair.split("=");
        cookies[name.trim()] = rest.join("=").trim();
      }
    }

    const payload: HttpResponsePayload = {
      url,
      finalUrl:
        (response.request as { responseURL?: string } | undefined)?.responseURL ??
        response.config.url ??
        url,
      status: response.status,
      data: response.data ?? "",
      headers,
      cookies,
    };

    if (this.options.useCache && response.status >= 200 && response.status < 400) {
      this.cache.set(cacheKey, payload);
    }

    return payload;
  }
}
