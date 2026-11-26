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
    "High-end stylized 3D character render of Barnaby, a friendly athletic young bonobo ape smiling warmly. Straight-on symmetrical chest-up portrait leaving ~22% headroom, bare natural head with no headwear or held props, crisp platinum rim light on a seamless matte #101010 dark background.",
  pumped:
    "High-end stylized 3D character render of Barnaby, a friendly athletic young bonobo ape with an intense locked-in workout expression. Straight-on symmetrical chest-up portrait leaving ~22% headroom, bare natural head with no headwear or held props, crisp platinum rim light on a seamless matte #101010 dark background.",
  recovery:
    "High-end stylized 3D character render of Barnaby, a friendly athletic young bonobo ape with a calm deeply rested serene expression. Straight-on symmetrical chest-up portrait leaving ~22% headroom, bare natural head with no headwear or held props, soft platinum-silver rim light on a seamless matte #101010 dark background.",
  celebration:
    "High-end stylized 3D character render of Barnaby, a friendly athletic young bonobo ape celebrating with a beaming joyful smile. Straight-on symmetrical chest-up portrait leaving ~22% headroom, bare natural head with no headwear or held props, warm platinum rim light on a seamless matte #101010 dark background.",
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

  // Nano Banana Pro is the highest-tier studio quality model, followed by Nano Banana 2.1 and 3.1 Flash Lite
  const candidateModels = [
    "gemini-3-pro-image",
    "gemini-nano-banana-2.1",
    "gemini-3.1-flash-lite-image",
  ];

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const interaction = await ai.interactions.create({
        model,
        input: prompt,
        response_format: {
          type: "image",
          aspect_ratio: "1:1",
          image_size: "1K",
        },
      });

      let imageBase64 = interaction.output_image?.data;

      if (!imageBase64 && Array.isArray(interaction.steps)) {
        for (const step of interaction.steps) {
          if (step.type === "model_output" && Array.isArray(step.content)) {
            const imgBlock = step.content.find(
              (c): c is { type: "image"; data?: string } => c.type === "image"
            );
            if (imgBlock?.data) {
              imageBase64 = imgBlock.data;
              break;
            }
          }
        }
      }

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
