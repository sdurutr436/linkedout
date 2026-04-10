import pino from "pino";

/**
 * Structured logger (server-only).
 * Uses pino-pretty in development, JSON in production.
 */
const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: { service: "linkedout" },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
