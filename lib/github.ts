import { Octokit } from "@octokit/rest";
import { buildProjectScaffold } from "./projectScaffold";

/**
 * Thin wrapper around Octokit for the 1-click deploy flow:
 *   1. verifyAndCreateRepo — checks repo existence on authenticated user's account & creates via POST /user/repos if 404
 *   2. pushFullProjectToGithub — Step A (Blobs), Step B (Tree), Step C (Commit), Step D (Ref Update) for complete project tree
 *   3. createRepo        — POST /user/repos (repo scope)
 *   4. commitFiles       — creates a tree + commit + updates the ref in one shot
 *   5. triggerVercelDeploy — hits the project's Vercel Deploy Hook URL
 */
export function githubClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function getAuthenticatedUser(accessToken: string) {
  const octokit = githubClient(accessToken);
  const { data } = await octokit.users.getAuthenticated();
  return data;
}

export async function verifyAndCreateRepo(
  accessToken: string,
  { name, isPrivate = false }: { name: string; isPrivate?: boolean }
) {
  const octokit = githubClient(accessToken);
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;

  try {
    const { data: existingRepo } = await octokit.repos.get({ owner, repo: name });
    return {
      owner: existingRepo.owner.login,
      repo: existingRepo.name,
      htmlUrl: existingRepo.html_url,
      defaultBranch: existingRepo.default_branch || "main",
      created: false,
    };
  } catch (err: any) {
    if (err.status === 404) {
      const { data: newRepo } = await octokit.repos.createForAuthenticatedUser({
        name,
        private: isPrivate,
        auto_init: true,
        description: "Generated with DevForge AI",
      });
      return {
        owner: newRepo.owner.login,
        repo: newRepo.name,
        htmlUrl: newRepo.html_url,
        defaultBranch: newRepo.default_branch || "main",
        created: true,
      };
    }
    throw err;
  }
}

export async function pushFullProjectToGithub(
  accessToken: string,
  opts: {
    repoName: string;
    appCode: string;
    isPrivate?: boolean;
    onProgress?: (status: string, percent: number) => void;
  }
) {
  const octokit = githubClient(accessToken);

  opts.onProgress?.("Authenticating with GitHub...", 5);
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const cleanRepo = opts.repoName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  opts.onProgress?.("Verifying GitHub repository...", 10);
  let defaultBranch = "main";
  try {
    const { data: existingRepo } = await octokit.repos.get({ owner, repo: cleanRepo });
    defaultBranch = existingRepo.default_branch || "main";
  } catch (err: any) {
    if (err.status === 404) {
      opts.onProgress?.("Creating repository on GitHub...", 15);
      const { data: newRepo } = await octokit.repos.createForAuthenticatedUser({
        name: cleanRepo,
        private: opts.isPrivate || false,
        auto_init: true,
        description: "Generated with DevForge AI",
      });
      defaultBranch = newRepo.default_branch || "main";
    } else {
      throw err;
    }
  }

  const scaffoldFiles = buildProjectScaffold(cleanRepo, opts.appCode);
  const entries = Object.entries(scaffoldFiles);
  const totalFiles = entries.length;

  opts.onProgress?.(`Step A: Creating blobs for ${totalFiles} project files...`, 20);
  const treeItems: Array<{ path: string; mode: "100644"; type: "blob"; sha: string }> = [];

  for (let i = 0; i < entries.length; i++) {
    const [filePath, content] = entries[i];
    const percent = 20 + Math.round(((i + 1) / totalFiles) * 50);
    opts.onProgress?.(`Step A: Pushing ${filePath} (${i + 1}/${totalFiles})...`, percent);

    const { data: blob } = await octokit.git.createBlob({
      owner,
      repo: cleanRepo,
      content: Buffer.from(content, "utf-8").toString("base64"),
      encoding: "base64",
    });

    treeItems.push({
      path: filePath,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  opts.onProgress?.("Step B: Creating Git tree...", 75);
  let baseCommitSha: string | undefined;
  let baseTreeSha: string | undefined;

  try {
    const { data: ref } = await octokit.git.getRef({ owner, repo: cleanRepo, ref: `heads/${defaultBranch}` });
    baseCommitSha = ref.object.sha;
    const { data: baseCommit } = await octokit.git.getCommit({ owner, repo: cleanRepo, commit_sha: baseCommitSha });
    baseTreeSha = baseCommit.tree.sha;
  } catch {
    // Base ref doesn't exist yet, creates root tree
  }

  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo: cleanRepo,
    tree: treeItems,
    base_tree: baseTreeSha,
  });

  opts.onProgress?.("Step C: Creating Git commit...", 88);
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo: cleanRepo,
    message: "Commit full project scaffold from DevForge AI",
    tree: newTree.sha,
    parents: baseCommitSha ? [baseCommitSha] : [],
  });

  opts.onProgress?.("Step D: Updating branch ref...", 95);
  try {
    await octokit.git.updateRef({
      owner,
      repo: cleanRepo,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha,
      force: true,
    });
  } catch {
    await octokit.git.createRef({
      owner,
      repo: cleanRepo,
      ref: `refs/heads/${defaultBranch}`,
      sha: newCommit.sha,
    });
  }

  opts.onProgress?.("Complete!", 100);

  return {
    owner,
    repo: cleanRepo,
    htmlUrl: `https://github.com/${owner}/${cleanRepo}`,
    commitSha: newCommit.sha,
  };
}

export async function createRepo(
  accessToken: string,
  { name, isPrivate }: { name: string; isPrivate: boolean }
) {
  const octokit = githubClient(accessToken);
  const { data } = await octokit.repos.createForAuthenticatedUser({
    name,
    private: isPrivate,
    auto_init: true, // creates an initial commit so we have a base tree to build on
    description: "Generated with DevForge AI",
  });
  return { owner: data.owner.login, repo: data.name, htmlUrl: data.html_url, defaultBranch: data.default_branch };
}

/**
 * Commits a flat map of { path: content } in a single tree + commit, then
 * fast-forwards the default branch ref. This avoids one API call per file.
 */
export async function commitFiles(
  accessToken: string,
  opts: {
    owner: string;
    repo: string;
    branch: string;
    files: Record<string, string>;
    message?: string;
  }
) {
  const octokit = githubClient(accessToken);
  const { owner, repo, branch, files, message = "Initial commit from DevForge AI" } = opts;

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const latestCommitSha = ref.object.sha;

  const { data: baseCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });

  const blobs = await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(content, "utf-8").toString("base64"),
        encoding: "base64",
      });
      return { path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    })
  );

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseCommit.tree.sha,
    tree: blobs,
  });

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });

  return { commitSha: commit.sha };
}

/** Fires the Vercel Deploy Hook configured for the target project. */
export async function triggerVercelDeploy(deployHookUrl: string) {
  const res = await fetch(deployHookUrl, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Vercel deploy hook failed: ${res.status} ${await res.text()}`);
  }
  return res.json().catch(() => ({}));
}
