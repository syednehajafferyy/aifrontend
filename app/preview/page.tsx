"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      <p className="text-sm font-medium">Loading Fullscreen Live Preview...</p>
    </div>
  ),
});

export default function PreviewPage() {
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const storedCode = localStorage.getItem("devforge_preview_code");
    if (storedCode) {
      setCode(storedCode);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            ⚡
          </div>
          <span className="font-bold text-white text-sm">DevForge Live Preview</span>
          <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
            Full View
          </span>
        </div>
        <button
          onClick={() => window.close()}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Close Tab ✕
        </button>
      </header>
      <main className="flex-1 p-4 flex flex-col">
        <SandpackPreview code={code} previewOnly={true} />
      </main>
    </div>
  );
}
