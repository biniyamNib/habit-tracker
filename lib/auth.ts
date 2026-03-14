// lib/auth.ts

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        // For demo: ALWAYS succeed with a fixed/fake user
        // In real app → check password + database lookup here
        if (!credentials?.email) return null;

        const demoUser = {
          id: 'demo-123',
          name: 'Demo User (Biniyam)',
          email: credentials.email as string,
          image: null,
        };

        // Optional: Ensure a user row exists in Neon DB
        await prisma.user.upsert({
          where: { email: demoUser.email },
          update: { name: demoUser.name },
          create: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
          },
        });

        return demoUser; // This MUST return a user object → no null!
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // optional: create this page later
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});