import { withApiHandler, apiSuccess } from "@/lib/api/handler";
import { dbManager } from "@/lib/db";

/**
 * Health Check & Telemetry Ping Endpoint.
 * Used by container orchestrators (Kubernetes, AWS ECS, Docker) and uptime monitors.
 */
export const GET = withApiHandler(async (_req, { requestId, startTime }) => {
  const memoryUsage = typeof process !== "undefined" ? process.memoryUsage() : null;
  const dbHealth = await dbManager.checkHealth();

  return apiSuccess(
    {
      status: dbHealth.status === "disconnected" ? "degraded" : "healthy",
      service: "coachpro-app",
      version: "0.1.0",
      uptimeSeconds: typeof process !== "undefined" ? Math.floor(process.uptime()) : 0,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: dbHealth,
      memoryMb: memoryUsage
        ? {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          }
        : null,
    },
    requestId,
    startTime
  );
});
