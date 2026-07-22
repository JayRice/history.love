import Toast from 'react-native-toast-message';
import { supabase } from '@/src/shared/lib/supabase';
import { isValidMatchCode } from '../../domain/isValidMatchCode';

export default async function pairUsers(matchCode: string): Promise<{ success: boolean }> {
  if (!isValidMatchCode(matchCode)) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: `Invalid Match Code: ${matchCode}`,
    });
    return { success: false };
  }

  const { error } = await supabase.rpc('accept_invitation', {
    p_code: matchCode.toUpperCase(),
  });

  if (error) {
    Toast.show({ type: "error", text1: "Error", text2: "That code did not work. Check it and try again." });
    return { success: false };
  }

  return { success: true };
}
