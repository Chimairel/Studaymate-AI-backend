import { z } from "zod";

export const analyzeCoachSchema = z.object({
  body: z.object({
    content: z
      .string({ message: "Content is required" })
      .min(50, "Essay content must be at least 50 characters"),
    essayType: z.enum(["Argumentative", "Expository", "Analytical", "Narrative"]).optional().default("Argumentative"),
    essayId: z.string().optional(), // optional link to a saved essay
  }),
});

export const chatCoachSchema = z.object({
  body: z.object({
    message: z.string({ message: "Message is required" }).min(1, "Message cannot be empty"),
    essayContent: z.string().optional().default(""),
    essayType: z.enum(["Argumentative", "Expository", "Analytical", "Narrative"]).optional().default("Argumentative"),
    chatHistory: z
      .array(
        z.object({
          role: z.enum(["user", "model", "assistant"]),
          parts: z.union([z.string(), z.array(z.any())]).optional(), // supports simple or structure parts
          content: z.string().optional(), // alternate simple representation
        })
      )
      .optional()
      .default([]),
  }),
});

export const scoreCoachSchema = z.object({
  body: z.object({
    content: z.string({ message: "Content is required" }).min(1, "Content is required"),
    essayType: z.enum(["Argumentative", "Expository", "Analytical", "Narrative"]).optional().default("Argumentative"),
    essayId: z.string().optional(),
  }),
});
