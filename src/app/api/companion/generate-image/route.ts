import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiError } from "@/lib/api/handler";
import { generateCompanionImageWithNanoBanana } from "@/lib/geminiImageGen";

export const POST = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const body = await req.json();
  const mood = body.mood || "welcoming";
  const prompt = body.prompt;
  const apiKey = req.headers.get("x-gemini-api-key") || body.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return apiError(
      "Missing Gemini API Key. Please provide a key in the header or companion settings.",
      "UNAUTHORIZED",
      401,
      requestId,
      null,
      startTime
    );
  }

  const result = await generateCompanionImageWithNanoBanana({
    mood,
    prompt,
    apiKey
  });

  if (!result.success) {
    return apiError(
      result.error || "Failed to generate companion image",
      "GENERATION_FAILED",
      500,
      requestId,
      null,
      startTime
    );
  }

  return apiSuccess(result, requestId, startTime);
});
