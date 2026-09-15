import { describe, it, expect } from "vitest";
import { buildProjectScaffold } from "../lib/projectScaffold";

describe("Next.js Project Scaffold Generator", () => {
  it("builds a full Next.js project structure around user App component", () => {
    const scaffold = buildProjectScaffold("My Storefront", "export default function App() { return <div>Store</div>; }");

    expect(scaffold["package.json"]).toBeDefined();
    expect(scaffold["tsconfig.json"]).toBeDefined();
    expect(scaffold["tailwind.config.js"]).toBeDefined();
    expect(scaffold["postcss.config.js"]).toBeDefined();
    expect(scaffold["app/layout.tsx"]).toBeDefined();
    expect(scaffold["app/globals.css"]).toBeDefined();
    expect(scaffold["app/page.tsx"]).toBeDefined();
    expect(scaffold["components/App.tsx"]).toContain("export default function App");
    expect(scaffold["README.md"]).toContain("My Storefront");
    expect(scaffold[".gitignore"]).toBeDefined();

    const pkg = JSON.parse(scaffold["package.json"]);
    expect(pkg.name).toBe("my-storefront");
    expect(pkg.dependencies.next).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
  });
});
