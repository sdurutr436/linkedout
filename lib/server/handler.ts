import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import logger from "./logger";

type RouteHandler = (request: NextRequest, context: unknown) => Promise<Response>;

/**
 * Wraps a route handler with:
 * - Structured error logging
 * - Automatic HTTP status from AppError subclasses
 * - Zod validation errors → 400
 * - Unhandled errors → 500 (detail hidden in production)
 */
export function handle(fn: RouteHandler): RouteHandler {
  return async (request: NextRequest, context: unknown) => {
    const start = Date.now();
    const { method, url } = request;

    try {
      const response = await fn(request, context);
      logger.info({ method, url, status: response.status, ms: Date.now() - start }, "request");
      return response;
    } catch (err) {
      const ms = Date.now() - start;

      if (err instanceof ZodError) {
        const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        logger.warn({ method, url, ms, issues: err.errors }, "validation error");
        return Response.json({ error: message, code: "VALIDATION_ERROR" }, { status: 400 });
      }

      if (err instanceof AppError) {
        logger.warn({ method, url, ms, code: err.code, status: err.statusCode }, err.message);
        return Response.json({ error: err.message, code: err.code }, { status: err.statusCode });
      }

      logger.error({ method, url, ms, err }, "unhandled error");
      const message =
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : (err as Error).message ?? "Internal server error";
      return Response.json({ error: message }, { status: 500 });
    }
  };
}
