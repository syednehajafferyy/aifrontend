// DevForge AI — Next.js Project Scaffold Generator

export function buildProjectScaffold(projectName: string, appComponentCode: string): Record<string, string> {
  const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "devforge-app";

  return {
    "package.json": JSON.stringify(
      {
        name: sanitizedName,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
        },
        dependencies: {
          next: "^14.2.15",
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "lucide-react": "^0.454.0",
          clsx: "^2.1.1",
          "tailwind-merge": "^2.5.4",
        },
        devDependencies: {
          typescript: "^5.6.3",
          "@types/node": "^22.7.9",
          "@types/react": "^18.3.12",
          "@types/react-dom": "^18.3.1",
          tailwindcss: "^3.4.14",
          postcss: "^8.4.47",
          autoprefixer: "^10.4.20",
        },
      },
      null,
      2
    ),

    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: {
            "@/*": ["./*"],
          },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2
    ),

    "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,

    "postcss.config.js": `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

    "app/layout.tsx": `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${projectName} — Built with DevForge AI",
  description: "Generated full-stack application built with DevForge AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
`,

    "app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  padding: 0;
}
`,

    "app/page.tsx": `"use client";

import App from "@/components/App";

export default function Page() {
  return <App />;
}
`,

    "components/App.tsx": appComponentCode || `export default function App() { return <div>Empty App</div>; }`,

    "README.md": `# ${projectName}

Generated with **DevForge AI** — Prompt-to-production web builder.

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
`,

    ".gitignore": `# dependencies
/node_modules
/.pnpm-store

# next.js build output
/.next/
/out/

# production
/build

# debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# typescript cache
*.tsbuildinfo
next-env.d.ts
`,
  };
}
