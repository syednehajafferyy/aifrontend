import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "devforge-super-secret-jwt-key-2026-production",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Demo Guest",
      credentials: {},
      async authorize() {
        try {
          let user = await db.user.findFirst({ where: { email: "guest@devforge.ai" } });
          if (!user) {
            user = await db.user.create({
              data: {
                name: "Demo Builder",
                email: "guest@devforge.ai",
                image: "https://avatar.vercel.sh/guest",
              },
            });
          }
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        } catch {
          return { id: "demo-guest-id", name: "Demo Builder", email: "guest@devforge.ai" };
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "dummy_github_id",
      clientSecret: process.env.GITHUB_SECRET || "dummy_github_secret",
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
      profile(profile: any) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubLogin: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token?: any }) {
      if (session.user && token?.id) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getGithubAccessToken(userId: string) {
  try {
    const account = await db.account.findFirst({
      where: { userId, provider: "github" },
    });
    return account?.access_token ?? null;
  } catch {
    return null;
  }
}
