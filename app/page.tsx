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
      <p className="text-sm font-medium">Initializing DevForge Code Engine...</p>
    </div>
  ),
});

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [viewMode, setViewMode] = useState<"code" | "split">("code");

  const handleGenerate = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";
      const apiEndpoint = backendUrl ? `${backendUrl}/api/generate` : "/api/generate";

      const response = await fetch(apiEndpoint, {
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
        localStorage.setItem("devforge_preview_code", code);
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "Failed to generate component");
    } finally {
      setLoading(false);
    }
  };

  const openLivePreviewNewTab = () => {
    if (generatedCode) {
      localStorage.setItem("devforge_preview_code", generatedCode);
    }
    window.open("/preview", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* 1. Header Section */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Left Side: Logo & GitHub Link */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-lg">
                ⚡
              </div>
              <span className="font-bold text-white text-base tracking-tight hidden sm:inline">DevForge AI</span>
            </div>
            <a
              href="https://github.com/syednehajafferyy/aifrontend.git"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5"
            >
              <span>GitHub Repo</span>
            </a>
          </div>

          {/* Center: Pages Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            {[
              { id: "home", label: "Home" },
              { id: "projects", label: "Projects" },
              { id: "dashboard", label: "Dashboard" },
              { id: "templates", label: "Templates" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Side: Gemini Status Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Gemini 2.0 Flash
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Prompt Input Box */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-7 shadow-2xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">What do you want to build?</h2>
            <p className="text-xs text-slate-400">Enter a prompt describing any web application, software UI, or component (e.g. E-Commerce Store, SaaS Pricing Matrix)</p>
          </div>

          <form onSubmit={(e) => handleGenerate(e)} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="e.g. 'Build a modern SaaS pricing table with dark mode', 'Create a crypto dashboard'..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
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

          {/* Quick Starter Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-500 font-medium">Quick Prompts:</span>
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
                className="text-xs px-3 py-1 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
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

        {/* Code & Live Preview Workspace */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>💻 Generated Code Base</span>
              </h2>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode("code")}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    viewMode === "code" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Code Only
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    viewMode === "split" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Split View
                </button>
              </div>
            </div>

            {/* Live Preview in New Tab Button */}
            <button
              onClick={openLivePreviewNewTab}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>🚀 Open Live Preview in New Tab</span>
              <span>↗</span>
            </button>
          </div>

          {/* Sandpack Workspace */}
          <SandpackPreview
            code={generatedCode}
            codeOnly={viewMode === "code"}
          />
        </div>
      </main>
    </div>
  );
}
