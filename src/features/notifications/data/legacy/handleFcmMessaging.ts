import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "@/src/shared/lib/supabase";
import { logger } from "@/src/shared/lib/logger";

// Ask for permission + register the Expo push token in device_tokens
// (owner-only RLS).
export async function registerFcmToken(uid: string) {
  if (!Device.isDevice) {
    logger.debug("Push notifications only work on a physical device.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    logger.debug("Permission for push notifications not granted.");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;

  const { error } = await supabase.from("device_tokens").upsert({
    profile_id: uid,
    token: expoPushToken,
    updated_at: new Date().toISOString(),
  });
  if (error) logger.warn("device token save failed:", error.message);

  // Platform recorded for later delivery routing (Phase 6).
  void Platform.OS;

  return expoPushToken;
}

export async function removeFcmToken(uid: string) {
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;

  const { error } = await supabase
    .from("device_tokens")
    .delete()
    .eq("profile_id", uid)
    .eq("token", expoPushToken);
  if (error) logger.warn("device token removal failed:", error.message);
}
