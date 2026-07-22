import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Logo from '@/assets/images/logo.svg';
import React from 'react';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import logout from '@/src/features/auth/data/legacy/logout';

const WelcomeForm = () => {
  return (
    <View className={"w-full h-full flex items-center justify-center pb-64 "}>
      <PrimaryButton className={"absolute z-50 top-4 left-4"} variant={"text"} onPress={() => {
        logout()
      }}>Logout</PrimaryButton>
      <Text variant={"displaySmall"} className={"font-light mb-4 flex justify-center text-center"}> Welcome to  </Text>

      <Logo width={250} height={250}></Logo>
    </View>
  )
}
export default WelcomeForm;