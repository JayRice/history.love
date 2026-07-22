// The app-facing session identity. `uid` deliberately mirrors the field name
// the legacy screens already consume, so the provider swap does not ripple
// through the UI. Lives in shared/types because both shared code (the app
// sync hook) and the auth feature consume it.
export interface AuthUser {
  uid: string;
  email: string | null;
}

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string };
