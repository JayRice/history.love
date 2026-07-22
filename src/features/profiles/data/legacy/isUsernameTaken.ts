import { supabase } from '@/src/shared/lib/supabase';
import { logger } from '@/src/shared/lib/logger';

export default async function isUsernameTaken(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_handle_taken', { p_handle: username });
  if (error) {
    logger.warn("handle check failed:", error.message);
    return false;
  }
  return data === true;
}
