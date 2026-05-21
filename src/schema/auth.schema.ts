import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string({ message: "First name is required" }).min(1, "First name is required"),
    lastName: z.string({ message: "Last name is required" }).min(1, "Last name is required"),
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    password: z.string({ message: "Password is required" }).min(8, "Password must be at least 8 characters"),
    role: z.enum(["High School Student", "College Student", "Graduate Student", "Professional"]).optional(),
    bio: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    password: z.string({ message: "Password is required" }),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bio: z.string().optional(),
    preferences: z.object({
      realtimeFeedback: z.boolean().optional(),
      grammarHighlights: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
      darkMode: z.boolean().optional(),
      defaultEssayMode: z.string().optional(),
    }).optional(),
  }),
});
