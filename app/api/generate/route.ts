import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SYSTEM_PROMPT = `You are an expert AI code-generation engine (like Gemini and v0).
Your task is to turn a user prompt into a single, self-contained, highly interactive React + Tailwind CSS component exported as default export in App.tsx.

Rules:
- Return ONLY executable TSX React code for App.tsx. Do NOT wrap in markdown fences or add explanatory text.
- Use Tailwind CSS utility classes for styling — modern, vibrant designs, dark mode, smooth rounded corners, shadow effects, and flex/grid layouts.
- Rely on standard React hooks (useState, useEffect, useMemo, useRef) for rich interactive state.
- Do not import external packages other than "react" and "react-dom".
- Ensure the component is fully functional, visually impressive, responsive, and completely tailored to the user's prompt.`;

function isValidPrompt(p: string): { valid: boolean; message?: string } {
  const trimmed = p.trim();
  if (trimmed.length < 5) {
    return {
      valid: false,
      message: "Prompt is too short. Please describe a clear UI or component to generate (e.g. 'Build a portfolio landing page').",
    };
  }

  // Check for random gibberish (e.g., random keyboard mashing without real space/word structure)
  const words = trimmed.split(/\s+/);
  if (words.length === 1 && trimmed.length > 5 && !/[aeiou]{2,}/i.test(trimmed) && /[^aeiou]{4,}/i.test(trimmed)) {
    return {
      valid: false,
      message: "Invalid or non-sensical prompt. Please provide a meaningful description of the UI you want to build.",
    };
  }

  return { valid: true };
}

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

  // 1. Validate prompt input
  const validation = isValidPrompt(prompt);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.message },
      { status: 400, headers: corsHeaders }
    );
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // 2. Google Gemini Provider
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
      console.error("Gemini AI API Error:", err?.message || err);
      return NextResponse.json(
        { error: `Gemini API Generation Error: ${err?.message || "Failed to generate code from Google Gemini AI."}` },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // 3. Anthropic Provider Fallback
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
    } catch (err: any) {
      console.error("Anthropic Call Error:", err?.message || err);
    }
  }

  // If no valid API Key configured
  return NextResponse.json(
    { error: "API Key not configured. Please set GEMINI_API_KEY in your environment variables (.env.local or Vercel)." },
    { status: 400, headers: corsHeaders }
  );
}
