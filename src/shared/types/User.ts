
export type RelationshipGoal =
  | "better-communication"
  | "quality-time"
  | "conflict-resolution"
  | "deeper-intimacy"
  | "trust-building"
  | "shared-habits"
  | "milestone-planning"
  | "gratitude-practice"
  | "fun-and-play"
  | "dating-new";

export type Cohabitation = "together" | "separately-nearby" | "separately-far";

export type Gender = "female" | "male" | "non-binary" | "other";

export type RelationshipType = | "in-relationship"
  | "engaged"
  | "married"
  | "civil-partnership"
  | "situationship"
  | "single";

export type UserSource = | "facebook/instagram"
  | "blog/article"
  | "youtube"
  | "chatgpt-or-similar"
  | "therapist/counselor"
  | "app/play-store"
  | "partner"
  | "streaming"
  | "tiktok"
  | "podcast"
  | "friend/family";


export type ProfileImage = {
  type: "google" | "stored",
  local_uri: string;
  name?: string;
}

export default interface User {
  id: string;
  email: string;

  settings?: {
    send_notifications?: boolean;
  }

  profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    birthday?: Date;
    gender?: Gender | string;
    profileImage?: ProfileImage | null;
    bio?: string;
    verified?: boolean;
    match_code?: string;

  }

  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
  };

  partner?: {
    name?: string;
    together_since?: Date;
    relationship?: RelationshipType;
    cohabitation?: Cohabitation;
    kids?: boolean;
    goals?: RelationshipGoal[] | null;
    partner_id?: string;
    relationship_id?: string;
  }

  analytics?: {
    created_at?: Date;
    num_logged_in?: number;
    source?: UserSource | null;
  }

  data? : {
    streak: number;
  }
}