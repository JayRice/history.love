import React, { useEffect, useState } from 'react';
import { Alert, Dimensions } from 'react-native';

import { Text } from 'react-native-paper';


import { Screen } from '@/src/shared/ui/layout/Screen';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';

import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { router } from 'expo-router';

import {useUserStore} from '@/src/store/userStore';


import User from '@/src/shared/types/User';

import { useAuth } from '@/src/features/auth/hooks/AuthContext';



import Animated, {
  SlideInRight,
  SlideOutLeft, SlideInLeft, SlideOutRight
} from 'react-native-reanimated';
import handleOnboarding from '../data/legacy/handleOnboarding';
import ProfileFormProps from '@/src/shared/types/props/ProfileFormProps';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';



import AboutForm from '@/src/features/profiles/ui/forms/AboutForm';
import AskIfInRelationshipForm from '@/src/features/profiles/ui/forms/AskIfInRelationshipForm';
import CohabitationForm from '@/src/features/profiles/ui/forms/CohabitationForm';
import FunFactForm from '@/src/features/profiles/ui/forms/FunFactForm';
import GenderForm from '@/src/features/profiles/ui/forms/GenderForm';
import GoalForm from '@/src/features/profiles/ui/forms/GoalForm';
import KidsForm from '@/src/features/profiles/ui/forms/KidsForm';
import NotificationsForm from '@/src/features/profiles/ui/forms/NotificationsForm';
import PartnerForm from '@/src/features/profiles/ui/forms/PartnerForm';
import ProfileForm from '@/src/features/profiles/ui/forms/ProfileForm';
import RelationshipForm from '@/src/features/profiles/ui/forms/RelationshipForm';
import SourceForm from '@/src/features/profiles/ui/forms/SourceForm';
import WelcomeForm from '@/src/features/profiles/ui/forms/WelcomeForm';
import FormProps from '@/src/shared/types/props/FormProps';


import getMatchCode from '@/src/features/relationships/data/legacy/getMatchCode';


const { width, height } = Dimensions.get("window");

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
  // All forms take FormProps; ProfileForm additionally takes the optional
  // usernameTaken props (ProfileFormProps extends FormProps), which are only
  // spread when currentForm === "profile". Widening to the superset props
  // type is sound for the union and keeps the conditional spread typed.
  const ActiveForm = currentForm && (forms[currentForm] as React.FC<ProfileFormProps>);


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