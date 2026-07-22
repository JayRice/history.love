// Apple sign-in is disabled during the Supabase migration: it requires
// Supabase OAuth provider configuration plus Apple credentials (founder
// decision + provider setup). The button remains but reports honestly.
import { Alert } from "react-native";

export default async function loginWithApple(): Promise<{ success: false; error: string }> {
  Alert.alert(
    "Not available yet",
    "Apple sign-in is being migrated. Please use email sign-in for now."
  );
  return { success: false, error: "Apple sign-in is not available during the migration." };
}
