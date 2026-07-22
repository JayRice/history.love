#!/usr/bin/env node
// End-to-end smoke test against the LOCAL Supabase stack using the same
// anon-key client path the mobile app uses. Exercises: signup, session,
// onboarding, invitation pairing, memory writes + RLS isolation, game
// lifecycle, sign-out/sign-in (session restoration semantics), password
// reset request, and leave_relationship.
//
// Usage: node scripts/smoke-supabase.mjs
// Requires: `npx supabase start` (local stack on the 553xx ports).
import { createClient } from "@supabase/supabase-js";

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:55321";
const ANON =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`ok ${passed + failed} - ${name}`);
  } else {
    failed += 1;
    console.error(`NOT OK ${passed + failed} - ${name} ${detail}`);
  }
}

function client() {
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

const stamp = Date.now();
const emailA = `smoke.a.${stamp}@example.test`;
const emailB = `smoke.b.${stamp}@example.test`;
const emailC = `smoke.c.${stamp}@example.test`;
const password = "smoke-password-123";

const a = client();
const b = client();
const c = client();

// 1. Signup.
const upA = await a.auth.signUp({ email: emailA, password });
check("A signs up", !!upA.data.session, upA.error?.message);
const upB = await b.auth.signUp({ email: emailB, password });
check("B signs up", !!upB.data.session, upB.error?.message);
const upC = await c.auth.signUp({ email: emailC, password });
check("C signs up", !!upC.data.session, upC.error?.message);
const uidA = upA.data.user?.id;

// 2. Signup trigger created a profile readable by its owner only.
const profA = await a.from("profiles").select("id, display_name").eq("id", uidA).maybeSingle();
check("A reads own auto-created profile", profA.data?.id === uidA, profA.error?.message);
const profCrossRead = await b.from("profiles").select("id").eq("id", uidA);
check("B cannot read A's profile (RLS)", (profCrossRead.data ?? []).length === 0);

// 3. Onboarding via RPC; protected columns stay protected.
const ob = await a.rpc("complete_onboarding", {
  p_display_name: "Smoke A",
  p_handle: `smokea${stamp}`,
  p_meta: { profile: { first_name: "Smoke", username: `smokea${stamp}` }, partner: {} },
});
check("A completes onboarding", !ob.error, ob.error?.message);
const taken = await b.rpc("is_handle_taken", { p_handle: `SMOKEA${stamp}` });
check("handle check is case-insensitive", taken.data === true, taken.error?.message);
const forge = await a
  .from("profiles")
  .update({ age_verified: true })
  .eq("id", uidA)
  .select();
check(
  "A cannot self-verify age (protected column)",
  !!forge.error || (forge.data ?? []).length === 0,
  "protected column update went through"
);

// 4. Consent ledger.
const consent = await a.rpc("accept_policy", { p_consent_type: "terms", p_policy_version: "v1" });
check("A accepts terms via RPC", !consent.error, consent.error?.message);
const consentForge = await a.from("user_consents").update({ policy_version: "FORGED" }).select();
check("consents are append-only for clients", !!consentForge.error);

// 5. Invitation pairing.
const inv = await a.rpc("create_invitation", {});
const invRow = Array.isArray(inv.data) ? inv.data[0] : inv.data;
check("A creates an invitation with a 6-char code", invRow?.code?.length === 6, inv.error?.message);
const badAccept = await b.rpc("accept_invitation", { p_code: "ZZZZZZ" });
check("wrong code rejected generically", badAccept.error?.message?.includes("not valid") === true);
const accept = await b.rpc("accept_invitation", { p_code: invRow.code });
check("B accepts the invitation", !accept.error, accept.error?.message);
const relId = accept.data;
const relA = await a.from("relationships").select("status, verification_state").eq("id", relId).maybeSingle();
check(
  "relationship active + verified for members",
  relA.data?.status === "active" && relA.data?.verification_state === "verified"
);
const relC = await c.from("relationships").select("id").eq("id", relId);
check("outsider C cannot see the relationship", (relC.data ?? []).length === 0);

// 6. Memories + isolation.
const memIns = await b.from("app_memories").insert({
  relationship_id: relId,
  created_by: upB.data.user.id,
  doc: { title: "smoke memory", date: new Date().toISOString(), photos: [] },
});
check("member B inserts a memory", !memIns.error, memIns.error?.message);
const memA = await a.from("app_memories").select("id").eq("relationship_id", relId);
check("member A reads the memory", (memA.data ?? []).length === 1);
const memC = await c.from("app_memories").select("id").eq("relationship_id", relId);
check("outsider C sees zero memories", (memC.data ?? []).length === 0);

// 7. Game lifecycle via RPCs.
const game = await a.rpc("start_game", {
  p_doc: {
    type: "would-you-rather",
    game: { questionIds: ["q1", "q2"], progress: { rounds: [{ index: 0, questionId: "q1", choices: {} }] } },
  },
});
check("A starts a game", !game.error, game.error?.message);
const chooseA = await a.rpc("wyr_choose", { p_game_id: game.data, p_choice: 1 });
check("A chooses", !chooseA.error, chooseA.error?.message);
const chooseB = await b.rpc("wyr_choose", { p_game_id: game.data, p_choice: 2 });
check("B chooses", !chooseB.error, chooseB.error?.message);
const gameRow = await a.from("app_games").select("doc").eq("id", game.data).maybeSingle();
const rounds = gameRow.data?.doc?.game?.progress?.rounds ?? [];
check("second round opened after both chose", rounds.length === 2, JSON.stringify(rounds));
const chooseC = await c.rpc("wyr_choose", { p_game_id: game.data, p_choice: 1 });
check("outsider cannot drive the game", !!chooseC.error);

// 8. Session restoration semantics: sign out, sign back in.
await a.auth.signOut();
const relogin = await a.auth.signInWithPassword({ email: emailA, password });
check("A signs back in", !!relogin.data.session, relogin.error?.message);

// 9. Password reset request (email lands in the local mail sandbox).
const reset = await a.auth.resetPasswordForEmail(emailA);
check("password reset request accepted", !reset.error, reset.error?.message);

// 10. Leave relationship.
const leave = await a.rpc("leave_relationship");
check("A leaves the relationship", !leave.error, leave.error?.message);
const relAfter = await a.from("relationships").select("status").eq("id", relId).maybeSingle();
check("relationship ended (historical member still reads it)", relAfter.data?.status === "ended");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
