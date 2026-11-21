import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiError } from "@/lib/api/handler";
import { batchWorkoutSetsInputSchema } from "@/lib/schemas";
import { localBackendAdapter } from "@/services/localBackendAdapter";

export const POST = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const json = await req.json();
  const validated = batchWorkoutSetsInputSchema.parse(json);

  const idempotencyKey = req.headers.get("idempotency-key") || validated.idempotencyKey || undefined;
  const result = await localBackendAdapter.workout.logBatch(validated.sets, { idempotencyKey });

  if (!result.success || !result.data) {
    return apiError(
      result.error?.message || "Failed to batch log workout sets",
      result.error?.code || "BATCH_LOG_FAILED",
      400,
      requestId,
      result.error?.details,
      startTime
    );
  }

  return apiSuccess(result.data, requestId, startTime, 201);
});
