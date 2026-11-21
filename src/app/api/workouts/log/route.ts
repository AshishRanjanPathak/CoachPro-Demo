import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiError } from "@/lib/api/handler";
import { workoutSetInputSchema } from "@/lib/schemas";
import { localBackendAdapter } from "@/services/localBackendAdapter";

export const POST = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const json = await req.json();
  const validated = workoutSetInputSchema.parse(json);

  const idempotencyKey = req.headers.get("idempotency-key") || undefined;
  const result = await localBackendAdapter.workout.logSet(validated, { idempotencyKey });

  if (!result.success || !result.data) {
    return apiError(
      result.error?.message || "Failed to log workout set",
      result.error?.code || "LOG_SET_FAILED",
      400,
      requestId,
      result.error?.details,
      startTime
    );
  }

  return apiSuccess(result.data, requestId, startTime, 201);
});
