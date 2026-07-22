import { supabase } from '@/src/shared/lib/supabase';
import { logger } from '@/src/shared/lib/logger';

export default async function markRead(_uid: string, notificationId: string) {
  const { error } = await supabase
    .from('app_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
  if (error) logger.warn("mark read failed:", error.message);
}
