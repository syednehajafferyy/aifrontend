import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getGithubAccessToken } from "@/lib/auth";
import { createRepo, commitFiles, triggerVercelDeploy } from "@/lib/github";
import { buildProjectScaffold } from "@/lib/projectScaffold";
import { createAndDeployVercelProject } from "@/lib/vercel";
import { db } from "@/lib/db";
import { DeployRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

/**
 * Drives the deployment pipeline described in the assignment's stepper:
 *   Creating Repo -> Committing Scaffold Files -> Programmatic Vercel Deploy -> Live at URL
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const parsed = DeployRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { projectId, repoName, files, isPrivate } = parsed.data;

  const patFromCookie = req.cookies.get("devforge_github_pat")?.value;
  const patFromHeader = req.headers.get("x-github-token");
  const accessToken = patFromCookie || patFromHeader || (await getGithubAccessToken(userId));

  if (!accessToken) {
    return NextResponse.json(
      { error: "No GitHub token found. Please click 'Connect to GitHub' to authorize or save a Personal Access Token." },
      { status: 400 }
    );
  }

  try {
    await db.project.update({ where: { id: projectId }, data: { status: "deploying" } });

    // Step 1: Create GitHub Repo
    const repo = await createRepo(accessToken, { name: repoName, isPrivate });

    // Step 2: Build complete Next.js project scaffold around App.tsx code
    const appCode = files["App.tsx"] || files["/App.tsx"] || "";
    const scaffoldFiles = buildProjectScaffold(repoName, appCode);

    // Merge any additional custom files if present
    const commitPayload = { ...scaffoldFiles, ...files };

    // Commit complete scaffold tree
    await commitFiles(accessToken, {
      owner: repo.owner,
      repo: repo.repo,
      branch: repo.defaultBranch,
      files: commitPayload,
    });

    // Step 3: Trigger Build via Vercel REST API or Deploy Hook
    let liveUrl: string | null = null;

    // Try Vercel REST API per-project deployment first
    const vercelResult = await createAndDeployVercelProject({
      projectName: repoName,
      githubOwner: repo.owner,
      githubRepo: repo.repo,
    });

    if (vercelResult.liveUrl) {
      liveUrl = vercelResult.liveUrl;
    } else if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      // Fall back to pre-configured deploy hook if set
      await triggerVercelDeploy(process.env.VERCEL_DEPLOY_HOOK_URL);
    }

    const finalStatus = liveUrl ? "live" : "build";

    await db.project.update({
      where: { id: projectId },
      data: { status: finalStatus, repoUrl: repo.htmlUrl, liveUrl },
    });

    return NextResponse.json({ phase: finalStatus, repoUrl: repo.htmlUrl, liveUrl });
  } catch (err) {
    await db.project.update({ where: { id: projectId }, data: { status: "failed" } });
    const message = err instanceof Error ? err.message : "Deployment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    status: project.status,
    repoUrl: project.repoUrl,
    liveUrl: project.liveUrl,
  });
}
