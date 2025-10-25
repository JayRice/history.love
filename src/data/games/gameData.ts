import { getPartnerName } from '@/src/utils/getPartnerName';
import { GameData } from '@/src/types/GameData';

const partnerName = getPartnerName();


export const gameData : GameData[] = [
  {
    type: "would-you-rather",
    title: "Would You Rather",
    image: "would-you-rather",
    description: `Find new things about ${partnerName} by choosing between fun, flirty, and deep “would you rather” questions together.`,
    modes: ["casual", "romantic", "deep", "funny", "spicy"],
    directions: `How to play:
1) Pick a mode and start a round.
2) Each prompt shows two choices. Both of you choose privately, then reveal.
3) If your answers match, earn a point and a short prompt to elaborate; if not, discuss why.
4) Play to 10 prompts or set a timer (e.g., 5 minutes).
Tip: Use “deep” for meaningful talks; “spicy” for flirty fun.`
  },
  {
    type: "this-or-that",
    title: "This or That",
    image: "would-you-rather",
    description: `Discover your shared tastes with quick choices like coffee or tea, beach or mountains — simple, lighthearted, and revealing.`,
    modes: ["casual", "funny", "daily life", "preferences", "romantic"],
    directions: `How to play:
1) Select a mode to filter topics.
2) Raptype-fire prompts appear; both tap your pick within 5–7 seconds.
3) The app tracks your alignment score and surfaces patterns (e.g., “You both love mornings!”).
4) After each mini-set (5–10 prompts), get a tailored date or activity suggestion.`
  },
  {
    type: "how-well-do-you-know-me",
    title: "How Well Do You Know Me?",
    image: "would-you-rather",
    description: `See how closely ${partnerName} really knows you through personal questions about favorites, memories, and daily habits.`,
    modes: ["deep", "fun", "nostalgic", "personal", "challenge"],
    directions: `How to play:
1) Player A answers 5 questions about themselves privately.
2) Player B guesses each answer; reveal and score 1 point per match.
3) Swap roles for the next 5 questions.
4) Highest total wins; app highlights new facts learned and suggests a follow-up conversation.`
  },
  {
    type: "truth-or-dare",
    title: "Truth or Dare",
    image: "would-you-rather",
    description: `Add playful sparks with sweet or romantic dares and thoughtful truths designed to build trust and fun connection.`,
    modes: ["playful", "romantic", "spicy", "adventurous", "deep"],
    directions: `How to play:
1) Choose a comfort mode (e.g., playful vs. spicy) and a round length.
2) Take turns choosing Truth or Dare. Skip any card without penalty.
3) Complete dares or answer truths; earn 1 point per completed card.
4) End with a “gratitude” prompt to close on a positive note.
Safety: Consent first, skip freely, keep it light and respectful.`
  },
  {
    type: "compatibility-quiz",
    title: "Compatibility Quiz",
    image: "",
    description: `Answer together to explore how your personalities align — a fun way to see your strengths as a couple.`,
    modes: ["romantic", "deep", "casual", "insightful", "fun"],
    directions: `How to play:
1) Both answer the same 10–15 statements on a 1–5 scale.
2) Reveal your overlap map (values, routines, affection, adventure).
3) The app explains high/low areas and offers 1–2 actionable tips.
4) Save results and re-take monthly to see growth.`
  },
  {
    type: "story-builder",
    title: "Story Builder",
    image: "",
    description: `Take turns writing one sentence at a time to create a shared story — laughter and instypee jokes guaranteed.`,
    modes: ["creative", "funny", "romantic", "fantasy", "casual"],
    directions: `How to play:
1) Pick a theme; the app gives an opening line.
2) Alternate adding 1–2 sentences per turn (timer optional).
3) After 8–12 turns, read it aloud; save to your Timeline.
4) Bonus: Tap “prompt” if you get stuck; app suggests a twist.`
  },
  {
    type: "memory-match",
    title: "Memory Match",
    image: "",
    description: `Flip and match cards featuring relationship memories or prompts to relive moments and strengthen nostalgia.`,
    modes: ["nostalgic", "fun", "memory", "romantic", "casual"],
    directions: `How to play:
1) Choose grtype size (e.g., 4x3). Cards htypee photos/prompts from your memories or themed icons.
2) Take turns flipping two cards; match = keep the pair and share a quick story.
3) Most pairs wins; the app surfaces a “top memory” to revisit or re-create.`
  },
  {
    type: "guess-the-answer",
    title: "Guess the Answer",
    image: "",
    description: `Try to guess each other’s responses to personal or funny questions — great for learning little details about ${partnerName}.`,
    modes: ["funny", "deep", "personal", "romantic", "challenge"],
    directions: `How to play:
1) A question appears (open-ended or multiple choice).
2) Both submit answers privately—one is the “true” answer from the featured partner.
3) Reveal and award 1 point for exact or close matches.
4) After each round, get a short follow-up prompt to deepen the convo.`
  },
  {
    type: "emotional-check-in",
    title: "Emotional Check-In",
    image: "",
    description: `Pick how you both feel today and get prompts that encourage meaningful, empathetic conversations.`,
    modes: ["emotional", "deep", "reflective", "supportive", "daily"],
    directions: `How to play:
1) Each of you selects current emotions from the wheel (can pick multiple).
2) The app detects overlap or gaps and suggests prompts accordingly.
3) Take turns sharing with a 60–90s timer; the listener reflects back.
4) Close with one appreciation and one small support action for the day.`
  },
  {
    type: "memory-challenge",
    title: "Memory Challenge",
    image: "",
    description: `Test who remembers relationship moments best — from first dates to milestones — and reminisce while playing.`,
    modes: ["nostalgic", "fun", "competitive", "romantic", "casual"],
    directions: `How to play:
1) The app pulls from saved memories (or uses generic packs).
2) Answer timed questions (when/where/who/what) about your moments.
3) Earn points for accuracy and speed; streaks get bonuses.
4) End with a highlight reel and a suggestion to add a new memory.`
  },
  {
    type: "ai-mini-missions",
    title: "AI Mini-Missions",
    image: "",
    description: `Get daily fun or romantic challenges from your AI coach that help you bond, laugh, and grow closer every day.`,
    modes: ["daily", "romantic", "fun", "growth", "challenge"],
    directions: `How to play:
1) Pick a daily intensity (1–5 minutes or 10–15 minutes).
2) Receive a mission (e.g., “3 compliments,” “micro-date typeea,” “gratitude photo”).
3) Complete it and check-in; earn streaks and badges.
4) Weekly recap shows wins and suggests next week’s focus.`
  },
];
