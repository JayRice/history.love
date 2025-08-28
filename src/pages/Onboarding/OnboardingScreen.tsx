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


const { width, height } = Dimensions.get("window");



interface ScreenProps {
  updateFormUser: <K extends keyof User>(key: K | string, value: User[K] | string) => void;
  formUser: User | null;
}

const DEFAULT_AVATAR = require("@/assets/images/default-avatar.png");
const MAX_USERNAME_LENGTH = 24;
const MAX_BIO_LENGTH = 200;


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

        <BirthdayPicker date={formUser?.profile?.birthday ?? null} onChangeDate={(date) => {
          updateFormUser("profile.birthday", date);
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

      <ToggleButtons selected={formUser?.profile?.gender ?? ""} parentClassName={"mt-10"} dict={{
        "female": "Female",
        "male": "Male",
        "non-binary": "Gender queer / Non-binary",
        "other": "Other",
      }} commands={{
        "default": (gender) => {
          setShowOtherInput(false)
          updateFormUser("profile.gender", gender)
        },
        "other": () => {
          console.log(formUser)
          updateFormUser("profile.gender", "")
          setShowOtherInput(true)
        }

      }}

      ></ToggleButtons>

      {showOtherInput && (
        <View>
          <TextField
            label="Your gender"
            value={formUser?.profile?.gender ?? ""}
            onChangeText={(input) =>  updateFormUser("profile.gender", input)}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
          ></TextField>
        </View>
      )}

    </View>
  )
}
const ProfileForm: React.FC<ScreenProps> = ({ formUser, updateFormUser }) => {
  const [requestingPerms, setRequestingPerms] = useState(false);

  // Seed Google photoURL exactly once if user has none set yet
  useEffect(() => {
    const photoURL = auth.currentUser?.photoURL;
    const hasUserImage = !!formUser?.profile?.profileImage?.url;

    if (!hasUserImage && photoURL) {
      updateFormUser("profile.profileImage", { type: "google", url: photoURL } as ProfileImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // current image URL or fallback
  const currentImageSource = useMemo(() => {
    const url = formUser?.profile?.profileImage?.url;
    if (url) return { uri: url };
    return DEFAULT_AVATAR;
  }, [formUser?.profile?.profileImage?.url]);

  const bioLength = formUser?.profile?.bio?.length ?? 0;
  const remainingBio = Math.max(0, MAX_BIO_LENGTH - bioLength);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      updateFormUser("profile.profileImage", { type: "stored", url: res.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      cameraType: ImagePicker.CameraType.front, // selfie
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      updateFormUser("profile.profileImage", { type: "stored", url: res.assets[0].uri });
    }
  };

// Call this from your avatar Pressable
  const changePhoto = () => {
    if (Platform.OS === "ios") {
      Alert.alert("Profile photo", "Choose a source", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert("Profile photo", "Choose a source", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  console.log("reload")
  return (
    <View className="w-full h-full">
      <Text variant="displaySmall" className="font-bold mb-6">
        Make your profile
      </Text>

      {/* Avatar + Edit */}
      <View className="items-center mb-8">
        <Pressable
          onPress={changePhoto}
          disabled={requestingPerms}
          className="relative"
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          <Image
            source={currentImageSource}
            className="w-28 h-28 rounded-full"
          />
          <View className="absolute bottom-0 right-0 px-2 py-1 rounded-full bg-black/60">
            <Text className="text-white text-xs">Edit</Text>
          </View>
        </Pressable>
        <Text className="text-gray-500 mt-2 text-xs">
          Tap to choose a photo
        </Text>
      </View>

      {/* Username */}
      <View className="mb-6">
        <Text className="mb-1 font-medium">Your Username</Text>
        <TextField
          placeholder="e.g., jayden"
          value={formUser?.profile?.username ?? ""}
          onChangeText={(input) => updateFormUser("profile.username", input)}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={MAX_USERNAME_LENGTH}
        />
        <Text className="text-gray-500 mt-1 text-xs">
          {`${(formUser?.profile?.username?.length ?? 0)}/${MAX_USERNAME_LENGTH}`}
        </Text>
      </View>

      {/* Bio */}
      <View className="mb-4">
        <Text className="mb-1 font-medium">Bio</Text>
        <TextField
          placeholder="Tell people a little about you..."
          value={formUser?.profile?.bio ?? ""}
          onChangeText={(input) => updateFormUser("profile.bio", input)}
          multiline
          maxLength={MAX_BIO_LENGTH}
        />
        <Text className={`mt-1 text-xs ${remainingBio <= 20 ? "text-red-500" : "text-gray-500"}`}>
          {remainingBio} characters left
        </Text>
      </View>
    </View>
  );
};

const AskIfInRelationshipForm = ({formUser, updateFormUser}: ScreenProps) => {

  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Are you currently in a relationship? </Text>



      <ToggleButtons
        scrollable
        selected={formUser?.partner?.goals ?? ""}
        parentClassName=""
        dict={{
          "yes": "Yes",
          "no": "No",
        }}
        commands={{
          "default": (answer) => {
            const relationship  = answer == "yes" ? "in-relationship":"single";
            updateFormUser("partner.relationship", relationship);
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
        value={formUser?.partner?.name ?? ""}
        onChangeText={(input) =>  updateFormUser("partner.name", input)}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
      />

      <View>
        <Text>When did you start dating: </Text>

        <BirthdayPicker date={formUser?.partner?.together_since ?? null} onChangeDate={(date) => {
          updateFormUser("partner.together_since", date);
        }}></BirthdayPicker>

      </View>



    </View>
  )
}
const RelationshipForm = ({formUser, updateFormUser}: ScreenProps) => {

  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  let partnerName = formUser?.partner?.name?.split(" ")[0] ?? "Your Partner";

  if (formUser?.partner?.name) {
    partnerName = partnerName[0].toUpperCase().trim() + partnerName.substring(1);

  }
  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text  variant={"displaySmall"} className={"font-bold mb-4"}> {`Which best describes your relationship with ${partnerName}?`} </Text>



      <ToggleButtons scrollable={true} selected={formUser?.partner?.relationship ?? ""} parentClassName={""} dict={{
        "in-relationship": "I'm in a relationship",
        "engaged": "I'm engaged",
        "married": "I'm married",
        "civil-partnership": "I'm in a civil partnership",
        "situation": "It's complicated"
      }} commands={{
        "default": (gender) => {
          setShowOtherInput(false)
          updateFormUser("partner.relationship", gender)
        }
      }}

      ></ToggleButtons>


      {showOtherInput && (
        <View>
          <TextField
            label="Your gender"
            value={formUser?.partner?.relationship ?? ""}
            onChangeText={(input) =>  updateFormUser("partner.relationship", input)}
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
        selected={formUser?.partner?.goals ?? []}
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
            let newGoals : RelationshipGoal[] = formUser?.partner?.goals ?? [];
            if (formUser?.partner?.goals?.includes(goal)){
              newGoals.filter((g) => goal !== g)
            }else{
              newGoals.push(goal)
            }
            updateFormUser("partner.goals", newGoals );
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
        selected={formUser?.partner?.cohabitation ?? ""}
        parentClassName=""
        dict={{
          "together": "Together",
          "separately-nearby": "Separately nearby",
          "separately-far": "Separately far",
        } as Record<Cohabitation, string>}
        commands={{
          "default": (answer) => {
            updateFormUser("partner.cohabitation",  answer);
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
        selected={formUser?.partner?.kids ? "yes":"no"}
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

  let partnerName = formUser?.partner?.name?.split(" ")[0] ?? "Your Partner";

  if (formUser?.partner?.name) {
    partnerName = partnerName[0].toUpperCase().trim() + partnerName.substring(1);
  }
  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Card.Cover className={""}  style={{ width: "100%", height: "60%" }}
                   resizeMode="cover" source={require("@/assets/images/photos/couple2.jpg")} />
      <View >
        <Text variant={"displaySmall"} className={"font-bold mb-4 text-center"}> {`Recieve notifications from ${partnerName}`}? </Text>

        <Text variant={"bodyLarge"} className={"mb-10 text-center"}>We'll send you notifcations whenever your partner does something`.</Text>

      </View>





    </View>
  )
}
const SourceForm = ({formUser, updateFormUser}: ScreenProps) => {

  const colors = useThemeColors()

  const sourceDict: Record<UserSource, string> = {
    "facebook/instagram": "Facebook / Instagram",
    "blog/article": "Blogs & Articles",
    "youtube": "YouTube",
    "chatgpt-or-similar": "ChatGPT or similar",
    "therapist/counselor": "Therapist / Counselor",
    "app/play-store": "Apps (Play/App Store)",
    "partner": "Partner",
    "streaming": "Streaming (TV, etc.)",
    "tiktok": "TikTok",
    "podcast": "Podcast",
    "friend/family": "Friend / Family",
  };

  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}>Where did you hear about History.love </Text>


      <ToggleButtons
        scrollable
        selected={(formUser?.analytics?.source) ?? []}
        parentClassName=""
        dict={sourceDict}
        commands={{
          default: (source) => {

            updateFormUser("analytics.source", source);
          },
        }}
      />


    </View>
  )
}


const FunFactForm = ({formUser, updateFormUser}: ScreenProps) => {

  const colors = useThemeColors()



  const badSentences = ["Stuck in the day to day routine",
  "Feeling detached", "Avoiding deeper conversations", "Not sure what steps to take to improve your relationship"]

  const goodSentences = ["Getting to know each other on a deeper level", "Feeling connected every day",
    "Talking openly about sex, finances, conflict", "Reaching your relationship goals together"]

  const cardClasses = "absolute flex-1 w-[50%] h-[50vh] p-0"
  const sentencesClases = "h-16 flex flex-row gap-2 items-center "
  return (
    <View className={"w-full h-[100%]  pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> History.love helps couples stay in love </Text>


      <View className={"mt-10"}>
        <Card className={`${cardClasses} mt-10 bg-gray-500  rounded-md opacity-70 p-10 `}>

          <Text variant={"bodyLarge"} className={"font-bold"}>Without {"\n"}History.love</Text>

          { badSentences.map((sentence) =>

            <View key={sentence} className={sentencesClases}>
              <CircleMinus className={"text-gray-600"}></CircleMinus>
              <Text>{sentence}</Text>
            </View>)}
        </Card>

        <Card style={{ backgroundColor: colors.primary }} className={`${cardClasses} z-50 left-[50%] rounded-md  p-10`}>

          <Text variant={"bodyLarge"} className={"font-bold text-white "}>With {"\n"}History.love</Text>

          { goodSentences.map((sentence) =>
            <View key={sentence} className={sentencesClases}>
              <CircleCheck className={"text-white"}></CircleCheck>
              <Text className={"text-white "}>{sentence}</Text>
            </View>)}
        </Card>
      </View>




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

  type ScreenComponent = React.ComponentType<any>;






// ----- Implementation: works for "email" and "profile.birthday" -----
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
    profile: ProfileForm,
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

  const currentForm = formKeys[screenFormIndex];        // FormKey | undefined
  const ActiveForm = currentForm && forms[currentForm] ;

  const isDisabled = (): boolean => {
    switch (currentForm) {
      case "welcome":
        return false;
      case "about":
        return !(formUser?.name != null && formUser?.name.trim() != "" && formUser?.name.length >= 3 && formUser?.profile?.birthday != null) ;
      case "gender":
        return !(formUser?.profile?.gender != null && formUser?.profile?.gender.trim() != "")
      case "askIfInRelationship":
        return !(formUser?.partner?.relationship != null)
      case "cohabitation":
        return !(formUser?.partner?.cohabitation != null);

      default:
        return false


    }


  }

  const goToForm = (form: FormKey) => {
    const formIndex = formKeys.indexOf(form);

    if (formIndex === -1) {return}

    setScreenFormIndex(formIndex);

  }

  const onPressContinue = () => {

    switch (currentForm) {

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
    await handleOnboarding(formUser)
    router.replace("/home")
  }

  const nextScreen = () => {
    setDirection("forward")


    if (screenFormIndex >= formKeys.length-1 || ((screenFormIndex >= 3) && formUser?.partner?.relationship == "single")) {
      return handleFormSubmit()
    }
    setScreenFormIndex((prev) => prev + 1);
  }
  const lastScreen = () => {
    setDirection("backward")
    setScreenFormIndex((prev) => prev - 1);
  }

  return (
    <Screen className={"relative"} backgroundColor={colors.surface} padding>

      { (currentForm == "source" || currentForm == "notifications") && (
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
        {<ActiveForm formUser={formUser} updateFormUser={updateFormUser}  />  }



      </Animated.View>
      <PrimaryButton  disabled={isDisabled()} className={"absolute w-full h-12 bottom-4 flex items-center justify-center"} onPress={() => {
        onPressContinue()
      }}>
        <Text className={"text-white"}>{continueButtonTitle()}</Text>
      </PrimaryButton>
    </Screen>
  )
}