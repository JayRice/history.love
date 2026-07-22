import Toast from 'react-native-toast-message';
import { supabase } from '@/src/shared/lib/supabase';

// Transitional unpair: the calm PRD closure flow arrives in Phase 7.
export default async function unpairUsers(): Promise<{ success: boolean }> {
  const { error } = await supabase.rpc('leave_relationship');
  if (error) {
    Toast.show({ type: "error", text1: "Error", text2: "Could not leave the relationship. Try again." });
    return { success: false };
  }
  return { success: true };
}
