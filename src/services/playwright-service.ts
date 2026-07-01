import { chromium, type Browser } from "playwright";
import { extractJsGlobals } from "./html-analyzer.js";

export interface PlaywrightRenderResult {
  html: string;
  jsGlobals: string[];
}

export class PlaywrightService {
  private browser: Browser | null = null;
  private renderQueue: Promise<void> = Promise.resolve();

  async render(url: string, timeoutMs = 20000): Promise<PlaywrightRenderResult> {
    let result!: PlaywrightRenderResult;

    this.renderQueue = this.renderQueue.then(async () => {
      result = await this.renderInternal(url, timeoutMs);
    });

    await this.renderQueue;
    return result;
  }

  private async renderInternal(url: string, timeoutMs: number): Promise<PlaywrightRenderResult> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const page = await this.browser.newPage();
    try {
      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
      });
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
      } catch {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      }
      await page.waitForTimeout(2000);
      const html = await page.content();
      const globals = await page.evaluate(() => Object.keys(window).slice(0, 500));
      const inlineScripts = await page.evaluate(() =>
        Array.from(document.querySelectorAll("script"))
          .map((script) => script.textContent ?? "")
          .join("\n"),
      );
      const jsGlobals = [...new Set([...globals, ...extractJsGlobals(inlineScripts)])];
      return { html, jsGlobals };
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    await this.renderQueue;
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
