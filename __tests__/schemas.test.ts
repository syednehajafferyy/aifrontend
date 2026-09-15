import { describe, it, expect } from "vitest";
import { GenerateRequestSchema, DeployRequestSchema, LeadDataSchema } from "../lib/schemas";

describe("Zod Schema Validation", () => {
  it("validates GenerateRequestSchema correctly", () => {
    const valid = GenerateRequestSchema.safeParse({
      prompt: "Build an e-commerce dashboard",
      template: "ecommerce",
      themeTokens: { primaryColor: "#6C63FF", radius: "md", fontScale: "comfortable" },
    });
    expect(valid.success).toBe(true);

    const invalid = GenerateRequestSchema.safeParse({ prompt: "hi" });
    expect(invalid.success).toBe(false);
  });

  it("validates DeployRequestSchema correctly", () => {
    const valid = DeployRequestSchema.safeParse({
      projectId: "proj_123",
      repoName: "my-devforge-app",
      files: { "App.tsx": "export default function App() {}" },
      isPrivate: false,
    });
    expect(valid.success).toBe(true);

    const invalidRepo = DeployRequestSchema.safeParse({
      projectId: "proj_123",
      repoName: "invalid name with spaces!",
      files: {},
    });
    expect(invalidRepo.success).toBe(false);
  });

  it("validates LeadDataSchema correctly", () => {
    const valid = LeadDataSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      requirement: "Custom Next.js web application",
      company: "Acme Corp",
      budget: "$5,000",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = LeadDataSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      requirement: "Need a site",
    });
    expect(invalidEmail.success).toBe(false);
  });
});
