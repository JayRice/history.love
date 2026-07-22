// SFX manager using expo-audio (SDK 52+)
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';

export type SoundKey = 'success' | 'yay';

const sources: Record<SoundKey, any> = {
  success: require('@/assets/sounds/success.mp3'),
  yay: require('@/assets/sounds/yay.mp3'),
};

const cache = new Map<SoundKey, AudioPlayer>();

let configured = false;
async function ensureConfigured() {
  if (configured) return;
  configured = true;

  // Minimal playback config (new API)
  // - playsInSilentMode: allow UI clicks to play on iOS mute switch
  // - allowsRecording: false since these are SFX
  await setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: false,
  });
}

export async function preload(keys: SoundKey[] = ['success', 'yay']) {
  await ensureConfigured();

  keys.forEach((k) => {
    if (!cache.has(k)) {
      const player = createAudioPlayer(sources[k]); // loads immediately
      // Optional: set initial volume per sound
      // player.volume = 1.0;
      cache.set(k, player);
    }
  });
}

export async function play(key: SoundKey) {
  await ensureConfigured();
  if (!cache.has(key)) {
    await preload([key]);
  }

  const player = cache.get(key)!;
  // Instant retrigger: rewind to start, then play
  await player.seekTo(0);
  player.play(); // fire-and-forget
}

export function setVolume(key: SoundKey, volume: number) {
  const p = cache.get(key);
  if (p) p.volume = Math.max(0, Math.min(1, volume));
}

export function unloadAll() {
  cache.forEach((p) => {
    try {
      // Remove from memory per docs
      p.remove();
      // Some versions expose release(); remove() is the documented method.
    } catch {}
  });
  cache.clear();
}
