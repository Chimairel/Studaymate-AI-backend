import { z } from "zod";

const essayTypeEnum = z.enum(["Argumentative", "Expository", "Analytical", "Narrative"]);

export const createEssaySchema = z.object({
  body: z.object({
    title: z.string({ message: "Title is required" }).min(1, "Title is required"),
    content: z.string().optional().default(""),
    type: essayTypeEnum,
  }),
});

export const updateEssaySchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    content: z.string().optional(),
    type: essayTypeEnum.optional(),
  }).passthrough(), // Allow extra fields like score, feedback, subScores, wordCount, charCount
});

