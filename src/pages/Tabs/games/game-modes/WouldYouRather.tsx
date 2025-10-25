import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Game, WouldYouRatherGame, WYRMode } from '@/src/types/Game';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import { BackButton } from '@/src/components/buttons/BackButton';
import { wouldYouRatherData } from '@/src/data/games/wouldYouRatherData';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import { getPartnerName } from '@/src/utils/getPartnerName';
import { updateGame } from '@/src/server/game/updateGame';
import { useAuth } from '@/src/contexts/AuthContext';

export function WouldYouRather({ game }: { game: Game<WouldYouRatherGame> }) {
  const colors = useThemeColors();


  const WYRQuestionPairs = game.game.questionIds;

  const currentQuestionId = WYRQuestionPairs[WYRQuestionPairs.length - 1];

  const questionIdMode = currentQuestionId.split('_')[0] as WYRMode;

  const currentWYRQuestion = wouldYouRatherData[questionIdMode].filter((wyrq) => wyrq.id === currentQuestionId)[0];

  const [seenResults, setSeenResults] = useState<Record<string, boolean>>({});

  console.log("currentWYRQuestion", currentWYRQuestion);



  // shared animation values
  const titleOpacity = useSharedValue(0);
  const q1Opacity = useSharedValue(0);
  const q2Opacity = useSharedValue(0);



  useEffect(() => {

    onQuestionChange();


    titleOpacity.value = 0;
    q1Opacity.value = 0;
    q2Opacity.value = 0;

    // Step-by-step fade-in sequence
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });

    // delay question 1
    setTimeout(() => {
      q1Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 800);

    // delay question 2
    setTimeout(() => {
      q2Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 1600);
  }, [currentWYRQuestion.id]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const q1Style = useAnimatedStyle(() => ({ opacity: q1Opacity.value }));
  const q2Style = useAnimatedStyle(() => ({ opacity: q2Opacity.value }));


  const partnerName = getPartnerName()
  const q1 = currentWYRQuestion.q1.replace("[NAME]", partnerName);
  const q2 = currentWYRQuestion.q2.replace("[NAME]", partnerName);

  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  const { authUser } = useAuth()

  const onQuestionChange = () => {
    console.log("question changed")
  }
  useEffect(() => {
    if (!authUser || !game.game.progress.rounds) return;
    const rounds = game.game.progress.rounds;
    const waitingRoundIndex = rounds.findIndex(round => Object.keys(round.choices).length < 2);


    // If a user is waiting on a round && that user is this user

    if (waitingRoundIndex === -1) {return setIsWaiting(false)}

    const waitingRound = rounds[waitingRoundIndex];
    const imWaiting =  Object.keys(waitingRound.choices).includes(authUser.uid);
    setIsWaiting(imWaiting);
  }, [game.game.progress.rounds, authUser]);
  const onChoose = useCallback(async (choice: 1 | 2) => {
    if (isWaiting) {return}
    console.log("isWaiting: ", isWaiting)
    await updateGame(game, { choice });
  }, [isWaiting])
  return (
    <View className="flex-1">

      {isWaiting && <View className={"absolute z-40 flex-1 flex  w-full h-full bg-black/70"}>

        <Text variant={"bodyLarge"} className="text-center text-white font-light top-1/2" style={{ transform: [ { translateY: -60 }] }}>
          {`Waiting on ${partnerName}'s response`}
        </Text>

        <LoadingSpinner></LoadingSpinner>
        </View>
      }
      {/* Title */}
      <Animated.View className="absolute w-full z-10 pt-20" style={titleStyle}>
        <Text variant={"headlineLarge"} className="text-center text-white font-bold">
          Would You rather
        </Text>

      </Animated.View>

      {/* OR circle */}
      <View
        className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full bg-black/75 z-30 items-center justify-center"
        style={{ transform: [{ translateX: -32 }, { translateY: -32 }] }}
      >
        <Text className="text-white text-2xl font-bold">or</Text>
      </View>

      {/* Question 1 */}
      <Pressable onPress={() => {
        onChoose(1)
      }} style={{ backgroundColor: colors.primary }} className="flex-1 items-center justify-center">
        <Animated.Text
          className="relative top-[-5%] text-white text-center px-8"
          style={q1Style}
        >
          {q1 ?? <LoadingSpinner />}
        </Animated.Text>
      </Pressable>

      {/* Question 2 */}
      <Pressable onPress={() => {
        onChoose(2)
      }} style={{ backgroundColor: colors.secondary }} className="flex-1 items-center justify-center">
        <Animated.Text
          className="relative top-[-5%] text-white text-center px-8"
          style={q2Style}
        >
          {q2 ?? <LoadingSpinner />}
        </Animated.Text>
      </Pressable>
    </View>
  );
}
