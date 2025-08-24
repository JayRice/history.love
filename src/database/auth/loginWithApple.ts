
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/src/config/firebase";

function randomString(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export default async function loginWithGoogle() {
  // 1) Create a raw nonce and its SHA-256 hash
  const rawNonce = randomString(32);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  // 2) Ask Apple to sign in (user may see the native sheet)
  const appleCred = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce, // important: hashed value here
  });

  // 3) Build a Firebase credential
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: appleCred.identityToken!, // JWT from Apple
    rawNonce,                          // important: raw value here
  });

  // 4) Sign in to Firebase
  const userCred = await signInWithCredential(auth, credential);

  // Apple only provides name/email the FIRST time.
  // If available, persist to your user profile now.
  const { fullName, email } = appleCred;
  return { userCred, fullName, email };
}