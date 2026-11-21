import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiError } from "@/lib/api/handler";
import { checkInInputSchema } from "@/lib/schemas";
import { localBackendAdapter } from "@/services/localBackendAdapter";
import { z } from "zod";

const checkInPostSchema = checkInInputSchema.and(
  z.object({
    athleteId: z.string().min(1, "athleteId is required"),
    athleteName: z.string().min(1, "athleteName is required")
  })
);

export const GET = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const url = new URL(req.url);
  const athleteId = url.searchParams.get("athleteId") || "athlete-1";

  const result = await localBackendAdapter.checkIn.getRecentCheckIns(athleteId);
  if (!result.success) {
    return apiError(
      result.error?.message || "Failed to retrieve check-ins",
      result.error?.code || "CHECK_INS_FETCH_FAILED",
      400,
      requestId,
      result.error?.details,
      startTime
    );
  }

  return apiSuccess(result.data, requestId, startTime);
});

export const POST = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const json = await req.json();
  const validated = checkInPostSchema.parse(json);

  const { athleteId, athleteName, ...checkInData } = validated;
  const result = await localBackendAdapter.checkIn.submitCheckIn(checkInData, athleteId, athleteName);

  if (!result.success || !result.data) {
    return apiError(
      result.error?.message || "Failed to submit check-in",
      result.error?.code || "CHECK_IN_SUBMIT_FAILED",
      400,
      requestId,
      result.error?.details,
      startTime
    );
  }

  return apiSuccess(result.data, requestId, startTime, 201);
});
