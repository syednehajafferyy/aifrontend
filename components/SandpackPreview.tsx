"use client";

import { SandpackProvider, SandpackPreview, SandpackCodeEditor, SandpackLayout } from "@codesandbox/sandpack-react";

interface CodePreviewProps {
  code?: string;
  codeOnly?: boolean;
  previewOnly?: boolean;
}

const DEFAULT_CODE = `import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-indigo-500/30">
          ⚡
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">DevForge AI Workspace</h1>
        <p className="text-slate-400 text-sm mb-6">
          Your live React component workspace is ready. Type a prompt to generate interactive components!
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Counter State:</span>
          <span className="text-2xl font-mono font-bold text-indigo-400">{count}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            Increment +1
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}`;

export default function CustomSandpackPreview({ code, codeOnly = false, previewOnly = false }: CodePreviewProps) {
  const displayCode = code && code.trim().length > 0 ? code : DEFAULT_CODE;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-blue-200/90 bg-[#F0F7FF] shadow-xl shadow-blue-900/5">
      <SandpackProvider
        template="react-ts"
        theme="light"
        files={{
          "/App.tsx": displayCode,
          "/index.tsx": `import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

function Root() {
  useEffect(() => {
    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  return <App />;
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}`,
          "/styles.css": `@import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

body {
  margin: 0;
  padding: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
}`,
        }}
        customSetup={{
          entry: "/index.tsx",
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "^0.344.0",
          },
        }}
        options={{
          recompileMode: "delayed",
          recompileDelay: 200,
          initMode: "immediate",
        }}
      >
        <SandpackLayout className="!border-none !bg-[#F0F7FF]">
          {previewOnly ? (
            <div className="w-full h-[calc(100vh-100px)] min-h-[600px] bg-[#F0F7FF]">
              <SandpackPreview
                showRefreshButton
                showOpenInCodeSandbox={false}
                style={{ height: "100%" }}
              />
            </div>
          ) : codeOnly ? (
            <div className="w-full min-h-[550px] bg-[#F0F7FF] overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-100/70 border-b border-blue-200/80 text-xs font-mono text-slate-700 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Generated Codebase (/App.tsx, index.html)
                </span>
              </div>
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs
                wrapContent
                style={{ height: "520px" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[550px] border-none bg-[#F0F7FF]">
              {/* Editor Panel */}
              <div className="border-b lg:border-b-0 lg:border-r border-blue-200/80 bg-[#F0F7FF] h-[550px] overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-100/70 border-b border-blue-200/80 text-xs font-mono text-slate-700 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    App.tsx (TypeScript Source)
                  </span>
                </div>
                <SandpackCodeEditor
                  showLineNumbers
                  showInlineErrors
                  showTabs
                  wrapContent
                  style={{ height: "calc(100% - 37px)" }}
                />
              </div>
              {/* Live Preview Panel */}
              <div className="bg-[#F0F7FF] h-[550px] overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-100/70 border-b border-blue-200/80 text-xs font-mono text-slate-700 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Live Output Preview
                  </span>
                </div>
                <SandpackPreview
                  showRefreshButton
                  showOpenInCodeSandbox={false}
                  style={{ height: "calc(100% - 37px)" }}
                />
              </div>
            </div>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
