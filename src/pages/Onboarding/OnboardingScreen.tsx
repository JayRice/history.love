import React, { useState } from 'react';
import { View} from 'react-native';
import { Text, Card, Avatar, Divider } from 'react-native-paper';
import { CreditCard as Edit3, MapPin, Heart, Users, Eye, EyeOff, Apple } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/components/buttons/SecondaryButton';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import Logo from "@/assets/images/logo.svg";
import { router } from 'expo-router';

import {useUserStore} from '@/src/store/userStore';


export default function OnboardingScreen() {

  const colors = useThemeColors();

  const { user, setUser } = useUserStore((state) => ({
    user: state.user,
    setUser: state.setUser,
  }));
  return (
    <Screen  className={`bg-[${colors.surface}]`} padding={true} >
      <View>
        <Text>User stringified: {JSON.stringify(user)}</Text>
      </View>
    </Screen>
  )
}