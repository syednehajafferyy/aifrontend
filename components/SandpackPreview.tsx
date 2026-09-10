"use client";

import { SandpackProvider, SandpackPreview, SandpackCodeEditor, SandpackLayout } from "@codesandbox/sandpack-react";

interface CodePreviewProps {
  code?: string;
}

const DEFAULT_CODE = `import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

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

export default function CustomSandpackPreview({ code }: CodePreviewProps) {
  const displayCode = code && code.trim().length > 0 ? code : DEFAULT_CODE;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      <SandpackProvider
        template="react"
        theme="dark"
        files={{
          "/App.js": displayCode,
          "/public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevForge Live Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
  </body>
</html>`,
        }}
        customSetup={{
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "^0.454.0",
          },
        }}
        options={{
          recompileMode: "delayed",
          recompileDelay: 300,
        }}
      >
        <SandpackLayout className="!border-none !bg-slate-950">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[550px] border-none">
            {/* Editor Panel */}
            <div className="border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950 h-[550px] overflow-hidden">
              <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  App.js (Generated Source)
                </span>
              </div>
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                wrapContent
                style={{ height: "calc(100% - 33px)" }}
              />
            </div>
            {/* Live Preview Panel */}
            <div className="bg-slate-950 h-[550px] overflow-hidden">
              <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Live Output Preview
                </span>
              </div>
              <SandpackPreview
                showRefreshButton
                showOpenInCodeSandbox={false}
                style={{ height: "calc(100% - 33px)" }}
              />
            </div>
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
