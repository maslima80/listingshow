import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, teamMembers, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    teamId?: string;
    teamSlug?: string;
    teamMode?: string;
  }
  interface Session {
    user: {
      id: string;
      teamId?: string;
      teamSlug?: string;
      teamMode?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    teamId?: string;
    teamSlug?: string;
    teamMode?: string;
  }
}

import { DefaultSession } from "next-auth";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = signInSchema.parse(credentials);
          const normalizedEmail = email.toLowerCase().trim();

          // Get user with team membership
          const result = await db
            .select({
              userId: users.id,
              email: users.email,
              name: users.name,
              passwordHash: users.passwordHash,
              teamId: teams.id,
              teamSlug: teams.slug,
              teamMode: teams.teamMode,
            })
            .from(users)
            .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
            .leftJoin(teams, eq(teamMembers.teamId, teams.id))
            .where(eq(users.email, normalizedEmail))
            .limit(1);

          const user = result[0];
          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.userId,
            email: user.email,
            name: user.name,
            teamId: user.teamId || undefined,
            teamSlug: user.teamSlug || undefined,
            teamMode: user.teamMode || undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/signin",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.teamId = user.teamId;
        token.teamSlug = user.teamSlug;
        token.teamMode = user.teamMode;
      }

      // Refresh team data on update
      if (trigger === "update" && token.id) {
        const result = await db
          .select({
            teamId: teams.id,
            teamSlug: teams.slug,
            teamMode: teams.teamMode,
          })
          .from(teamMembers)
          .innerJoin(teams, eq(teamMembers.teamId, teams.id))
          .where(eq(teamMembers.userId, token.id))
          .limit(1);

        if (result[0]) {
          token.teamId = result[0].teamId;
          token.teamSlug = result[0].teamSlug;
          token.teamMode = result[0].teamMode;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.teamId = token.teamId;
        session.user.teamSlug = token.teamSlug;
        session.user.teamMode = token.teamMode;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
