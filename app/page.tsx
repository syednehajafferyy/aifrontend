"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { STARTER_TEMPLATES } from "@/lib/templates";

// Disable SSR for Sandpack to clear React Error #418 & hydration issues
const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 rounded-2xl border border-slate-800 animate-pulse gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      <p className="text-sm font-medium">Initializing DevForge Live Runner...</p>
    </div>
  ),
});

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>("default");

  const handleGenerate = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt }),
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

  const loadStarterTemplate = (key: string) => {
    setActiveTemplate(key);
    if (STARTER_TEMPLATES[key]) {
      setPrompt(STARTER_TEMPLATES[key].prompt);
      setGeneratedCode(STARTER_TEMPLATES[key].code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">DevForge AI</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini 2.0 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Next.js Live Code Workbench</p>
            </div>
          </div>

          {/* Preset Starter Templates */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Starters:</span>
            {Object.keys(STARTER_TEMPLATES).slice(0, 4).map((key) => (
              <button
                key={key}
                onClick={() => loadStarterTemplate(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize border ${
                  activeTemplate === key
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                    : "bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/syednehajafferyy/aifrontend.git"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Hero Prompt Box */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span>✨ Prompt AI Component Builder</span>
            </label>
            <span className="text-xs text-slate-400">Describe any UI or pick a starter template below</span>
          </div>

          <form onSubmit={(e) => handleGenerate(e)} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="e.g. 'Build a modern SaaS pricing table with billing toggle', 'Create a crypto dashboard'..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Generating Code...</span>
                </>
              ) : (
                <>
                  <span>Generate Code</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-500">Quick Prompts:</span>
            {[
              "E-Commerce Storefront",
              "SaaS Pricing Matrix",
              "Interactive Kanban Board",
              "Crypto Analytics Dashboard",
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setPrompt(`Create a ${preset} with dark mode and smooth animations`);
                  handleGenerate(undefined, `Create a ${preset} with dark mode and smooth animations`);
                }}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Sandpack Live Workspace */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span>🖥️ Sandbox Studio</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h2>
            <span className="text-xs text-slate-500">React + Tailwind Live Execution</span>
          </div>

          <SandpackPreview code={generatedCode} />
        </div>
      </main>
    </div>
  );
}
