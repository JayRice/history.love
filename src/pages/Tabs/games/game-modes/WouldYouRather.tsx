import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Text } from 'react-native-paper';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { Game, WouldYouRatherGame, WYRMode } from '@/src/shared/types/Game';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import { wouldYouRatherData } from '@/src/data/games/wouldYouRatherData';
import { LoadingSpinner } from '@/src/shared/ui/feedback/LoadingSpinner';
import { getPartnerName } from '@/src/shared/lib/utils/getPartnerName';
import { updateGame } from '@/src/server/game/updateGame';
import { useAuth } from '@/src/features/auth/hooks/AuthContext';
import {useUserStore} from "@/src/store/userStore"


export function WouldYouRather({ game }: { game: Game<WouldYouRatherGame> }) {
  const colors = useThemeColors();
  const { authUser } = useAuth()


  const gameData = game.game;

  const rounds = gameData.progress.rounds;


  const questionIds = gameData.questionIds;



  const [seenResults, setSeenResults] = useState<boolean>(false);

  const currentRound = useMemo(() => {
    const length = gameData.progress.rounds.length;
    if (seenResults) {
      return rounds[length-1]
    }else if (length >= 2){
      return rounds[length-2]
    }
    return length == 0 ? null : rounds[length-1];
  }, [gameData, seenResults]);


  const currentWYRQuestion = useMemo(() => {

    let currentQuestionId;
    if (!currentRound?.index) {
      currentQuestionId = questionIds[questionIds.length - 1]
    }else {
      currentQuestionId = currentRound.questionId;
    }
    const questionIdMode = currentQuestionId.split('_')[0] as WYRMode;

    return wouldYouRatherData[questionIdMode].filter((wyrq) => wyrq.id === currentQuestionId)[0]
  }, [currentRound?.index]);

  const currentChoices = useMemo(() => {
    if (!currentRound) {return {}}
    return currentRound.choices;
  }, [currentRound?.index]);

  const [questions, setQuestions] = useState<[string, string] | null>(null);

  const partnerName = getPartnerName();



  const showResults = useMemo(() => {
    if (!currentRound) {return false}

    const choices = currentRound.choices;

    console.log("seen results: ", seenResults)
    // Both users chose their choice and the user hasn't already seen the results of the round
    return Object.keys(choices).length >= 2 && !seenResults;
  }, [currentRound, seenResults]);



  // shared animation values
  const titleOpacity = useSharedValue(0);
  const q1Opacity = useSharedValue(0);
  const q2Opacity = useSharedValue(0);
  const continueOpacity = useSharedValue(0); // renamed to avoid confusion

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const q1Style = useAnimatedStyle(() => ({ opacity: q1Opacity.value }));
  const q2Style = useAnimatedStyle(() => ({ opacity: q2Opacity.value }));
  const continueStyle = useAnimatedStyle(() => ({ opacity: continueOpacity.value }));

  useEffect(() => {
    if (!rounds) return;

    setSeenResults(false);


    titleOpacity.value = 0;
    q1Opacity.value = 0;
    q2Opacity.value = 0;
    continueOpacity.value = 0;

    // Step-by-step fade-in sequence
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });

    // delay question 1
    setTimeout(() => {
      q1Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 400);

    // delay question 2
    setTimeout(() => {
      q2Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 800);

    setTimeout(() => {
      continueOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 1200);


  }, [rounds[rounds.length-1]?.questionId]);


  const user = useUserStore(s => s.user);
  const chose1Length = (Object.values(currentChoices)).filter((choice) => choice == 1).length;
  const chose2Length = (Object.values(currentChoices)).filter((choice) => choice == 2).length;

  const youChose = useMemo(() => {
    if (!authUser || !currentChoices) {return null}
    return currentChoices[authUser.uid];
  }, [currentChoices, authUser]);
  const theyChose = useMemo(() => {
    if (!authUser || !currentChoices) {return null}
    const otherUid = Object.keys(currentChoices).filter((uid) => uid != authUser.uid)[0];

    return currentChoices[otherUid];
  }, [currentChoices, authUser]);


  useEffect(() => {
    if (!currentWYRQuestion || !user) {return}

    let q1, q2;



    q1 = currentWYRQuestion.q1.replace("[NAME]", partnerName);
    q2 = currentWYRQuestion.q2.replace("[NAME]", partnerName);


    console.log(q1, q2)

    let firstName = user?.profile?.first_name ?? "you";
    firstName = firstName[0].toUpperCase() + firstName.substring(1);

    if (showResults) {
      if (chose1Length == 2){
        q1 = currentWYRQuestion.q1.replace("[NAME]", `${partnerName}/${firstName})`);
      }else if (chose2Length == 2){
        q2 = currentWYRQuestion.q2.replace("[NAME]", `${partnerName}/${firstName})`);
      }else if (theyChose == 1){
        q1 = currentWYRQuestion.q1.replace("[NAME]", firstName);
      }else if (theyChose == 2){
        q2 = currentWYRQuestion.q2.replace("[NAME]", firstName)
      }

    }
    console.log(q1, q2)



    setQuestions([q1, q2]);

  }, [currentWYRQuestion?.id, user]);




  const [isWaiting, setIsWaiting] = useState<boolean>(false);


  const onQuestionChange = () => {
    console.log("question changed");
    setSeenResults(false);
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


  const canPress = useMemo(() => {
    return !isWaiting && !showResults;
  }, [isWaiting, showResults])

  const onChoose = useCallback(async (choice: 1 | 2) => {
    console.log("isWaiting:", isWaiting, showResults)
    if (!canPress) {return}
    console.log("isWaiting: ", isWaiting)
    await updateGame(game, { choice });
  }, [isWaiting, showResults])


  if (!authUser) return null;





  console.log(questions)


  return (
    <View className="flex-1">

      {showResults && (
        <View className={"absolute w-full bottom-8 z-50 flex justify-center items-center"}>
          {/* NOTE: passes the raw SharedValue, which RN ignores as a style, so
              the button renders fully visible today. The prepared animated
              `continueStyle` above is unused; wiring it up is a deliberate
              UI-phase change. Cast preserves current behavior. */}
          <PrimaryButton style={continueOpacity as unknown as object} onPress={() => {
          setSeenResults(true);
        }}>Continue</PrimaryButton></View>
      )}
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
          Would You Rather
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
        { questions && <View>
          { (showResults && chose1Length != 0) && <Animated.Text
            className="relative top-[-10%] text-white text-center px-8">

            {(chose1Length == 2) ? `You and ${partnerName} both chose:` : (youChose == 1) ? "You chose:" : `${partnerName} chose:`  }
          </Animated.Text>}
          <Animated.Text
            className="relative top-[-5%] text-white text-center px-8"
            style={q1Style}
          >
            {questions[0] ?? <LoadingSpinner />}
          </Animated.Text>
        </View>}
      </Pressable>

      {/* Question 2 */}
      <Pressable onPress={() => {
        onChoose(2)
      }} style={{ backgroundColor: colors.secondary }} className="flex-1 items-center justify-center">
        { questions && <View>
          { (showResults && chose2Length != 0) && <Animated.Text
            className="relative top-[-10%] text-white text-center px-8">

            {(chose2Length == 2) ? `You and ${partnerName} both chose:` : (youChose == 2) ? "You chose:" : `${partnerName} chose:`  }
          </Animated.Text>}
          <Animated.Text
            className="relative top-[-5%] text-white text-center px-8"
            style={q2Style}
          >

            {questions[1] ?? <LoadingSpinner />}
          </Animated.Text>
        </View>}
      </Pressable>
    </View>
  );
}
