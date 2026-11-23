import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withApiHandler, apiSuccess, apiError } from "@/lib/api/handler";
import { checkRateLimit } from "@/lib/rateLimit";
import { BONOBO_SYSTEM_INSTRUCTION, validateGymContext } from "@/lib/aiGuardrails";
import { parseBonoboNaturalLanguage } from "@/lib/bonoboNlp";
import { DAILY_AI_REQUEST_LIMIT } from "@/lib/aiQuota";
import { getExerciseIndex } from "@/lib/exercises";

interface ChatRequestBody {
  message: string;
  athleteId?: string;
  athleteName?: string;
  history?: Array<{ role: "user" | "model" | "assistant"; text: string }>;
  apiKey?: string;
}

export const POST = withApiHandler(async (req: NextRequest, { requestId, startTime }) => {
  const body = (await req.json()) as ChatRequestBody;
  const message = body.message?.trim();
  const athleteId = body.athleteId || "athlete-1";
  const athleteName = body.athleteName || "Athlete";

  if (!message) {
    return apiError("Message is required", "INVALID_INPUT", 400, requestId, null, startTime);
  }

  // 1. Enforce strict 1-day per-user limit (max 15 requests / 24h) to avoid API cost sky-rocketing
  const rateLimitKey = `ai_companion_${athleteId}`;
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: DAILY_AI_REQUEST_LIMIT,
    windowMs: 24 * 60 * 60 * 1000 // 24 hours
  });

  if (!rateLimit.success) {
    return apiError(
      `Daily AI limit reached (${DAILY_AI_REQUEST_LIMIT}/${DAILY_AI_REQUEST_LIMIT}). Your quota will reset in ${Math.round(rateLimit.reset / 3600)}h. Take some rest and we'll chat tomorrow! 🍌`,
      "DAILY_LIMIT_EXCEEDED",
      429,
      requestId,
      { remaining: 0, resetInSeconds: rateLimit.reset },
      startTime
    );
  }

  // 2. Pre-flight Gym Guardrail: Block off-topic nonsense (politics, coding, trivia) before wasting API cost
  const guardrail = validateGymContext(message);
  if (!guardrail.isAllowed) {
    return apiSuccess(
      {
        reply: guardrail.cannedRedirect,
        intent: "out_of_context",
        quota: {
          remaining: rateLimit.remaining,
          limit: DAILY_AI_REQUEST_LIMIT,
        },
        structuredAction: null,
        source: "guardrail_intercept"
      },
      requestId,
      startTime
    );
  }

  // 3. Resolve active exercises catalog for domain mapping
  const exercisesCatalog = getExerciseIndex();

  // Parse structured workout/injury actions (two-step confirmation safeguard)
  const structuredNlp = parseBonoboNaturalLanguage(message, exercisesCatalog);

  // 4. Resolve Gemini API Key (request header, request body, or server env)
  const customKey = req.headers.get("x-gemini-api-key") || body.apiKey || process.env.GEMINI_API_KEY;

  let aiReply = "";
  let source: "gemini_api" | "local_nlp" = "local_nlp";

  if (customKey && customKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: customKey.trim() });
      
      // Build conversation contents
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      // Add recent history if provided (up to last 6 turns to keep token cost minimal)
      if (body.history && Array.isArray(body.history)) {
        const recentHistory = body.history.slice(-6);
        for (const item of recentHistory) {
          const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
          contents.push({
            role,
            parts: [{ text: item.text }]
          });
        }
      }

      // Add current message with athlete context
      const contextualUserMessage = `[Athlete: ${athleteName}] ${message}`;
      contents.push({
        role: "user",
        parts: [{ text: contextualUserMessage }]
      });

      // Try modern efficient Flash model
      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let lastErr: Error | null = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: BONOBO_SYSTEM_INSTRUCTION,
              temperature: 0.6,
              maxOutputTokens: 250,
            }
          });

          if (response.text) {
            aiReply = response.text.trim();
            source = "gemini_api";
            break;
          }
        } catch (mErr: unknown) {
          lastErr = mErr instanceof Error ? mErr : new Error(String(mErr));
          // Continue to next model candidate
        }
      }

      if (!aiReply && lastErr) {
        console.warn("[Gemini API] Failed to generate, falling back to local NLP:", lastErr.message);
      }
    } catch (apiErr) {
      console.warn("[Gemini API] Client error:", apiErr);
    }
  }

  // 5. Fallback to intelligent local NLP if no API key or API call failed
  if (!aiReply) {
    aiReply = structuredNlp.chatResponse || structuredNlp.summary;
    source = "local_nlp";
  }

  return apiSuccess(
    {
      reply: aiReply,
      intent: structuredNlp.intent,
      structuredAction: structuredNlp,
      quota: {
        remaining: rateLimit.remaining,
        limit: DAILY_AI_REQUEST_LIMIT,
      },
      source
    },
    requestId,
    startTime
  );
});
