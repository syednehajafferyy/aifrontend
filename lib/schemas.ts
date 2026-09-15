import { z } from "zod";

/**
 * Structured shape the chatbot's tool-calling flow extracts from a free-form
 * conversation. This is the schema handed to the AI as a tool definition
 * (see app/api/chat/route.ts) — the model fills it in only once it has
 * genuinely gathered each field, it never invents values.
 */
export const LeadDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  company: z.string().optional().nullable(),
  requirement: z.string().min(1, "Project requirement is required"),
  budget: z.string().optional().nullable(),
});

export type LeadData = z.infer<typeof LeadDataSchema>;

/** Request body for the streaming AI code-generation endpoint. */
export const GenerateRequestSchema = z.object({
  prompt: z.string().min(3, "Describe what you want to build"),
  template: z.enum(["blank", "ecommerce", "saas-landing", "portfolio", "dashboard"]).default("blank"),
  targetLanguage: z.string().optional().default("React (TypeScript)"),
  existingCode: z.string().optional(),
  themeTokens: z
    .object({
      primaryColor: z.string().optional(),
      radius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
      fontScale: z.enum(["compact", "comfortable", "spacious"]).optional(),
    })
    .optional(),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/** Request body for the 1-click deployment endpoint. */
export const DeployRequestSchema = z.object({
  projectId: z.string(),
  repoName: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, "Repo name can only contain letters, numbers, - . _")
    .min(1)
    .max(100),
  files: z.record(z.string(), z.string()), // path -> file content
  isPrivate: z.boolean().default(false),
});

export type DeployRequest = z.infer<typeof DeployRequestSchema>;
