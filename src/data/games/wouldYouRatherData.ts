import { WouldYouRatherQuestion, WYRMode } from '../../types/Game';

export let wouldYouRatherData : Record<WYRMode, WouldYouRatherQuestion[]> = {
  "casual": [
    {
      "id": "casual_1",
      "q1": "See 10 minutes into the future",
      "q2": "See 150 years into the future",
      "q1Percentage": 62,
      "q2Percentage": 38
    },
    {
      "id": "casual_2",
      "q1": "Sing along to every song you hear",
      "q2": "Dance to every song you hear",
      "q1Percentage": 45,
      "q2Percentage": 55
    },
    {
      "id": "casual_3",
      "q1": "Always be 10 minutes early",
      "q2": "Always be 20 minutes late",
      "q1Percentage": 68,
      "q2Percentage": 32
    },
    {
      "id": "casual_4",
      "q1": "Have the ability to fly",
      "q2": "Have the ability to become invisible",
      "q1Percentage": 55,
      "q2Percentage": 45
    },
    {
      "id": "casual_5",
      "q1": "Always have a full phone battery",
      "q2": "Always have a full gas tank",
      "q1Percentage": 59,
      "q2Percentage": 41
    }
  ],
  "romantic": [
    {
      "id": "romantic_1",
      "q1": "Have breakfast in bed made by [NAME]",
      "q2": "Cook a candle-lit dinner together with [NAME]",
      "q1Percentage": 49,
      "q2Percentage": 51
    },
    {
      "id": "romantic_2",
      "q1": "Slow-dance under the stars with [NAME]",
      "q2": "Cuddle and watch your favorite movie with [NAME]",
      "q1Percentage": 46,
      "q2Percentage": 54
    },
    {
      "id": "romantic_3",
      "q1": "Revisit the place of your first date with [NAME]",
      "q2": "Revisit the first trip you took with [NAME]",
      "q1Percentage": 40,
      "q2Percentage": 60
    },
    {
      "id": "romantic_4",
      "q1": "Share your biggest dream with [NAME]",
      "q2": "Share your biggest fear with [NAME]",
      "q1Percentage": 53,
      "q2Percentage": 47
    },
    {
      "id": "romantic_5",
      "q1": "Plan a surprise date for [NAME]",
      "q2": "Let [NAME] plan the perfect date for you",
      "q1Percentage": 37,
      "q2Percentage": 63
    }
  ],
  "deep": [
    {
      "id": "deep_1",
      "q1": "Know when you’ll die",
      "q2": "Know how you’ll die",
      "q1Percentage": 61,
      "q2Percentage": 39
    },
    {
      "id": "deep_2",
      "q1": "Always tell the truth",
      "q2": "Always have to lie",
      "q1Percentage": 58,
      "q2Percentage": 42
    },
    {
      "id": "deep_3",
      "q1": "End world hunger",
      "q2": "End global warming",
      "q1Percentage": 47,
      "q2Percentage": 53
    },
    {
      "id": "deep_4",
      "q1": "Know every secret of space",
      "q2": "Know every secret of the ocean",
      "q1Percentage": 64,
      "q2Percentage": 36
    },
    {
      "id": "deep_5",
      "q1": "Lose all your past memories",
      "q2": "Never be able to make new memories",
      "q1Percentage": 52,
      "q2Percentage": 48
    }
  ],
  "funny": [
    {
      "id": "funny_1",
      "q1": "Have spaghetti for hair",
      "q2": "Sweat maple syrup",
      "q1Percentage": 70,
      "q2Percentage": 30
    },
    {
      "id": "funny_2",
      "q1": "Fight 100 duck-sized horses",
      "q2": "Fight one horse-sized duck",
      "q1Percentage": 49,
      "q2Percentage": 51
    },
    {
      "id": "funny_3",
      "q1": "Be stuck in a romantic comedy with your worst enemy",
      "q2": "Be stuck in a horror movie with your best friend",
      "q1Percentage": 43,
      "q2Percentage": 57
    },
    {
      "id": "funny_4",
      "q1": "Wear heavy boots everywhere",
      "q2": "Never be able to wear shoes again",
      "q1Percentage": 65,
      "q2Percentage": 35
    },
    {
      "id": "funny_5",
      "q1": "Drink from a toilet",
      "q2": "Pee in a litter box",
      "q1Percentage": 58,
      "q2Percentage": 42
    }
  ],
  "spicy": [
    {
      "id": "spicy_1",
      "q1": "Make out in public with [NAME]",
      "q2": "Send a risky text to [NAME] right now",
      "q1Percentage": 51,
      "q2Percentage": 49
    },
    {
      "id": "spicy_2",
      "q1": "Have sex blindfolded",
      "q2": "Have sex handcuffed (with full consent)",
      "q1Percentage": 44,
      "q2Percentage": 56
    },
    {
      "id": "spicy_3",
      "q1": "Have a slow, affectionate night with [NAME]",
      "q2": "Have a wild, spontaneous night with [NAME]",
      "q1Percentage": 47,
      "q2Percentage": 53
    },
    {
      "id": "spicy_4",
      "q1": "Kiss [NAME] anywhere you want",
      "q2": "Let [NAME] kiss you anywhere they want (mutual comfort)",
      "q1Percentage": 39,
      "q2Percentage": 61
    },
    {
      "id": "spicy_5",
      "q1": "Send [NAME] a sexy photo right now (safe, respectful)",
      "q2": "Receive a sexy photo from [NAME] right now (safe, respectful)",
      "q1Percentage": 30,
      "q2Percentage": 70
    }
  ]
}

