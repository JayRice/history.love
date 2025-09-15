import React, { useState } from 'react';
import { View, ScrollView, Image, Dimensions, Platform, Pressable } from 'react-native';
import { Text, Card, Avatar, Divider, Button } from 'react-native-paper';
import { CreditCard as Edit3, MapPin, Heart, Users, Eye, EyeOff, Apple, Star } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';

import { useThemeColors } from '@/src/hooks/useThemeColors';

import { router } from 'expo-router';

import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import Swiper from 'react-native-swiper';
import { ToggleField } from '@/src/components/inputs/ToggleField';
import { BackButton } from '@/src/components/buttons/BackButton';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';




const { width } = Dimensions.get('window');
const SLIDE_HEIGHT = 500;


interface SB_PROPS{
  isYearly: boolean;
  perMonth: number;
  selected: "year"|"month";
  setSelected: (value: "year"|"month") => void;
}
function SubscriptionBlock({ isYearly, perMonth, selected, setSelected}: SB_PROPS) {
  const colors = useThemeColors();

  const type = isYearly ? "year" : "month";
  return (

    <Pressable onPress={() => {
      setSelected(isYearly ? "year":"month");
    }} style={{backgroundColor: colors.primary}} className={`rounded-md mt-10 `}>
      {isYearly && (
        <Text variant={"bodySmall"} className={"text-center font-bold py-1 text-white"}>MOST POPULAR</Text>
      )}
      <View style={{borderColor: selected == type ? colors.primary:"gray", backgroundColor: colors.background}} className={`flex p-4 rounded-md flex-row justify-between items-center p-4 ${isYearly ? "border-b-2 border-x-2":"py-8 border-2"} `}>

        <View className={"flex  justify-center "}>
          <View className={"flex flex-row gap-2  items-center"}>
            <Text variant={"headlineSmall"} numberOfLines={1} ellipsizeMode="clip" className={"font-bold px-1 "}>{isYearly? "Yearly":"Monthly"}</Text>
            {isYearly && <Text variant={'bodySmall'} style={{ backgroundColor: colors.primary }}
                   className={'p-[4px] text-white rounded-md'}>Save 77%</Text>}
          </View>

          {isYearly &&
            <View className={"flex flex-row gap-2  items-center"}>
              <Text variant={"bodySmall"} numberOfLines={1} ellipsizeMode="clip" className={"font-bold px-1 "}>12 mo</Text>
              <Text variant={"bodySmall"} className={"font-bold p-[4px] text-black rounded-md"}>$39.99</Text>
            </View>
          }

        </View>

        <View>
          <Text variant={"bodySmall"} className={"font-bold p-[4px] text-black rounded-md"}>${perMonth} / mo</Text>
        </View>

      </View>
    </Pressable>
  )
}

export default function SubscriptionScreen() {

  const colors = useThemeColors();

  const [freeTrialEnabled, setFreeTrialEnabled] = React.useState<boolean>(false);

  const [selectedSubscription, setSelectedSubscription] = React.useState<"month" | "year">("year");

  return (
    <Screen  className={`bg-[${colors.background}]`} padding={true} >

      <Animated.View className={"text-center space-y-6"}
        entering={FadeInUp.duration(300)}
        exiting={FadeOutDown.duration(200)}
      >
        <CloseButton  size={16} onPress={() => {
          router.replace("/home")
        }}></CloseButton>
        <Text variant={"displaySmall"} className={"font-bold text-center"}>Choose your plan</Text>
        <Text variant={"bodyLarge"} className={"text-center"}>One subscription, two accounts</Text>
        <View className={"flex flex-row gap-1 justify-center items-center w-full mb-10"}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i}  color="#FACC15" fill={"#FACC15"}   />
          ))}
        </View>

        <Swiper
          style={{ flexGrow: 1 }}
          scrollEnabled={false}
          height={SLIDE_HEIGHT}
          width={width}
          autoplayTimeout={3}   // delay between slides
          showsPagination={false}
          autoplay
          loop
        >
          {/* Slide 1 */}
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-lg text-center">
              Great tool for discussing critical topics and exploring each other's thoughts and perspectives
            </Text>
            <Text className="absolute bottom-2 right-4 text-xs text-gray-400">Slide 1</Text>
          </View>

          {/* Slide 2 */}
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-lg text-center">
              Build deeper intimacy by sharing stories and dreams that matter
            </Text>
            <Text className="absolute bottom-2 right-4 text-xs text-gray-400">Slide 2</Text>
          </View>

          {/* Slide 3 */}
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-lg text-center">
              Strengthen trust through guided activities that encourage vulnerability
            </Text>
            <Text className="absolute bottom-2 right-4 text-xs text-gray-400">Slide 3</Text>
          </View>

          {/* Slide 4 */}
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-lg text-center">
              Set shared goals together, whether for fun, growth, or future milestones
            </Text>
            <Text className="absolute bottom-2 right-4 text-xs text-gray-400">Slide 4</Text>
          </View>

          {/* Slide 5 */}
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-lg text-center">
              Rediscover joy and playfulness with curated prompts and challenges
            </Text>
            <Text className="absolute bottom-2 right-4 text-xs text-gray-400">Slide 5</Text>
          </View>
        </Swiper>
      </Animated.View>

      <View style={{backgroundColor: colors.card_surface }} className={`rounded-xl text-white  px-2 flex items-center justify-center`}>


        <ToggleField
          label="Free trial enabled"
          value={freeTrialEnabled}
          onValueChange={setFreeTrialEnabled}
        />
      </View>


      <SubscriptionBlock isYearly={true} perMonth={3.33} selected={selectedSubscription} setSelected={setSelectedSubscription} />

      <SubscriptionBlock isYearly={false} perMonth={14.99} selected={selectedSubscription} setSelected={setSelectedSubscription}/>


      <PrimaryButton className={"relative top-10 "} variant={"filled"} onPress={() => {
        // Subscription stuff
      }}>Start your 7-day free trial</PrimaryButton>

    </Screen>
  )
}