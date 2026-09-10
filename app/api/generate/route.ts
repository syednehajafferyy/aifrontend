import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an expert AI code-generation engine (like Gemini and v0).
Your task is to turn a user prompt into a single, self-contained, highly interactive React + Tailwind CSS component exported as default export in App.tsx.

Rules:
- Return ONLY executable TSX React code for App.tsx. Do NOT wrap in markdown fences or add explanatory text.
- Use Tailwind CSS utility classes for styling — modern, vibrant designs, dark mode, smooth rounded corners, shadow effects, and flex/grid layouts.
- Rely on standard React hooks (useState, useEffect, useMemo, useRef) for rich interactive state.
- Do not import external packages other than "react" and "react-dom".
- Ensure the component is fully functional, visually impressive, responsive, and completely tailored to the user's prompt.`;

function generateSmartFallbackComponent(prompt: string, existingCode?: string): string {
  const p = prompt.toLowerCase();
  const cleanTitle = prompt.replace(/^build a|^create a|^make a|^generate a/i, '').trim() || "Dynamic Web App";
  const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  if (existingCode && existingCode.length > 50) {
    let modified = existingCode;
    if (p.includes("pink") || p.includes("rose")) {
      modified = modified
        .replace(/bg-slate-950/g, "bg-pink-950")
        .replace(/bg-slate-900/g, "bg-pink-900/80")
        .replace(/bg-indigo-600/g, "bg-pink-600");
    } else if (p.includes("purple") || p.includes("violet")) {
      modified = modified
        .replace(/bg-slate-950/g, "bg-purple-950")
        .replace(/bg-indigo-600/g, "bg-purple-600");
    }
    return modified;
  }

  // 1. CALCULATOR
  if (p.includes("calculator") || p.includes("math") || p.includes("counter")) {
    return `import React, { useState } from 'react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);

  const handleBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        const res = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
        setHistory(prev => [\`\${display} = \${res}\`, ...prev.slice(0, 4)]);
        setDisplay(String(res));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay(prev => prev === '0' || prev === 'Error' ? val : prev + val);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>🧮 ${capitalizedTitle}</span>
          <span className="text-indigo-400 font-mono">App.tsx</span>
        </div>
        <div className="bg-slate-950 rounded-2xl p-4 text-right space-y-1 border border-slate-800">
          <div className="text-xs text-slate-500 min-h-[16px]">{history[0] || ''}</div>
          <div className="text-3xl font-mono font-bold text-white tracking-wider overflow-x-auto">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((btn, i) => (
            <button
              key={i}
              onClick={() => handleBtn(btn === '⌫' ? 'C' : btn)}
              className={\`h-14 rounded-2xl font-bold text-lg transition \${
                btn === '=' ? 'col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg' :
                ['C', '÷', '×', '-', '+', '⌫'].includes(btn) ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400' :
                'bg-slate-800/40 hover:bg-slate-800 text-white'
              }\`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}`;
  }

  // 2. PORTFOLIO
  if (p.includes("portfolio") || p.includes("bio") || p.includes("resume") || p.includes("developer")) {
    return `import React, { useState } from 'react';

export default function App() {
  const projects = [
    { title: 'AI Code Generator', desc: 'Full-stack AI canvas & live React compiler with Gemini integration.', tags: ['React', 'Tailwind', 'Gemini API'] },
    { title: 'Cloud Analytics Portal', desc: 'Real-time dashboard with dynamic chart visualizers.', tags: ['Next.js', 'TypeScript', 'Prisma'] },
    { title: 'Headless E-Commerce', desc: 'Modern store with shopping cart drawer and Stripe checkout.', tags: ['React', 'Tailwind', 'Stripe'] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              JS
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Alex Rivera</h1>
              <p className="text-xs text-indigo-400 font-medium">Senior Software Engineer</p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase">
            ✨ ${capitalizedTitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Building modern web applications & AI developer tooling.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Specializing in high-performance React frontends, intuitive design systems, and serverless backend architecture.
          </p>
        </section>

        <section className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white">Featured Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-lg font-bold text-white">{proj.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{proj.desc}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {proj.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/50">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}`;
  }

  // DEFAULT SYNTHESIZER
  return `import React, { useState } from 'react';

export default function App() {
  const [active, setActive] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 flex flex-col items-center justify-center text-center space-y-6">
      <div className="space-y-3 max-w-xl">
        <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase">
          ✨ Custom Component
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
          ${capitalizedTitle}
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Interactive React component built with Tailwind CSS.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-xl">
        <div className="text-sm font-semibold text-slate-300">
          Component Status: <span className={active ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{active ? 'Active' : 'Inactive'}</span>
        </div>
        <button
          onClick={() => setActive(!active)}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg"
        >
          {active ? 'Deactivate Component' : 'Activate Component'}
        </button>
      </div>
    </div>
  );
}`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user ? (session.user as { id: string }).id : "guest-user";
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  const rl = checkRateLimit(`gen_${userId || ip}`, { limit: 15, windowMs: 60000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before generating again." },
      { status: 429, headers: corsHeaders }
    );
  }

  const body = await req.json().catch(() => ({}));
  const prompt = body.prompt || "";
  const existingCode = body.existingCode || "";

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Strategy 1: Google Gemini (2.0 Flash / 1.5 Flash)
  if (geminiKey && !geminiKey.includes("your-key-here") && geminiKey.length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      let model;
      try {
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      }

      const userMsg = existingCode && existingCode.length > 50
        ? `EXISTING REACT CODE:\n\`\`\`tsx\n${existingCode}\n\`\`\`\n\nUSER MODIFICATION REQUEST: ${prompt}\n\nINSTRUCTION: Modify the Existing Code according to the User Modification Request. Output ONLY executable TSX code.`
        : `USER REQUEST: ${prompt}\n\nINSTRUCTION: Create a complete, modern, interactive React component in Tailwind CSS for App.tsx. Output ONLY executable TSX code.`;

      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${userMsg}`);
      let code = result.response.text();
      code = code.replace(/```jsx|```javascript|```tsx|```/g, "").trim();

      if (code && code.length > 20) {
        return new Response(code, {
          headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    } catch (err: any) {
      console.warn("GoogleGenerativeAI SDK error, attempting direct REST fetch...", err?.message);
      try {
        const userPrompt = existingCode && existingCode.length > 50
          ? `EXISTING REACT CODE:\n${existingCode}\n\nUSER REQUEST: ${prompt}`
          : `USER REQUEST: ${prompt}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          let code = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          code = code.replace(/```jsx|```javascript|```tsx|```/g, "").trim();
          if (code.length > 20) {
            return new Response(code, { headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
          }
        }
      } catch (e) {
        console.warn("Gemini REST API fetch error", e);
      }
    }
  }

  // Strategy 2: Anthropic Provider
  if (apiKey && !apiKey.includes("your-key-here") && apiKey.length > 10) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Build: ${prompt}\nExisting Code: ${existingCode}` }],
      });
      const codeText = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const cleaned = codeText.replace(/```jsx|```javascript|```tsx|```/g, "").trim();
      return new Response(cleaned, { headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
    } catch (err) {
      console.warn("Anthropic call failed in backend", err);
    }
  }

  // Strategy 3: Smart Synthesizer Fallback
  const fallbackCode = generateSmartFallbackComponent(prompt, existingCode);
  return new Response(fallbackCode, {
    headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
  });
}
