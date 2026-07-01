import express from "express";
import { scanUrl } from "./scanner.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.API_KEY ?? "";

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/detect", async (req, res) => {
  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { url, usePlaywright = false, timeoutMs = 30000 } = req.body ?? {};

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid url" });
    return;
  }

  try {
    const result = await scanUrl(url, { usePlaywright, timeoutMs });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`CMS detector server listening on port ${PORT}`);
});
