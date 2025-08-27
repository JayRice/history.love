import React, { JSX, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Card, Avatar, Divider, TextInput } from 'react-native-paper';
import { CreditCard as Edit3, MapPin, Heart, Users, Eye, EyeOff, Apple } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/components/buttons/SecondaryButton';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import Logo from "@/assets/images/logo.svg";
import { router } from 'expo-router';

import {useUserStore} from '@/src/store/userStore';
import { Input } from 'postcss';
import InputLabel from 'react-native-paper/src/components/TextInput/Label/InputLabel';
import { TextField } from '@/src/components/inputs/TextField';


import User, { Cohabitation, RelationshipGoal } from '@/src/types/User';

import { auth } from "@/src/config/firebase"
import { useAuth } from '@/src/hooks/useAuth';
import BirthdayPicker from '@/src/components/inputs/BirthdayPicker';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';


import Animated, {
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  FadeOut, SlideInLeft, SlideOutRight
} from 'react-native-reanimated';
import handleOnboarding from '@/src/server/handleOnboarding';
import { BackButton } from '@/src/components/buttons/BackButton';
import ToggleButtons from '@/src/components/inputs/ToggleButtons';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';


interface ScreenProps {
  updateFormUser: <K extends keyof User>(key: K, value: User[K]) => void;
  formUser: User | null;
}

const WelcomeForm = () => {
  return (
    <View className={"w-full h-full flex items-center justify-center pb-64 "}>
      <Text variant={"displaySmall"} className={"font-light mb-4 flex justify-center text-center"}> Welcome to  </Text>

      <Logo width={250} height={250}></Logo>
    </View>
  )
}
const AboutForm = ({formUser, updateFormUser}: ScreenProps) => {

  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Tell us a little about yourself </Text>

      <TextField
        label="Your full name"
        value={formUser?.name ?? ""}
        onChangeText={(input) =>  updateFormUser("name", input)}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
      />

      <View>
        <Text>Your Birthday: </Text>

        <BirthdayPicker date={formUser?.birthday ?? null} onChangeDate={(date) => {
          updateFormUser("birthday", date);
        }}></BirthdayPicker>

      </View>


    </View>
  )
}


const GenderForm = ({formUser, updateFormUser}: ScreenProps) => {

  const [showOtherInput, setShowOtherInput] = useState<boolean>();
  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> What gender describes you best? </Text>

      <ToggleButtons selected={formUser?.gender ?? ""} parentClassName={"mt-10"} dict={{
        "female": "Female",
        "male": "Male",
        "non-binary": "Gender queer / Non-binary",
        "other": "Other",
      }} commands={{
        "default": (gender) => {
          setShowOtherInput(false)
          updateFormUser("gender", gender)
        },
        "other": () => {
          console.log(formUser)
          updateFormUser("gender", "")
          setShowOtherInput(true)
        }

      }}

      ></ToggleButtons>

      {showOtherInput && (
        <View>
          <TextField
            label="Your gender"
            value={formUser?.gender ?? ""}
            onChangeText={(input) =>  updateFormUser("gender", input)}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
          ></TextField>
        </View>
      )}

    </View>
  )
}


const AskIfInRelationshipForm = ({formUser, updateFormUser}: ScreenProps) => {

  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Are you currently in a relationship? </Text>



      <ToggleButtons
        scrollable
        selected={formUser?.goal ?? ""}
        parentClassName=""
        dict={{
          "yes": "Yes",
          "no": "No",
        }}
        commands={{
          "default": (answer) => {
            const relationship  = answer == "yes" ? "in-relationship":"single";
            updateFormUser("relationship", relationship);
          }
        }}
      />

    </View>
  )
}




const PartnerForm = ({formUser, updateFormUser}: ScreenProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}>Tell me about your partner!</Text>


      <TextField
        label="Your Partner's name"
        value={formUser?.partner_name ?? ""}
        onChangeText={(input) =>  updateFormUser("partner_name", input)}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
      />

      <View>
        <Text>When did you start dating: </Text>

        <BirthdayPicker date={formUser?.together_since ?? null} onChangeDate={(date) => {
          updateFormUser("together_since", date);
        }}></BirthdayPicker>

      </View>



    </View>
  )
}

const RelationshipForm = ({formUser, updateFormUser}: ScreenProps) => {

  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  let firstName = formUser?.partner_name?.split(" ")[0] ?? "Your Partner";

  if (formUser?.partner_name) {
    firstName = firstName[0].toUpperCase().trim() + firstName.substring(1);

  }
  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text  variant={"displaySmall"} className={"font-bold mb-4"}> {`Which best describes your relationship with ${firstName}?`} </Text>



      <ToggleButtons scrollable={true} selected={formUser?.relationship ?? ""} parentClassName={""} dict={{
        "in-relationship": "I'm in a relationship",
        "engaged": "I'm engaged",
        "married": "I'm married",
        "civil-partnership": "I'm in a civil partnership",
        "situation": "It's complicated"
      }} commands={{
        "default": (gender) => {
          setShowOtherInput(false)
          updateFormUser("relationship", gender)
        }
      }}

      ></ToggleButtons>


      {showOtherInput && (
        <View>
          <TextField
            label="Your gender"
            value={formUser?.gender ?? ""}
            onChangeText={(input) =>  updateFormUser("gender", input)}
            autoCapitalize="words"
            autoCorrect={false}
          ></TextField>
        </View>
      )}


    </View>
  )
}



