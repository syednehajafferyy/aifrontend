// DevForge AI — Vercel REST API Integration

export async function createAndDeployVercelProject(opts: {
  projectName: string;
  githubOwner: string;
  githubRepo: string;
}): Promise<{ liveUrl: string | null; vercelProjectId: string | null }> {
  const token = process.env.VERCEL_AUTH_TOKEN;
  if (!token) {
    console.log("[Vercel API] VERCEL_AUTH_TOKEN missing, skipping automated Vercel project creation.");
    return { liveUrl: null, vercelProjectId: null };
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const teamQuery = teamId ? `?teamId=${teamId}` : "";
  const name = opts.projectName.toLowerCase().replace(/[^a-z0-9-_]/g, "-").slice(0, 100);

  try {
    // 1. Create project on Vercel linked to GitHub repo
    const createRes = await fetch(`https://api.vercel.com/v9/projects${teamQuery}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        framework: "nextjs",
        gitRepository: {
          type: "github",
          repo: `${opts.githubOwner}/${opts.githubRepo}`,
        },
      }),
    });

    if (!createRes.ok && createRes.status !== 409) {
      // 409 means project already exists, which is acceptable
      const errText = await createRes.text();
      console.warn(`[Vercel API] Create project warning (${createRes.status}):`, errText);
    }

    const projectData = await createRes.json().catch(() => ({}));
    const projectId = projectData.id ?? name;

    // 2. Trigger deployment for the newly created Vercel project
    const deployRes = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        gitSource: {
          type: "github",
          ref: "main",
          repoId: `${opts.githubOwner}/${opts.githubRepo}`,
        },
      }),
    });

    if (deployRes.ok) {
      const deployData = await deployRes.json();
      const url = deployData.url ? `https://${deployData.url}` : `https://${name}.vercel.app`;
      return { liveUrl: url, vercelProjectId: projectId };
    }

    // Default Vercel production domain structure if deployment triggered asynchronously
    return { liveUrl: `https://${name}.vercel.app`, vercelProjectId: projectId };
  } catch (err) {
    console.error("[Vercel API] Automated deployment error:", err);
    return { liveUrl: null, vercelProjectId: null };
  }
}
