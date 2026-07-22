// Re-export of the shared session contract; the auth feature's domain owns
// the semantics, shared/types owns the shape (see shared/types/auth.ts).
export type { AuthUser, AuthResult } from '@/src/shared/types/auth';
