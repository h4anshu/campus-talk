import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      collegeId: string | null;
      role: Role;
      year: number | null;
      dept: string | null;
      bio: string | null;
    } & DefaultSession['user'];
  }
}
