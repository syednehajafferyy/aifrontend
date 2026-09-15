import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LeadDataSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the in-app assistant for DevForge AI (Gemini Edition).
Help visitors with questions about generating, customizing, and deploying React web components.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as { id: string }).id : null;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Enforce sliding-window rate limit (20 chat messages per minute per IP/user)
  const rl = checkRateLimit(`chat_${userId || ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before sending another message." },
      { status: 429 }
    );
  }

  const { messages, projectId }: { messages: ChatMessage[]; projectId?: string } = await req.json().catch(() => ({ messages: [] }));
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey && !geminiKey.includes("your-key-here")) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${lastUserMsg}` }] }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm ready to help you build and customize your web application!";
        return NextResponse.json({ reply, leadCaptured: false });
      }
    } catch (e) {
      console.warn("Backend Gemini chat call error", e);
    }
  }

  if (apiKey && !apiKey.includes("your-key-here") && apiKey.length > 10) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      });
      const replyText = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      return NextResponse.json({ reply: replyText, leadCaptured: false });
    } catch (e) {
      console.warn("Backend chat anthropic call error", e);
    }
  }

  // Fallback response
  return NextResponse.json({
    reply: "I am ready to help you generate, customize, and deploy your web components!",
    leadCaptured: false,
  });
}
