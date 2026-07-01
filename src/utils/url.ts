export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL cannot be empty");
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/\//, "")}`;
  const parsed = new URL(withScheme);
  return parsed.toString().replace(/\/$/, "") === parsed.origin
    ? parsed.origin
    : parsed.toString();
}

export function getOrigin(url: string): string {
  return new URL(url).origin;
}

export function joinUrl(origin: string, path: string): string {
  return new URL(path, origin.endsWith("/") ? origin : `${origin}/`).toString();
}
