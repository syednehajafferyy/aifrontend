"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Disable SSR for Sandpack to clear React Error #418 & hydration issues
const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-slate-900 text-slate-400 rounded-lg">
      Initializing Sandpack Environment...
    </div>
  ),
});

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${response.status})`);
      }

      const textOrJson = await response.text();
      let code = textOrJson;
      try {
        const parsed = JSON.parse(textOrJson);
        if (parsed.code) code = parsed.code;
      } catch {}

      if (code) {
        setGeneratedCode(code);
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "Failed to generate component");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Workspace Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              ⚡ DevForge AI — Workspace
            </h1>
            <p className="text-slate-400 text-sm">Generate and run live React components with Google Gemini AI</p>
          </div>
        </header>

        {/* Prompt Input Form */}
        <form onSubmit={handleGenerate} className="flex gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="Describe a component (e.g. 'Create an interactive calculator', 'Build a portfolio')..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition shadow-lg flex items-center gap-2"
          >
            {loading ? "Generating..." : "Generate Code →"}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Code Runner Workspace Canvas */}
        <SandpackPreview code={generatedCode} />
      </div>
    </div>
  );
}
