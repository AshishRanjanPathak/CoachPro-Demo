import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
    timestamp: string;
    durationMs?: number;
  };
}

export function generateRequestId(req?: NextRequest): string {
  const fromHeader = req?.headers.get("x-request-id");
  if (fromHeader) return fromHeader;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function apiSuccess<T>(data: T, requestId: string, startTime?: number, status: number = 200): NextResponse<ApiResponse<T>> {
  const durationMs = startTime ? Date.now() - startTime : undefined;
  const res: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      durationMs,
    },
  };
  return NextResponse.json(res, {
    status,
    headers: {
      "X-Request-ID": requestId,
      "Cache-Control": "no-store",
    },
  });
}

export function apiError(
  message: string,
  code: string,
  status: number,
  requestId: string,
  details?: unknown,
  startTime?: number
): NextResponse<ApiResponse<never>> {
  const durationMs = startTime ? Date.now() - startTime : undefined;
  const res: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      durationMs,
    },
  };
  return NextResponse.json(res, {
    status,
    headers: {
      "X-Request-ID": requestId,
      "Cache-Control": "no-store",
    },
  });
}

export type ApiRouteHandler = (req: NextRequest, ctx: { requestId: string; startTime: number }) => Promise<NextResponse>;

export interface ApiHandlerOptions {
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Higher-Order Route Wrapper for Next.js App Router API Routes.
 * Automatically handles CORS, X-Request-ID tracing, Rate Limiting, Zod validation errors,
 * unhandled exception boundaries, and structured JSON access logs.
 */
export function withApiHandler(handler: ApiRouteHandler, options?: ApiHandlerOptions) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId(req);
    const reqLogger = logger.withRequestId(requestId);

    // Rate Limiting check if configured
    if (options?.rateLimit) {
      const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "global-client";
      const rlResult = checkRateLimit(`${clientIp}:${req.nextUrl.pathname}`, options.rateLimit);
      if (!rlResult.success) {
        reqLogger.warn("Rate limit exceeded", { path: req.nextUrl.pathname, clientIp });
        const res = apiError("Too many requests. Please slow down.", "RATE_LIMIT_EXCEEDED", 429, requestId, undefined, startTime);
        res.headers.set("X-RateLimit-Limit", rlResult.limit.toString());
        res.headers.set("X-RateLimit-Remaining", rlResult.remaining.toString());
        res.headers.set("X-RateLimit-Reset", rlResult.reset.toString());
        return res;
      }
    }

    reqLogger.info("API request received", {
      path: req.nextUrl.pathname,
      method: req.method,
    });

    try {
      const response = await handler(req, { requestId, startTime });
      reqLogger.info("API request completed", {
        path: req.nextUrl.pathname,
        status: response.status,
        durationMs: Date.now() - startTime,
      });
      return response;
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        reqLogger.warn("API request schema validation failure", {
          path: req.nextUrl.pathname,
          issues: err.flatten(),
        });
        return apiError("Request payload failed schema validation", "VALIDATION_ERROR", 400, requestId, err.flatten(), startTime);
      }

      reqLogger.error("Unhandled API exception", { path: req.nextUrl.pathname }, err);
      return apiError(
        process.env.NODE_ENV === "production" ? "Internal server error" : (err as Error)?.message || "Internal error",
        "INTERNAL_ERROR",
        500,
        requestId,
        undefined,
        startTime
      );
    }
  };
}
