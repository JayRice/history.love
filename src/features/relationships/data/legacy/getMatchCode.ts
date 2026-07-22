// Transitional: pairing now runs on hashed single-use invitations
// (create_invitation RPC). The plaintext code is returned exactly once by
// the database; we cache it in the caller's OWN profile meta (owner-only
// RLS) so the pairing screen can keep displaying it, mirroring where the
// legacy app kept match_code. The invitations table stores only the hash.
import { supabase } from '@/src/shared/lib/supabase';
import { logger } from '@/src/shared/lib/logger';

export default async function getMatchCode(): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_invitation', {});
  if (error) {
    logger.warn("create_invitation failed:", error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  const code: string | undefined = row?.code;
  if (!code) return null;

  await supabase.rpc('update_profile_meta', {
    p_patch: { profile: { match_code: code } },
  });

  return code;
}
