export type BeatPattern = "single" | "double" | "irregular";

export type MoodConfig = {
  id: string;
  label: string;
  color: string; // hex
  emoji?: string;
  beat: {
    /** Heartbeats per minute used for timing. */
    bpm: number;
    /** Animation style. */
    pattern: BeatPattern;
    /**
     * 0..1 how "strong" the pulse feels (controls scale & glow).
     * 0.15–0.3 is a good visual range.
     */
    intensity: number;
    /**
     * 0..1 irregularity factor (only used for "irregular"):
     * adjusts per-beat duration by ±variance*baseDuration.
     */
    variance?: number;
  };
};
export const MoodList: readonly MoodConfig[] = [
  { id: "love", label: "Love", emoji: "💕", color: "#FF66B2", beat: { bpm: 62, pattern: "single", intensity: 0.22 } },
  { id: "romantic", label: "Romantic", emoji: "💗", color: "#EC407A", beat: { bpm: 64, pattern: "single", intensity: 0.2 } },
  { id: "peaceful", label: "Peaceful", emoji: "🕊️", color: "#A5D6A7", beat: { bpm: 55, pattern: "single", intensity: 0.16 } },
  { id: "joyful", label: "Joyful", emoji: "🌞", color: "#FFD54F", beat: { bpm: 78, pattern: "single", intensity: 0.2 } },
  { id: "playful", label: "Playful", emoji: "🫧", color: "#FFB74D", beat: { bpm: 88, pattern: "double", intensity: 0.22 } },
  { id: "flirty", label: "Flirty", emoji: "😘", color: "#FF77E9", beat: { bpm: 95, pattern: "double", intensity: 0.24 } },
  { id: "passionate", label: "Passionate", emoji: "🔥", color: "#FF3B3B", beat: { bpm: 105, pattern: "double", intensity: 0.28 } },
  { id: "adventurous", label: "Adventurous", emoji: "🎒", color: "#4FC3F7", beat: { bpm: 90, pattern: "single", intensity: 0.22 } },
  { id: "connected", label: "Connected", emoji: "🔗", color: "#4DB6AC", beat: { bpm: 70, pattern: "single", intensity: 0.18 } },
  { id: "supportive", label: "Supportive", emoji: "🫶", color: "#66BB6A", beat: { bpm: 68, pattern: "single", intensity: 0.18 } },
  { id: "healing", label: "Healing", emoji: "🌱", color: "#81C784", beat: { bpm: 60, pattern: "single", intensity: 0.18 } },
  { id: "hopeful", label: "Hopeful", emoji: "🌈", color: "#81D4FA", beat: { bpm: 72, pattern: "single", intensity: 0.18 } },
  { id: "curious", label: "Curious", emoji: "🧐", color: "#64B5F6", beat: { bpm: 80, pattern: "single", intensity: 0.18 } },
  { id: "dreamy", label: "Dreamy", emoji: "💭", color: "#CE93D8", beat: { bpm: 65, pattern: "single", intensity: 0.17 } },
  { id: "intimate", label: "Intimate", emoji: "💞", color: "#F06292", beat: { bpm: 76, pattern: "double", intensity: 0.22 } },
  { id: "cheerful", label: "Cheerful", emoji: "😄", color: "#FFF176", beat: { bpm: 84, pattern: "single", intensity: 0.2 } },
  { id: "calm", label: "Calm", emoji: "🌿", color: "#80CBC4", beat: { bpm: 58, pattern: "single", intensity: 0.16 } },

  // More complex / tense moods
  { id: "conflicted", label: "Conflicted", emoji: "⚖️", color: "#F06292", beat: { bpm: 72, pattern: "irregular", intensity: 0.18, variance: 0.18 } },
  { id: "tense", label: "Tense", emoji: "😠", color: "#E57373", beat: { bpm: 88, pattern: "irregular", intensity: 0.22, variance: 0.25 } },
  { id: "distant", label: "Distant", emoji: "🧊", color: "#B0BEC5", beat: { bpm: 52, pattern: "single", intensity: 0.12 } },
  { id: "melancholy", label: "Melancholy", emoji: "🌧️", color: "#78909C", beat: { bpm: 56, pattern: "single", intensity: 0.14 } },
] as const;

export type MoodId = typeof MoodList[number]["id"];

export type RelationshipMood = {
  mood: MoodId;
  updatedAt: string | null;
}
export const getMoodById = (id: MoodId): MoodConfig =>
  (MoodList.find(m => m.id === id) ?? MoodList[0]);