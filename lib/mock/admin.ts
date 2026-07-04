// Mock-only credential check for Phase 1 UI. Replaced with real hashed
// auth (NextAuth + Prisma) in the backend phase — never wire this to anything real.
export const MOCK_ADMIN_PASSWORD: string = 'admin123';
