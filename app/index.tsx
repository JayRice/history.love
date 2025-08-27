import { useEffect, useState } from 'react';
import { View , Image} from 'react-native';
import { Card } from "react-native-paper";

import { Redirect, router } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import Logo from '@/assets/images/logo.svg';


import {Screen} from "@/src/components/layout/Screen"


export default function Index() {


    return <Screen safeArea={true} className={"h-screen w-full items-center justify-center"}>
      <View className={"h-[]"}>
        <Logo width={200} height={200}></Logo>
        <LoadingSpinner  size={50} />
      </View>
    </Screen>

}