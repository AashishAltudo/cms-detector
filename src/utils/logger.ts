export interface LoggerOptions {
  level?: "debug" | "info" | "warn" | "error";
}

export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? "info";
  const levels = ["debug", "info", "warn", "error"];
  const minIndex = levels.indexOf(level);

  const log = (kind: (typeof levels)[number], message: string, meta?: unknown) => {
    if (levels.indexOf(kind) < minIndex) return;
    const prefix = `[${new Date().toISOString()}] ${kind.toUpperCase()}`;
    if (meta !== undefined) {
      console.log(`${prefix} ${message}`, meta);
    } else {
      console.log(`${prefix} ${message}`);
    }
  };

  return {
    debug: (message, meta) => log("debug", message, meta),
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
  };
}
