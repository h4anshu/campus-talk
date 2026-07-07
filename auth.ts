import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser } from '@prisma/client';

async function findMatchingCollege(email: string | null | undefined) {
  const domain = email?.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  const colleges = await prisma.college.findMany({ where: { isActive: true } });
  return colleges.find((college) => new RegExp(college.domainPattern, 'i').test(domain)) ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required for self-hosted/non-Vercel-auto-detected deployments (and for
  // `next start` locally) — without this, Auth.js rejects the request's Host
  // header as untrusted and middleware's auth() check fails, which must NOT
  // silently fail open.
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      const college = await findMatchingCollege(user.email);
      if (!college) return '/login?error=domain';
      return true;
    },
    async session({ session, user }) {
      // The Prisma adapter returns the full User row at runtime; NextAuth's
      // built-in AdapterUser type just doesn't know about our custom columns.
      const dbUser = user as unknown as PrismaUser;
      session.user.id = dbUser.id;
      session.user.collegeId = dbUser.collegeId;
      session.user.role = dbUser.role;
      session.user.year = dbUser.year;
      session.user.dept = dbUser.dept;
      session.user.bio = dbUser.bio;
      session.user.banner = dbUser.banner;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const college = await findMatchingCollege(user.email);
      if (college) {
        await prisma.user.update({
          where: { id: user.id },
          data: { collegeId: college.id },
        });
      }
    },
  },
});
