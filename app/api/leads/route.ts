import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  const search = req.nextUrl.searchParams.get("search");

  const whereClause: Record<string, unknown> = {};
  if (projectId) whereClause.projectId = projectId;
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { requirement: { contains: search, mode: "insensitive" } },
    ];
  }

  const leads = await db.lead.findMany({
    where: whereClause,
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leadId = req.nextUrl.searchParams.get("id");
  if (!leadId) {
    return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
  }

  await db.lead.delete({ where: { id: leadId } });
  return NextResponse.json({ success: true });
}
