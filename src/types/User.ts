export default interface User {
  id: string;
  email: string;
  name: string;

  username?: string;

  birthday?: Date;
  gender?: "female" | "male" | "non-binary" | "other";

  partner_name?: string;
  together_since?: Date;

  relationship?:
    | "in-relationship"
    | "engaged"
    | "married"
    | "civil-partnership"
    | "situationship";

  cohabitation?: "together" | "separately-nearby" | "separately-far";
  kids?: boolean;
  send_notifications?: boolean;

  source?:
    | "facebook/instagram"
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


    profileImage?: {
      type: "google" | "stored",
      url: string;
    };
}