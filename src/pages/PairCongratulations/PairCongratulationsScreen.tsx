// PairingCongratsBlock.tsx
import React, { useMemo } from "react";
import { View, ScrollView, Pressable } from "react-native";
import {Text} from "react-native-paper"
import { router } from "expo-router";
import { useUserStore } from "@/src/store/userStore";
import { useRelationshipStore } from "@/src/store/relationshipStore";
import CollisionHeartAnimation from '@/src/shared/ui/animations/CollisionHeartAnimation';
import { useImagesStore } from '@/src/store/imagesStore';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import CongratulationsScreen from '@/src/shared/ui/layout/CongratulationsScreen';

const GOAL_LABELS: Record<string, string> = {
  "better-communication": "Better Communication",
  "quality-time": "Quality Time",
  "conflict-resolution": "Conflict Resolution",
  "deeper-intimacy": "Deeper Intimacy",
  "trust-building": "Trust Building",
  "shared-habits": "Shared Habits",
  "milestone-planning": "Milestone Planning",
  "gratitude-practice": "Gratitude Practice",
  "fun-and-play": "More Fun & Play",
  "dating-new": "Dating Again",
};

function fmtMonthYear(d?: Date) {
  try {
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

export default function PairCongratulationsScreen() {
  const user = useUserStore((s) => s.user);
  const relationship = useRelationshipStore((s) => s.relationship);

  const you = (user?.profile?.first_name || "You").trim();
  const partnerFull = user?.partner?.name?.trim()  || "your partner";
  const partnerFirst = partnerFull.split(" ")[0] || partnerFull;

  const userProfileImage = useImagesStore(s => s.profileImage);
  const partnerProfileImage = useImagesStore(s => s.partnerProfileImage);


  const city = user?.location?.city;
  const state = user?.location?.state;
  const fromPlace = city && state ? `${city}, ${state}` : city || state || null;

  const relType = user?.partner?.relationship;
  const cohab = user?.partner?.cohabitation;
  const since = fmtMonthYear(user?.partner?.together_since);

  const goals = (user?.partner?.goals || []) as string[];
  const readableGoals = goals
    .map((g) => GOAL_LABELS[g] || g)
    .slice(0, 3) // keep it tight
    .join(" • ");

  const lineBits = useMemo(() => {
    const items: string[] = [];
    if (relType) items.push(relType.replace("-", " "));
    if (cohab) items.push(cohab.replace("-", " "));
    if (since) items.push(`since ${since}`);
    return items.join(" • ");
  }, [relType, cohab, since]);

  // choose 3–4 lightweight “nudges”
  const suggestions = useMemo(() => {
    const base = [
      {
        title: "Pick a Shared Goal",
        subtitle: goals?.length ? "Update or add more goals" : "Choose what matters most first",
        onPress: () => {},
      },
      {
        title: "Set Your Milestones",
        subtitle: "Anniversary, first date, proposals",
        onPress: () => {},
      },
      {
        title: "Plan One Small Thing",
        subtitle: "A 20-min walk or screen-free dinner",
        onPress: () => {},
      },
    ];

    // only include notifications card if they’re off or missing
    const wantsNotif = user?.settings?.send_notifications;
    if (!wantsNotif) {
      base.push({
        title: "Turn On Nudges",
        subtitle: "Gentle reminders—never spammy",
        onPress: () => {},
      });
    }

    return base.slice(0, 4);
  }, [goals?.length, user?.settings?.send_notifications]);

  return (
    <View className="w-full h-full">
      <CongratulationsScreen delay={1000}>


      <View className="flex w-full items-center justify-center  h-[40%] ">
        <CollisionHeartAnimation
          userSource={userProfileImage}
          partnerSource={partnerProfileImage}
          imageSize={160}
          gap={320}
          loop={false} // set true if you want it to run continuously
          style={{}}
        />
      </View>

      <Text className="text-center font-semibold mt-6 mb-1 text-black" variant="headlineSmall">
        🎉 You and {partnerFirst} are in!
      </Text>

      <Text className="text-center text-black/80 mb-3" variant="titleMedium">
        {you}, this is a small step that can change everything.
      </Text>

      {!!lineBits && (
        <Text className="text-center text-black/60 mb-2" variant="bodyMedium">
          {lineBits}
        </Text>
      )}

      {fromPlace && (
        <Text className="text-center text-black/50 mb-4" variant="bodySmall">
          From {fromPlace} with love ❤️
        </Text>
      )}

      {/* goals chips (compact) */}
      {goals?.length > 0 && (
        <View className="items-center mb-6">
          <View className="px-3 py-2 rounded-full bg-black/5">
            <Text className="text-black/75" variant="labelLarge">
              Focus: {readableGoals}
            </Text>
          </View>
        </View>
      )}

      {/* simple horizontal “next steps” carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        className="mb-10"
      >
        {suggestions.map((s, i) => (
          <Pressable
            key={i}
            onPress={s.onPress}
            className="mr-3"
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
          >
            <View className="w-64 p-4 rounded-2xl bg-white shadow-[0px_6px_18px_rgba(0,0,0,0.08)] border border-black/5">
              <Text className="font-semibold text-black mb-1" variant="titleMedium">
                {s.title}
              </Text>
              <Text className="text-black/70" variant="bodyMedium">
                {s.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* warm closer */}
      <Text className="text-center text-black/70 mb-4" variant="bodyLarge">
        Tip: tiny habits beat grand gestures. Pick one small win together today.
      </Text>


      <PrimaryButton className={"z-50"} onPress={() => {
        router.back();
      }}>Continue</PrimaryButton>

      </CongratulationsScreen>
    </View>
  );
}
