import { getPartnerName } from '@/src/utils/getPartnerName';

const partnerName = getPartnerName();
export const gameData = [
  {
    id: "would-you-rather",
    title: "Would You Rather",
    image: "would-you-rather",
    description: `Find new things about ${partnerName} by choosing between fun, flirty, and deep “would you rather” questions together.`,
    modes: ["casual", "romantic", "deep", "funny", "spicy"],
  },
  {
    id: "this-or-that",
    title: "This or That",
    image: "would-you-rather",
    description: `Discover your shared tastes with quick choices like coffee or tea, beach or mountains — simple, lighthearted, and revealing.`,
    modes: ["casual", "funny", "daily life", "preferences", "romantic"],
  },
  {
    id: "how-well-do-you-know-me",
    title: "How Well Do You Know Me?",
    image: "would-you-rather",
    description: `See how closely ${partnerName} really knows you through personal questions about favorites, memories, and daily habits.`,
    modes: ["deep", "fun", "nostalgic", "personal", "challenge"],
  },
  {
    id: "truth-or-dare",
    title: "Truth or Dare",
    image: "would-you-rather",
    description: `Add playful sparks with sweet or romantic dares and thoughtful truths designed to build trust and fun connection.`,
    modes: ["playful", "romantic", "spicy", "adventurous", "deep"],
  },
  {
    id: "compatibility-quiz",
    title: "Compatibility Quiz",
    image: "",
    description: `Answer together to explore how your personalities align — a fun way to see your strengths as a couple.`,
    modes: ["romantic", "deep", "casual", "insightful", "fun"],
  },
  {
    id: "story-builder",
    title: "Story Builder",
    image: "",
    description: `Take turns writing one sentence at a time to create a shared story — laughter and inside jokes guaranteed.`,
    modes: ["creative", "funny", "romantic", "fantasy", "casual"],
  },
  {
    id: "memory-match",
    title: "Memory Match",
    image: "",
    description: `Flip and match cards featuring relationship memories or prompts to relive moments and strengthen nostalgia.`,
    modes: ["nostalgic", "fun", "memory", "romantic", "casual"],
  },
  {
    id: "guess-the-answer",
    title: "Guess the Answer",
    image: "",
    description: `Try to guess each other’s responses to personal or funny questions — great for learning little details about ${partnerName}.`,
    modes: ["funny", "deep", "personal", "romantic", "challenge"],
  },
  {
    id: "emotional-check-in",
    title: "Emotional Check-In",
    image: "",
    description: `Pick how you both feel today and get prompts that encourage meaningful, empathetic conversations.`,
    modes: ["emotional", "deep", "reflective", "supportive", "daily"],
  },
  {
    id: "memory-challenge",
    title: "Memory Challenge",
    image: "",
    description: `Test who remembers relationship moments best — from first dates to milestones — and reminisce while playing.`,
    modes: ["nostalgic", "fun", "competitive", "romantic", "casual"],
  },
  {
    id: "ai-mini-missions",
    title: "AI Mini-Missions",
    image: "",
    description: `Get daily fun or romantic challenges from your AI coach that help you bond, laugh, and grow closer every day.`,
    modes: ["daily", "romantic", "fun", "growth", "challenge"],
  },
];
