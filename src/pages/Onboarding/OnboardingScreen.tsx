import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Image, Platform, Pressable, ScrollView, View } from 'react-native';
import * as ImagePicker from "expo-image-picker";

import { Text, Card, Avatar, Divider, TextInput } from 'react-native-paper';
import {
  CreditCard as Edit3,
  MapPin,
  Heart,
  Users,
  Eye,
  EyeOff,
  Apple,
  CheckCircle,
  CircleMinus,
  CircleCheck
} from 'lucide-react-native';
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


import User, { Cohabitation, ProfileImage, RelationshipGoal, UserSource } from '@/src/types/User';

import { auth } from "@/src/config/firebase"
import { useAuth } from '@/src/contexts/AuthContext';
import BirthdayPicker from '@/src/components/inputs/BirthdayPicker';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';



import Animated, {
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  FadeOut, SlideInLeft, SlideOutRight
} from 'react-native-reanimated';
import handleOnboarding from '@/src/server/user/handleOnboarding';
import isUsernameTaken from '@/src/server/user/isUsernameTaken';
import { BackButton } from '@/src/components/buttons/BackButton';
import ToggleButtons from '@/src/components/inputs/ToggleButtons';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import useDebounce from '@/src/hooks/useDebounce';


const { width, height } = Dimensions.get("window");



import AboutForm from '@/src/pages/Onboarding/forms/AboutForm';
import AskIfInRelationshipForm from '@/src/pages/Onboarding/forms/AskIfInRelationshipForm';
import CohabitationForm from '@/src/pages/Onboarding/forms/CohabitationForm';
import FunFactForm from '@/src/pages/Onboarding/forms/FunFactForm';
import GenderForm from '@/src/pages/Onboarding/forms/GenderForm';
import GoalForm from '@/src/pages/Onboarding/forms/GoalForm';
import KidsForm from '@/src/pages/Onboarding/forms/KidsForm';
import NotificationsForm from '@/src/pages/Onboarding/forms/NotificationsForm';
import PartnerForm from '@/src/pages/Onboarding/forms/PartnerForm';
import ProfileForm from '@/src/pages/Onboarding/forms/ProfileForm';
import RelationshipForm from '@/src/pages/Onboarding/forms/RelationshipForm';
import SourceForm from '@/src/pages/Onboarding/forms/SourceForm';
import WelcomeForm from '@/src/pages/Onboarding/forms/WelcomeForm';
import FormProps from '@/src/types/props/FormProps';


import * as CONSTANTS from "../../../constants/index"
import getMatchCode from '@/src/server/getMatchCode';

export default function OnboardingScreen() {

  const colors = useThemeColors();

  const [screenFormIndex, setScreenFormIndex] = useState<number>(0);


  const { authUser } = useAuth();

  const [formUser, setFormUser] = useState<User | null>({
    id:  authUser?.uid ?? "",
    email: authUser?.email ?? "",
  });

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);






  useEffect(() => {
    if  (!authUser) {return}
    updateFormUser("email", authUser?.email);
    updateFormUser("id", authUser?.uid);


    init_user()
    async function init_user(){
      if  (!authUser) {return}

      const match_code = await getMatchCode();

      updateFormUser("profile.matchCode", match_code);

      if (CONSTANTS.DEV_MODE){

        const exampleUser: User = {
          id: authUser?.uid,
          email: "sarah.martinez@example.com",

          settings: {
            send_notifications: true,
          },

          profile: {
            first_name: "Sarah",
            last_name: "Martinez",
            username: "sarahm_92",
            birthday: new Date("1992-08-14"),
            gender: "female",
            profileImage: {
              type: "google",
              local_uri: "https://lh3.googleusercontent.com/a-/AOh14GgExamplePhoto", // google photo link
            },
            bio: "Book lover 📚, runner 🏃‍♀️, and always up for trying new recipes. Excited to grow together!",
            verified: true,
          },

          location: {
            latitude: 40.7128,
            longitude: -74.006,
            city: "New York",
            state: "NY",
            country: "USA",
          },

          partner: {
            name: "Daniel",
            together_since: new Date("2020-03-15"),
            relationship: "in-relationship",
            cohabitation: "together",
            kids: false,
            goals: [
              "quality-time",
              "better-communication",
              "fun-and-play",
              "milestone-planning",
            ],
          },

          analytics: {
            created_at: new Date(),
            num_logged_in: 37,
            source: "app/play-store",
          },

          data: {
            // reserved for future app-specific fields
          },
        };

        setFormUser(exampleUser);
      }
    }


  }, [authUser]);

  const [direction, setDirection] = useState<"forward" | "backward">("forward");


  const [usernameTaken, setUsernameTaken] = useState<boolean>(true)

  const [isOnboarding, setIsOnboarding] = useState<boolean>(false)




  type ScreenComponent = React.ComponentType<any>;






  function updateFormUser(key: string, value: any) {
    setFormUser(prev => {
      if (!prev) return prev;

      if (typeof key === "string" && key.includes(".")) {
        const [rootKey, childKey] = key.split(".") as [keyof User & string, string];
        const rootVal = (prev as any)[rootKey] ?? {};
        return {
          ...prev,
          [rootKey]: {
            ...rootVal,
            [childKey]: value,
          },
        } as User;
      }

      // top-level key
      return {
        ...prev,
        [key as keyof User]: value,
      } as User;
    });
  }


  const forms = {
    welcome: WelcomeForm,
    about: AboutForm,
    gender: GenderForm,
    profile:ProfileForm,
    askIfInRelationship: AskIfInRelationshipForm,
    partner: PartnerForm,
    relationship: RelationshipForm,
    goals: GoalForm,
    cohabitation: CohabitationForm,
    kids: KidsForm,
    notifications: NotificationsForm,
    source: SourceForm,
    funfact: FunFactForm
  } satisfies Record<string, ScreenComponent>;

  type FormKey = keyof typeof forms;

