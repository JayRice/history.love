import { GameMode, GameType } from './GameData';
import { GamePreferences } from './GamePreferences';

export type GameStatus = "show-results" | "ended" | "active";

export type WYRMode = "casual" | "romantic" | "deep" | "funny" | "spicy";
export type WYRChoice = 1 | 2; // q1 or q2
export type WYRGameType = "would_you_rather";

export type TS = string; // ISO string (or Firestore Timestamp if using admin SDK types)

// ───────────────────────── Question bank objects ─────────────────────────
export interface WouldYouRatherQuestion {
  id: string;           // e.g., "casual_001"
  q1: string;
  q2: string;
  // Optional: live aggregates you can update server-side with atomic increments
  tallies?: { q1: number; q2: number };
  // Optional: cached percentages so you don't recompute on every read
  q1Percentage: number;
  q2Percentage: number;
}



// ───────────────────────── Answers & rounds ─────────────────────────
export interface WYRRound {
  index: number;             // 0..N-1
  questionId: string;
  // Map of playerId -> choice
  choices: Record<string, WYRChoice>;
  revealedAt?: TS;           // when results were revealed (if you support reveal)
}

export interface WYRProgress {
  // Rounds as an ordered list (avoids relying on array positions elsewhere)
  rounds: WYRRound[];
  // Fast lookup: playerId -> questionId -> choice (no positional index bugs)
  answersByPlayer: Record<string, Record<string, WYRChoice>>;
}
export interface WouldYouRatherGame {
  questionIds: string[];             // the curated set for this match (frozen)
  progress: WYRProgress;
}


export interface Game<T = unknown>{
  id: string;
  type: GameType;

  createdBy: string;

  status: GameStatus;

  preferences: GamePreferences;

  game: T;

  isAsync?: boolean;
  score?: Record<string, number>;

  createdAt: string;
  updatedAt: string;
}