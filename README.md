# DevForge AI

An AI-powered full-stack UI builder: describe a site in plain language, watch it compile live in
an in-browser sandbox, adjust its look with no-code style controls, and ship it to a real GitHub
repository with a live URL — all from one page. Built for the Level 4 OJT assessment brief.

## Feature map

| Brief requirement | Where it lives |
|---|---|
| Prompt-driven generation | `app/api/generate/route.ts` (streaming Claude call) + `components/SandpackPreview.tsx` |
| Template library | `components/TemplateGrid.tsx` |
| Streaming sandbox | `components/SandpackPreview.tsx` (Sandpack, live preview + console) |
| Multi-language selector + RTL | `lib/i18n.ts`, `components/LanguageSelector.tsx` |
| In-app chatbot | `components/ChatWidget.tsx` + `app/api/chat/route.ts` |
| Schema-driven lead extraction | `lib/schemas.ts` (`LeadDataSchema`) via tool-calling in `app/api/chat/route.ts` |
| Visual style inspector | `components/StyleInspector.tsx` |
| Deployment status tracker | `components/DeployStepper.tsx` |
| GitHub repo automation | `lib/github.ts`, `app/api/deploy/route.ts` |
| Vercel deploy trigger + webhook | `app/api/deploy/route.ts`, `app/api/webhook/vercel/route.ts` |
| Auth (GitHub OAuth, repo scope) | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Data model | `prisma/schema.prisma` |

## Architecture

```
Browser (Next.js App Router, TS, Tailwind, Zustand)
   │
   ├─ / ................... landing: template grid + prompt bar
   ├─ /login .............. GitHub OAuth sign-in
   ├─ /dashboard ........... builder workspace
   │     ├─ SandpackPreview      → streams from /api/generate
   │     ├─ StyleInspector       → local theme tokens, feeds next generation call
   │     ├─ ChatWidget           → /api/chat (assistant + lead capture)
   │     └─ DeployStepper        → /api/deploy, polls status until live
   │
   ▼
Next.js Route Handlers (Node runtime)
   ├─ /api/auth/[...nextauth]  NextAuth + Prisma adapter, GitHub provider (repo scope)
   ├─ /api/generate            Anthropic streaming completion → raw TSX
   ├─ /api/chat                Anthropic + tool-calling → Zod-validated Lead → Postgres
   ├─ /api/deploy              Octokit: create repo → commit tree → trigger Vercel hook
   └─ /api/webhook/vercel      Vercel deployment.succeeded → writes liveUrl
   │
   ▼
PostgreSQL (via Prisma): User, Account, Session, Project, Lead
```

### Why these choices

- **Sandpack over a custom iframe runtime** — gives isolated compilation, a console for surfacing
  build errors, and a live preview without us having to write a bundler.
- **Streaming generation** — the `/api/generate` route streams tokens directly from the Anthropic
  SDK's `messages.stream()` into the response body; the client appends chunks straight into the
  Sandpack file store so code appears as it's written, not after a multi-second wait.
- **Tool-calling for lead extraction** — rather than regexing chat transcripts, the model is given
  a `record_lead` tool whose schema mirrors `LeadDataSchema`. It only fires the tool once it has
  organically gathered real values, and the payload is still re-validated with Zod server-side
  before it touches the database.
- **Database-backed sessions + Prisma adapter** — needed so the GitHub OAuth access token
  (`Account.access_token`) survives between requests; that token is what lets `/api/deploy`
  create the repo under the *user's* GitHub account rather than a shared service account.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a GitHub OAuth App** at github.com/settings/developers
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy the client ID/secret into `.env.local`

3. **Copy the env template and fill it in**
   ```bash
   cp .env.example .env.local
   ```
   See the table below for what each variable does.

4. **Provision Postgres and push the schema**
   ```bash
   npm run db:push
   ```

5. **Run it**
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXTAUTH_URL` | Base URL NextAuth uses to build callback URLs |
| `NEXTAUTH_SECRET` | Session encryption secret — generate with `openssl rand -base64 32` |
| `GITHUB_ID` / `GITHUB_SECRET` | OAuth App credentials; the app requests the `repo` scope so deploys can create repositories on the user's behalf |
| `DATABASE_URL` | Postgres connection string for Prisma |
| `ANTHROPIC_API_KEY` | Powers both `/api/generate` (codegen) and `/api/chat` (assistant + lead extraction) |
| `GITHUB_SERVER_TOKEN` | Optional fallback PAT for server-initiated repo actions outside a user session |
| `VERCEL_DEPLOY_HOOK_URL` | Deploy Hook URL from the target Vercel project's settings |
| `VERCEL_WEBHOOK_SECRET` | Verifies the signature on incoming `deployment.succeeded` webhooks |

## Known limitations / what to verify before demoing

- The `/api/generate` endpoint asks the model for a single self-contained `App.tsx` using only
  Tailwind + React — it deliberately doesn't support arbitrary npm imports, since Sandpack's
  `react-ts` template only ships React itself.
- The Vercel deploy hook fires a build but doesn't return a live URL synchronously; the actual
  URL arrives via the `deployment.succeeded` webhook in `app/api/webhook/vercel/route.ts`, which
  you'll need to register in the Vercel project's settings and point at your deployed domain.
- `DeployStepper` polls `/api/deploy?projectId=` every 4s until the webhook marks the project
  live — this is a reasonable default for a student project but would want to move to
  server-sent events or a websocket for a production version.

## Submission checklist

- [ ] Push this repo to a public GitHub repository
- [ ] Confirm `README.md` (this file) covers architecture + env setup
- [ ] Record a 3-minute walkthrough demonstrating: prompt → live preview → style edit → deploy → live URL
