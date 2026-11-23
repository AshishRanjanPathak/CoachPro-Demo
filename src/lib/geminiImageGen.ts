import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

export interface CompanionImageGenParams {
  mood: "welcoming" | "pumped" | "recovery" | "celebration";
  prompt?: string;
  apiKey?: string;
}

const DEFAULT_PROMPTS: Record<string, string> = {
  welcoming:
    "3D stylized character render of a friendly, athletic bonobo companion smiling warmly, waving hello. Wearing a red athletic headband, clean dark charcoal studio background, welcoming and encouraging fitness companion aesthetic.",
  pumped:
    "3D stylized character render of an energetic athletic bonobo companion flexing with a dumbbell, focused workout expression, red athletic headband, dark gym studio lighting.",
  recovery:
    "3D stylized character render of a relaxed bonobo companion in recovery mode holding a water bottle, gentle caring smile, green athletic headband, calming dark background.",
  celebration:
    "3D stylized character render of a joyful bonobo companion holding a golden banana trophy in the air, celebrating a new personal record with subtle sparkle confetti, red headband.",
};

export async function generateCompanionImageWithNanoBanana(params: CompanionImageGenParams): Promise<{
  success: boolean;
  filePath?: string;
  url?: string;
  error?: string;
}> {
  const { mood, apiKey } = params;
  const resolvedKey = apiKey || process.env.GEMINI_API_KEY;

  if (!resolvedKey) {
    return {
      success: false,
      error: "No Gemini API key provided. Please configure your key in Companion Settings.",
    };
  }

  const prompt = params.prompt || DEFAULT_PROMPTS[mood] || DEFAULT_PROMPTS.welcoming;
  const ai = new GoogleGenAI({ apiKey: resolvedKey });

  // Nano Banana 2.1 is the primary workhorse model
  const candidateModels = [
    "gemini-nano-banana-2.1",
    "gemini-3-pro-image",
    "gemini-3.1-flash-lite-image"
  ];

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      // Call modern image generation
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/png",
          aspectRatio: "1:1",
        },
      });

      if (response && response.generatedImages && response.generatedImages.length > 0) {
        const imageBase64 = response.generatedImages[0].image?.imageBytes;
        if (imageBase64) {
          const buffer = Buffer.from(imageBase64, "base64");
          const publicDir = path.join(process.cwd(), "public", "companion");
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }

          const targetFileName = `bonobo-${mood}.png`;
          const targetPath = path.join(publicDir, targetFileName);
          fs.writeFileSync(targetPath, buffer);

          return {
            success: true,
            filePath: targetPath,
            url: `/companion/${targetFileName}?t=${Date.now()}`,
          };
        }
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Nano Banana] Model ${model} generation failed, attempting next model:`, lastError.message);
    }
  }

  return {
    success: false,
    error: lastError ? lastError.message : "Image generation failed across all Nano Banana models.",
  };
}
