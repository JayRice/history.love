const gameModesList = [
  "casual", "romantic", "deep", "funny", "spicy", "daily life", "preferences",
  "fun", "playful", "nostalgic", "personal", "challenge", "adventurous",
  "insightful", "creative", "fantasy", "memory", "emotional", "reflective",
  "supportive", "daily", "competitive", "growth",
] as const
export type GameMode = (typeof gameModesList)[number];
export const GameTypeList = [
  "would-you-rather",
  "this-or-that",
  "how-well-do-you-know-me",
  "truth-or-dare",
  "compatibility-quiz",
  "story-builder",
  "memory-match",
  "guess-the-answer",
  "emotional-check-in",
  "memory-challenge",
  "ai-mini-missions",
] as const;

export type GameType = (typeof GameTypeList)[number];


export interface GameData {
  type:GameType;
  title: string;
  image: string;
  description: string;
  modes: GameMode[];
  directions: string;
}