const GoalForm = ({formUser, updateFormUser}: ScreenProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> What are your goals on History.love </Text>


      <ToggleButtons
        scrollable
        multipleChoice={true}
        selected={formUser?.goals ?? []}
        parentClassName=""
        dict={{
          "better-communication": "Improve communication",
          "quality-time": "Spend more quality time",
          "conflict-resolution": "Resolve conflicts better",
          "deeper-intimacy": "Deepen emotional/physical intimacy",
          "trust-building": "Build/repair trust",
          "shared-habits": "Build healthy shared habits",
          "milestone-planning": "Plan milestones (move in, engagement, etc.)",
          "gratitude-practice": "Practice daily appreciation",
          "fun-and-play": "Have more fun together",
          "dating-new": "Explore dating/new connections",
        }}
        commands={{
          "default": (goal) => {
            let newGoals : RelationshipGoal[] = formUser?.goals ?? [];
            if (formUser?.goals?.includes(goal)){
              newGoals.filter((g) => goal !== g)
            }else{
              newGoals.push(goal)
            }
            updateFormUser("goals", newGoals );
          }
        }}
      />



    </View>
  )
}

const CohabitationForm = ({formUser, updateFormUser}: ScreenProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}>Do you live together? </Text>


      <ToggleButtons
        scrollable
        selected={formUser?.cohabitation ?? ""}
        parentClassName=""
        dict={{
          "together": "Together",
          "separately-nearby": "Separately nearby",
          "separately-far": "Separately far",
        } as Record<Cohabitation, string>}
        commands={{
          "default": (answer) => {

            updateFormUser("cohabitation",  answer);
          }
        }}
      />



    </View>
  )
}

const KidsForm = ({formUser, updateFormUser}: ScreenProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Do either of you have kids? </Text>

      <Text variant={"bodyLarge"} className={"mb-10"}>This can be from past relationships as well.</Text>

      <ToggleButtons
        scrollable
        selected={formUser?.kids ? "yes":"no"}
        parentClassName=""
        dict={{
          "yes": "Yes",
          "no": "No",
        }}
        commands={{
          "default": (answer) => {
            updateFormUser("kids",  answer == "yes" ? true:false);
          }
        }}
      />



    </View>
  )
}

const NotificationsForm = ({formUser, updateFormUser}: ScreenProps) => {

  let firstName = formUser?.partner_name?.split(" ")[0] ?? "Your Partner";

  if (formUser?.partner_name) {
    firstName = firstName[0].toUpperCase().trim() + firstName.substring(1);
  }
  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <></>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> {`Recieve Notifications from ${firstName}`} </Text>

      <Text variant={"bodyLarge"} className={"mb-10"}>History.love</Text>

      <ToggleButtons
        scrollable
        selected={formUser?.kids ? "yes":"no"}
        parentClassName=""
        dict={{
          "yes": "Yes",
          "no": "No",
        }}
        commands={{
          "default": (answer) => {
            updateFormUser("kids",  answer == "yes" ? true:false);
          }
        }}
      />



    </View>
  )
}


export default function OnboardingScreen() {

  const colors = useThemeColors();

  const [screenFormIndex, setScreenFormIndex] = useState<number>(0);

  const { authUser } = useAuth();

  const [formUser, setFormUser] = useState<User | null>({
    id:  authUser?.uid ?? "",
    email: authUser?.email ?? "",
    name: authUser?.displayName ?? "",
  });

  const [direction, setDirection] = useState<"forward" | "backward">("forward");




  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setUserProperty = useUserStore((state) => state.setUserProperty);

  function updateFormUser<K extends keyof User>(key: K, value: User[K]) {
   console.log('updating: ', formUser)
    if (!formUser){
      return;
    }
    console.log(key, value);
    setFormUser({ ...formUser, [key]: value });
  }

  const isDisabled = (): boolean => {
    switch (screenFormIndex) {
      case 0:
        return false;
      case 1:
        return !(formUser?.name != null && formUser?.name.trim() != "" && formUser?.name.length >= 3 && formUser?.birthday != null) ;
      case 2:
        return !(formUser?.gender != null && formUser?.gender.trim() != "")
      case 3:
        return !(formUser?.relationship != null)
      case 4:
        return (!formUser)

      default:
        return false


    }


  }





  const forms = [WelcomeForm, AboutForm, GenderForm, AskIfInRelationshipForm, PartnerForm, RelationshipForm, GoalForm, CohabitationForm, KidsForm];
  const ActiveForm = forms[screenFormIndex];



  async function handleFormSubmit() {
    if (!formUser){return}
    await handleOnboarding(formUser)
    router.replace("/home")
  }

  const nextScreen = () => {
    setDirection("forward")


    if (screenFormIndex >= forms.length-1 || ((screenFormIndex >= 3) && formUser?.relationship == "single")) {
      return handleFormSubmit()
    }
    setScreenFormIndex((prev) => prev + 1);
  }
  const lastScreen = () => {
    setDirection("backward")
    setScreenFormIndex((prev) => prev - 1);
  }

  return (
    <Screen  backgroundColor={colors.surface} padding>

      {screenFormIndex !== 0 && <BackButton onPress={() => {
        lastScreen()
      }}></BackButton> }
      <Animated.View
        className={"mt-16"}
        key={screenFormIndex}
        entering={direction === "forward"
          ? SlideInRight.duration(220)
          : SlideInLeft.duration(220)}
        exiting={direction === "forward"
          ? SlideOutLeft.duration(220)
          : SlideOutRight.duration(220)}
      >
        {<ActiveForm formUser={formUser} updateFormUser={updateFormUser}  /> }


        <PrimaryButton  disabled={isDisabled()} className={"absolute w-full h-12 bottom-4 flex items-center justify-center"} onPress={() => {
          nextScreen()
        }}>
          <Text className={"text-white"}>Continue</Text>
        </PrimaryButton>
      </Animated.View>
    </Screen>
  )
}