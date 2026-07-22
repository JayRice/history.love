import React from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Screen } from '@/src/components/layout/Screen';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import Swiper from "react-native-swiper";
import Logo from "@/assets/images/logo.svg";

import * as AppleAuthentication from "expo-apple-authentication";

import loginWithApple from "@/src/database/auth/loginWithApple";

import { router } from 'expo-router';



const { width } = Dimensions.get('window');
const SLIDE_HEIGHT = 300;


export default function StartScreen() {

  const colors = useThemeColors();


  return (
    <Screen  className={`bg-[${colors.surface}]`} padding={true} >

      <View  className={"w-full  items-end mb-6 flex flex-row  justify-between items-center  "}>
        <Logo className={"top-0 left-0"}  width={75} height={75} />

        <PrimaryButton onPress={() => router.push("/(auth)/login")}  variant="filled" size="small" className={"relative w-32 h-auto m-4"}>
          Log in
        </PrimaryButton>

      </View>



      <Swiper style={{ flexGrow: 1 }} scrollEnabled={false}  height={SLIDE_HEIGHT}
               autoplayTimeout={3}   // delay between slides
              showsPagination={false} className={""} autoplay loop>
        <View  className={"p-2 "} style={{ width, height: 300 }}>
          <Card.Cover  style={{ width: "100%", height: "100%" }}
                       resizeMode="cover" source={require("@/assets/images/photos/couple1.jpg")} />
        </View>
        <View className={"p-2"} style={{ width, height: 300 }}>
          <Card.Cover  style={{ width: "100%", height: "100%" }}
                       resizeMode="cover" source={require("@/assets/images/photos/couple2.jpg")} />
        </View>

        <View className={"p-2"} style={{ width, height: 300 }}>
          <Card.Cover  style={{ width: "100%", height: "100%" }}
                       resizeMode="cover" source={require("@/assets/images/photos/couple3.jpg")} />
        </View>
      </Swiper>


      <View   className="absolute w-screen mt-[125%] items-center ">


        <Text variant="bodyLarge" className="text-black text-center mt-2 ">
          Your relationship journey, beautifully documented
        </Text>

      </View>

      <View className={"space-y-2 z-10"}>
        <PrimaryButton className={"z-10"}  onPress={() => {
          router.push("/(auth)/register")
        }} variant={"filled"} size={"medium"}>
          Sign up with Email
        </PrimaryButton>

        {Platform.OS === "ios" && parseInt(Platform.Version as string, 10) >= 13 && (
          <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={{ width: "100%", height: 44 }}
          onPress={async () => {
            try {
              await loginWithApple();
              // If first login, save profile fields (fullName/email) while you have them.
            } catch (e: any) {
              console.error(e);
            }
          }}
        />)}

      </View>


    </Screen>
  )
}