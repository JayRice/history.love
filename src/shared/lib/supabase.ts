import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/shared/types/database";

// The single Supabase client for the app. Only the publishable anon key is
// ever present here; authorization lives in RLS and RPCs, never the client.
//
// Session storage: AsyncStorage. expo-secure-store was considered (plan
// section 2) but its 2KB value limit truncates Supabase session payloads;
// hardening (chunked secure storage) is tracked in docs/migration-status.md.
export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
