// Transitional: onboarding submission on Supabase. Uploads the avatar into
// the private profile-images bucket, then persists the form through the
// complete_onboarding RPC (structured columns + legacy_meta for the rest of
// the form document). The PRD onboarding (age gate, versioned consent)
// replaces this screen flow in the auth/consent phase.
import User from '@/src/shared/types/User';
import { supabase } from '@/src/shared/lib/supabase';
import { newId, uploadLocalFile } from '@/src/shared/lib/legacy/supabaseAppHelpers';

type OnboardingResponse =
  | { success: true; user: User }
  | { success: false; error: string };

export default async function handleOnboarding(user: User): Promise<OnboardingResponse> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) return { success: false, error: "Not signed in." };

  let avatarPath: string | null = null;
  const localUri = user?.profile?.profileImage?.local_uri;
  if (localUri && localUri.startsWith("file")) {
    const path = `${uid}/${newId()}.jpg`;
    if (await uploadLocalFile("profile-images", path, localUri, "image/jpeg")) {
      avatarPath = path;
    }
  }

  // Everything except identity lands in legacy_meta so the existing screens
  // keep reading the shapes they already know.
  const meta: Record<string, unknown> = {
    profile: {
      ...user.profile,
      profileImage: avatarPath ? { type: "stored", name: avatarPath } : user.profile?.profileImage,
    },
    partner: user.partner,
    settings: user.settings,
    location: user.location,
    analytics: user.analytics,
    data: user.data,
  };

  const displayName = [user.profile?.first_name, user.profile?.last_name]
    .filter(Boolean)
    .join(" ");

  const { error } = await supabase.rpc("complete_onboarding", {
    p_display_name: displayName || undefined,
    p_handle: user.profile?.username ?? undefined,
    p_avatar_path: avatarPath ?? undefined,
    p_meta: meta as never,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, user };
}
