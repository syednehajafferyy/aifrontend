"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { STARTER_TEMPLATES } from "@/lib/templates";
import {
  Github,
  LayoutGrid,
  Search,
  Sparkles,
  Folder,
  Globe,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronRight,
  Crown,
  Plus,
  History,
  Smartphone,
  Monitor,
  Tablet,
  Link as LinkIcon,
  Maximize2,
  ExternalLink,
} from "lucide-react";

// Disable SSR for Sandpack to clear React Error #418 & hydration issues
const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full flex flex-col items-center justify-center bg-white text-slate-400 rounded-2xl border border-slate-200 animate-pulse gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      <p className="text-sm font-medium text-slate-600">Initializing DevForge Engine...</p>
    </div>
  ),
});

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screenMode, setScreenMode] = useState<"single" | "flow">("single");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [viewMode, setViewMode] = useState<"code" | "split">("code");
  const [activeNav, setActiveNav] = useState<string>("dashboard");

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

  const projects = [
    { title: "Zoromi Landingpage", date: "Edited May 12, 2026", key: "ecommerce", bg: "from-blue-500/10 to-indigo-500/10" },
    { title: "Zoromi", date: "Edited May 8, 2026", key: "saas-landing", bg: "from-slate-100 to-slate-200" },
    { title: "BYDH Mobile App", date: "Edited May 6, 2026", key: "portfolio", bg: "from-sky-500/10 to-blue-500/10" },
    { title: "Ondo POS Dashboard", date: "Edited May 4, 2026", key: "dashboard", bg: "from-orange-500/10 to-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-16 md:w-20 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-5 sticky top-0 h-screen z-30">
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20">
            ⚡
          </div>
          <button className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs transition">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Icons */}
        <nav className="flex flex-col items-center gap-3">
          <a
            href="https://github.com/syednehajafferyy/aifrontend.git"
            target="_blank"
            rel="noreferrer"
            title="GitHub Repository"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Github className="w-5 h-5" />
          </a>

          {[
            { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
            { id: "search", icon: Search, label: "Search" },
            { id: "ai", icon: Sparkles, label: "AI Studio" },
            { id: "projects", icon: Folder, label: "Projects" },
            { id: "templates", icon: Globe, label: "Templates" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </nav>

        {/* Bottom Icons */}
        <div className="flex flex-col items-center gap-3">
          <button title="Feedback" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button title="Settings" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          {/* Left Profile Segment */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 cursor-pointer transition border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                JS
              </div>
              <span className="text-xs font-bold text-slate-800">Jimmy Sullivan</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Upgrade Pro</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition">
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 space-y-10">
          {/* 3. Hero Greeting Header */}
          <div className="text-center space-y-2 pt-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Good morning, <span className="text-slate-500 font-semibold">Jimmy</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">Start generating your designs</p>
          </div>

          {/* 4. Center Floating Prompt Studio Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-4 space-y-4 max-w-3xl mx-auto transition-all">
            {/* Top Toolbar Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              {/* Left Screen Mode Pills */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full text-xs font-medium text-slate-600">
                <button
                  onClick={() => setScreenMode("single")}
                  className={`px-3.5 py-1 rounded-full transition ${
                    screenMode === "single"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  Single Screen
                </button>
                <button
                  onClick={() => setScreenMode("flow")}
                  className={`px-3.5 py-1 rounded-full transition ${
                    screenMode === "flow"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  Create Flow
                </button>
              </div>

              {/* Right Viewport Mode Pills */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full text-xs font-medium text-slate-600">
                <button className="p-1.5 rounded-full hover:bg-white text-slate-500 hover:text-slate-900 transition">
                  <History className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    deviceMode === "mobile"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    deviceMode === "desktop"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    deviceMode === "tablet"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
              </div>
            </div>

            {/* Middle Text Prompt Input */}
            <form onSubmit={(e) => handleGenerate(e)}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="✨ Write whatever you want here (e.g. 'Build an E-Commerce storefront', 'Create a SaaS pricing matrix')..."
                className="w-full bg-transparent p-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none"
              />

              {/* Bottom Toolbar & Generate Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!prompt.trim() || loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between max-w-3xl mx-auto">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
          )}

          {/* 5. Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-600" />
                <span>Project</span>
              </h2>

              {generatedCode && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setViewMode("code")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        viewMode === "code" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Code Only
                    </button>
                    <button
                      onClick={() => setViewMode("split")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        viewMode === "split" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Split View
                    </button>
                  </div>
                  <button
                    onClick={openLivePreviewNewTab}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <span>🚀 Open Live Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Projects Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj.title}
                  onClick={() => {
                    if (STARTER_TEMPLATES[proj.key]) {
                      setPrompt(STARTER_TEMPLATES[proj.key].prompt);
                      setGeneratedCode(STARTER_TEMPLATES[proj.key].code);
                      localStorage.setItem("devforge_preview_code", STARTER_TEMPLATES[proj.key].code);
                    }
                  }}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-3 hover:shadow-lg hover:border-slate-300 cursor-pointer transition group"
                >
                  <div className={`h-36 rounded-xl bg-gradient-to-tr ${proj.bg} border border-slate-100 flex items-center justify-center overflow-hidden p-4 group-hover:scale-[1.02] transition`}>
                    <div className="w-full h-full rounded-lg bg-white/80 border border-slate-200/60 p-2 space-y-2 shadow-sm flex flex-col justify-between">
                      <div className="w-12 h-2 rounded bg-slate-300"></div>
                      <div className="space-y-1">
                        <div className="w-full h-1.5 rounded bg-slate-200"></div>
                        <div className="w-3/4 h-1.5 rounded bg-slate-200"></div>
                      </div>
                      <div className="w-8 h-3 rounded bg-blue-500/20"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">{proj.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">{proj.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Sandpack Code Studio */}
          {generatedCode && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Generated Codebase Output</h3>
                <button
                  onClick={openLivePreviewNewTab}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Open preview in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <SandpackPreview code={generatedCode} codeOnly={viewMode === "code"} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
