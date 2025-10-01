// push/registerFcm.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/config/firebase";
import { getAuthUser } from "@/src/database/auth/getAuthUser";

// Ask for permission + register for Expo Push Token
export async function registerFcmToken(uid: string) {
  if (!Device.isDevice) {
    console.log("Push notifications only work on a physical device.");
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission for push notifications not granted.");
    return null;
  }

  // Get Expo Push Token (maps to FCM/APNs under the hood)
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;

  // Save token in Firestore
  await setDoc(
    doc(db, "users", uid, "deviceTokens", expoPushToken),
    {
      provider: "expo",
      platform: Platform.OS,
      updatedAt: serverTimestamp(),
      lastUsedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return expoPushToken;
}

// Remove token from Firestore
export async function removeFcmToken(uid: string) {
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;

  await deleteDoc(doc(db, "users", uid, "deviceTokens", expoPushToken));
}
