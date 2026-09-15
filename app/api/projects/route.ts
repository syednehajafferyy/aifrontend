import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as { id: string }).id : "demo-guest-user-id";

  try {
    const projects = await db.project.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        prompt: true,
        template: true,
        status: true,
        repoUrl: true,
        liveUrl: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ projects: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as { id: string }).id : "demo-guest-user-id";

  const body = await req.json().catch(() => ({}));
  const name = body.name?.trim() || `Project ${new Date().toLocaleDateString()}`;
  const template = body.template || "blank";

  try {
    // Upsert parent User record to guarantee relation validity
    if (userId) {
      await db.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: session?.user?.name || "Demo Builder",
          email: session?.user?.email || `guest_${userId}@devforge.ai`,
          image: session?.user?.image || "https://avatar.vercel.sh/guest",
        },
      });
    }

    const project = await db.project.create({
      data: {
        userId,
        name,
        prompt: "",
        template,
        status: "draft",
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.warn("POST /api/projects fallback:", err);
    const project = await db.project.create({
      data: {
        name,
        prompt: "",
        template,
        status: "draft",
      },
    });
    return NextResponse.json({ project }, { status: 201 });
  }
}

export async function DELETE(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("id");
  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  try {
    await db.project.delete({ where: { id: projectId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
