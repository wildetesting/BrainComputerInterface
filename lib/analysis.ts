import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import type { ScreenshotAnalysis, SourceConfidence } from "@/lib/types";
import { clampScore, normalizeTopics } from "@/lib/utils";

const analysisSchema = z.object({
  title: z.string().min(1).max(140),
  summary: z.string().min(1).max(600),
  category: z.string().min(1).max(80),
  category_description: z.string().max(240).default(""),
  topics: z.array(z.string().min(1).max(60)).default([]),
  source_url: z.string().url().nullable().default(null),
  source_confidence: z.enum(["none", "low", "medium", "high"]).default("none"),
  extracted_text: z.string().default(""),
  importance_score: z.number().min(0).max(1).default(0.5),
  factuality_note: z.string().max(240).default("Summary is based only on visible screenshot content.")
});

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "summary",
    "category",
    "category_description",
    "topics",
    "source_url",
    "source_confidence",
    "extracted_text",
    "importance_score",
    "factuality_note"
  ],
  properties: {
    title: {
      type: "string",
      description: "A factual headline for the screenshot. Do not invent facts."
    },
    summary: {
      type: "string",
      description: "A concise factual summary based only on visible content."
    },
    category: {
      type: "string",
      description: "A stable category name, reusing common categories when appropriate."
    },
    category_description: {
      type: "string",
      description: "One short sentence describing this category."
    },
    topics: {
      type: "array",
      maxItems: 8,
      items: {
        type: "string"
      }
    },
    source_url: {
      anyOf: [
        {
          type: "string",
          format: "uri"
        },
        {
          type: "null"
        }
      ],
      description: "A source URL only when it is clearly visible or inferable from visible UI."
    },
    source_confidence: {
      type: "string",
      enum: ["none", "low", "medium", "high"]
    },
    extracted_text: {
      type: "string",
      description: "Visible text transcribed from the screenshot."
    },
    importance_score: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    factuality_note: {
      type: "string",
      description: "A brief note about what the summary is based on."
    }
  }
};

function fallbackAnalysis(fileName: string): ScreenshotAnalysis {
  return {
    title: `Screenshot uploaded: ${fileName || "untitled image"}`,
    summary:
      "AI vision is not configured yet. The screenshot was saved privately and is ready to be analyzed after OPENAI_API_KEY is added.",
    category: "Uncategorized",
    categoryDescription: "Screenshots waiting for factual AI analysis.",
    topics: ["Pending analysis"],
    sourceUrl: null,
    sourceConfidence: "none",
    extractedText: "",
    importanceScore: 0.5,
    factualityNote: "No AI analysis was run because OPENAI_API_KEY is not configured."
  };
}

function coerceAnalysis(parsed: z.infer<typeof analysisSchema>): ScreenshotAnalysis {
  return {
    title: parsed.title.trim(),
    summary: parsed.summary.trim(),
    category: parsed.category.trim() || "Uncategorized",
    categoryDescription: parsed.category_description.trim(),
    topics: normalizeTopics(parsed.topics),
    sourceUrl: parsed.source_url,
    sourceConfidence: parsed.source_confidence as SourceConfidence,
    extractedText: parsed.extracted_text.trim(),
    importanceScore: clampScore(parsed.importance_score),
    factualityNote:
      parsed.factuality_note.trim() || "Summary is based only on visible screenshot content."
  };
}

function findVisibleUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s"'<>]+/i);
  return match?.[0] ?? null;
}

export async function analyzeScreenshot(
  fileName: string,
  mimeType: string,
  bytes: Buffer
): Promise<ScreenshotAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalysis(fileName);
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Analyze this private phone screenshot for a personal factual news-feed dashboard. " +
                "Stay factual. Base every title, summary, category, topic, and source only on visible screenshot content. " +
                "Do not invent article details or URLs. If a source URL is visible, return it. If only an app/site name is visible, set source_confidence to low or medium and leave source_url null unless a URL is clear. " +
                "Reuse broad stable categories such as Technology, Business, Health, Politics, Finance, Personal Notes, Products, Places, or Research when they fit."
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${bytes.toString("base64")}`,
              detail: "high"
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "screenshot_analysis",
          strict: true,
          schema: jsonSchema
        }
      }
    } as never);

    const outputText = response.output_text;
    const parsed = analysisSchema.parse(JSON.parse(outputText));
    const analysis = coerceAnalysis(parsed);

    if (!analysis.sourceUrl && analysis.extractedText) {
      analysis.sourceUrl = findVisibleUrl(analysis.extractedText);
      analysis.sourceConfidence = analysis.sourceUrl ? "high" : analysis.sourceConfidence;
    }

    return analysis;
  } catch (error) {
    console.error("Screenshot analysis failed", error);
    return {
      ...fallbackAnalysis(fileName),
      summary:
        "The screenshot was saved privately, but AI analysis failed. Check the server logs and OpenAI configuration, then upload again.",
      factualityNote: "AI analysis failed before a factual summary could be produced."
    };
  }
}
