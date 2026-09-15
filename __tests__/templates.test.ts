import { describe, it, expect } from "vitest";
import { STARTER_TEMPLATES } from "../lib/templates";

describe("Starter Code Templates", () => {
  it("defines starter boilerplate for all 5 template options", () => {
    expect(STARTER_TEMPLATES.ecommerce).toBeDefined();
    expect(STARTER_TEMPLATES["saas-landing"]).toBeDefined();
    expect(STARTER_TEMPLATES.portfolio).toBeDefined();
    expect(STARTER_TEMPLATES.dashboard).toBeDefined();
    expect(STARTER_TEMPLATES.blank).toBeDefined();
  });

  it("contains valid React default export components", () => {
    for (const key of Object.keys(STARTER_TEMPLATES)) {
      const template = STARTER_TEMPLATES[key];
      expect(template.code).toContain("export default function App");
      expect(template.prompt).toBeTruthy();
    }
  });
});
