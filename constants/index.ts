import { MemoryMood } from '@/src/types/Memory';

export const DEFAULT_AVATAR = require("@/assets/images/default-avatar.png");
export const MAX_USERNAME_LENGTH = 24;
export const MAX_BIO_LENGTH = 200;
export const MAX_DEFAULT_TITLE_LENGTH = 250;
export const MAX_DEFAULT_NOTE_LENGTH = 1000;
export const MOOD_EMOJI: Record<MemoryMood, string> = {
  happy: "😊",
  sad: "😢",
  excited: "🤩",
  relaxed: "😌",
  angry: "😠",
  anxious: "😬",
  "in love": "🥰",
  nostalgic: "🕰️",
  tired: "🥱",
  peaceful: "🕊️",
};