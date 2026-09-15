import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";

/**
 * Vercel deployment webhook. Configure this URL in the Vercel project's
 * Settings -> Webhooks for the `deployment.succeeded` and `deployment.error`
 * events. This is what closes the loop for the "Live at URL" step in
 * DeployStepper.tsx after /api/deploy triggers the build.
 *
 * Verifies the `x-vercel-signature` header against VERCEL_WEBHOOK_SECRET
 * per https://vercel.com/docs/observability/webhooks-overview/webhooks-api#securing-webhooks
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-vercel-signature");
  const secret = process.env.VERCEL_WEBHOOK_SECRET;

  if (secret) {
    const expected = crypto.createHmac("sha1", secret).update(rawBody).digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);
  const type = payload.type as string;
  const repoName: string | undefined = payload.payload?.deployment?.meta?.githubRepo;

  if (!repoName) {
    return NextResponse.json({ received: true, note: "No repo metadata on payload" });
  }

  const project = await db.project.findFirst({ where: { repoUrl: { contains: repoName } } });
  if (!project) {
    return NextResponse.json({ received: true, note: "No matching project" });
  }

  if (type === "deployment.succeeded") {
    const liveUrl = payload.payload?.deployment?.url
      ? `https://${payload.payload.deployment.url}`
      : null;
    await db.project.update({ where: { id: project.id }, data: { status: "live", liveUrl } });
  } else if (type === "deployment.error") {
    await db.project.update({ where: { id: project.id }, data: { status: "failed" } });
  }

  return NextResponse.json({ received: true });
}
