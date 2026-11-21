import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiError } from "@/lib/api/handler";
import { createProgramInputSchema } from "@/lib/schemas";
import { localBackendAdapter } from "@/services/localBackendAdapter";
import { INITIAL_USERS } from "@/lib/store";

export const GET = withApiHandler(async (_req, { requestId, startTime }) => {
  const result = await localBackendAdapter.program.getPrograms();
  return apiSuccess(result.data || [], requestId, startTime);
});

export const POST = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const json = await req.json();
  const validated = createProgramInputSchema.parse(json);
  const coach = INITIAL_USERS.find(u => u.role === "coach") || INITIAL_USERS[1];

  const result = await localBackendAdapter.program.createProgram(validated, coach);
  if (!result.success || !result.data) {
    return apiError(
      result.error?.message || "Failed to create program template",
      result.error?.code || "CREATE_PROGRAM_FAILED",
      400,
      requestId,
      result.error?.details,
      startTime
    );
  }

  return apiSuccess(result.data, requestId, startTime, 201);
});
