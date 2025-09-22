import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

type SoundKey = "success" | "yay";
const sources: Record<SoundKey, any> = {
  "success": require("@/assets/sounds/success.mp3"),
  "yay": require("@/assets/sounds/yay.mp3"),
};

const cache = new Map<SoundKey, Audio.Sound>();

let configured = false;
async function ensureConfigured() {
  if (configured) return;
  configured = true;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true, // set to false if you want to respect the mute switch
    staysActiveInBackground: false,
    allowsRecordingIOS: false,
    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false,
  });
}

export async function preload(keys: SoundKey[] = ["success", "yay"]) {
  await ensureConfigured();
  await Promise.all(
    keys.map(async (k) => {
      if (cache.has(k)) return;
      const sound = new Audio.Sound();
      await sound.loadAsync(sources[k], { volume: 1.0, isLooping: false }, undefined);
      cache.set(k, sound);
    })
  );
}

export async function play(key: SoundKey) {
  await ensureConfigured();
  if (!cache.has(key)) await preload([key]);
  const sound = cache.get(key)!;

  // ensure instant replays (no lag on repeated taps)
  const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
  if (status.isLoaded) {
    if (status.isPlaying) {
      await sound.stopAsync();
    }
    await sound.setPositionAsync(0);
    await sound.playAsync();
  }
}

export async function unloadAll() {
  await Promise.all(Array.from(cache.values()).map((s) => s.unloadAsync()));
  cache.clear();
}