// Now keys are typed as the actual union, not string[]
  const formKeys = Object.keys(forms) as FormKey[];

  const currentForm = formKeys[screenFormIndex];
  const ActiveForm = currentForm && forms[currentForm];


  /*
  *  partner: PartnerForm,
    relationship: RelationshipForm,
    goals: GoalForm,
    cohabitation: CohabitationForm,
    kids: KidsForm,
    notifications: NotificationsForm,
    source: SourceForm,
    funfact: FunFactForm
  * */


  const isDisabled = (): boolean => {
    const username = formUser?.profile?.username?.trim();
    const partner_name = formUser?.partner?.name
    const first_name = formUser?.profile?.first_name;
    const last_name = formUser?.profile?.last_name;
    switch (currentForm) {
      case "welcome":
        return false;
      case "about":
        return !( (first_name != null && first_name.trim() != "" && first_name.length >= 3) && (last_name != null && last_name.trim() != "" && last_name.length >= 3) && formUser?.profile?.birthday != null) ;
      case "gender":
        return !(formUser?.profile?.gender != null && formUser?.profile?.gender.trim() != "")
      case "profile":
        return !(username != null && username != "" && username.length >= 3 && formUser?.profile?.profileImage != null && !usernameTaken )
      case "askIfInRelationship":
        return !(formUser?.partner?.relationship != null)
      case "partner":
        return !(partner_name != null && partner_name.trim() != "" && partner_name.length >= 3 && formUser?.partner?.together_since != null)
      case "cohabitation":
        return !(formUser?.partner?.cohabitation != null);
      case "kids":
        return false;
      case "notifications":
        return false;
      case "source":
        return !(formUser?.analytics?.source != null);

      default:
        return false


    }


  }

  const isLoading = () => {
    switch (currentForm) {

      case "funfact":
        return isOnboarding;

      default:
        return false


    }

  }

  const goToForm = (form: FormKey) => {
    const formIndex = formKeys.indexOf(form);



    if (formIndex === -1) {return}

    setDirection(formIndex > screenFormIndex? "forward":"backward")

    setScreenFormIndex(formIndex);
  }

  const onPressContinue = () => {

    switch (currentForm) {
      case "askIfInRelationship":
        return formUser?.partner?.relationship == "single" ? goToForm("source"):nextScreen()
      case "notifications":
        updateFormUser("settings.send_notifications", true);
    }
    nextScreen()

  }

  const continueButtonTitle = () => {
    switch (currentForm) {

      case "notifications":
        return "Yes please"
      case "funfact":
        return "Start your journey"
    }
    return "Continue"
  }









  async function handleFormSubmit() {
    if (!formUser){return}

    setIsOnboarding(true)
    const response = await handleOnboarding(formUser);
    if (response.success){
      setUser(response.user);
    }else if (response.error) {
      setScreenFormIndex(0)
      return Alert.alert("Error", response.error);
    }
    setIsOnboarding(false)
    router.replace("/home")
  }

  const nextScreen = () => {
    setDirection("forward")
    if (screenFormIndex >= formKeys.length-1 ) {
      return handleFormSubmit()
    }
    setScreenFormIndex((prev) => prev + 1);
  }
  const lastScreen = () => {
    setDirection("backward")

    // if single skip the partner onboarding setup
    if (currentForm == "source" && formUser?.partner?.relationship == "single" ){
      return goToForm("askIfInRelationship");
    }
    setScreenFormIndex((prev) => prev - 1);
  }

  const sharedProps: FormProps = {
    formUser,
    updateFormUser: updateFormUser
  };

  return (
    <Screen className={"relative"} backgroundColor={colors.surface} padding>

      { (currentForm == "source" || currentForm == "notifications" || true) && (
        <PrimaryButton onPress={() => {
          onPressContinue()
        }} variant={"text"} className={`absolute mb-4 z-50 top-4 right-2 text-${colors.primary} `}>Skip</PrimaryButton>

      )}
      {currentForm != "welcome" && <BackButton onPress={() => {
        lastScreen()
      }}></BackButton> }
      <Animated.View
        className={"mt-20"}
        key={screenFormIndex}
        entering={direction === "forward"
          ? SlideInRight.duration(220)
          : SlideInLeft.duration(220)}
        exiting={direction === "forward"
          ? SlideOutLeft.duration(220)
          : SlideOutRight.duration(220)}
      >
        <ActiveForm
          {...sharedProps}
          {...(currentForm === "profile"
            ? { usernameTaken, setUsernameTaken } : {})}
        />



      </Animated.View>
      <PrimaryButton onPress={onPressContinue} loading={isLoading()}  disabled={isDisabled()} className={"absolute w-full h-12 bottom-4 flex items-center justify-center"}>
        <Text className={"text-white"}>{continueButtonTitle()}</Text>
      </PrimaryButton>
    </Screen>
  )
}