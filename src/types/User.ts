
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

export type Relationship = | "in-relationship"
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
    url: string;
}

export default interface User {
  id: string;
  email: string;
  name: string;


  settings?: {
    send_notifications?: boolean;
  }

  profile?: {
    username?: string;
    birthday?: Date;
    gender?: Gender | string;
    profileImage?: ProfileImage | null;
    bio: string;
  }

  partner?: {
    name?: string;
    together_since?: Date;
    relationship?: Relationship;
    cohabitation?: Cohabitation;
    kids?: boolean;
    goals?: RelationshipGoal[] | null;
  }

  analytics?: {
    source?: UserSource | null;
  }


  data? : {

  }
}