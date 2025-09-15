import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Logo from '@/assets/images/logo.svg';
import React from 'react';

const WelcomeForm = () => {
  return (
    <View className={"w-full h-full flex items-center justify-center pb-64 "}>
      <Text variant={"displaySmall"} className={"font-light mb-4 flex justify-center text-center"}> Welcome to  </Text>

      <Logo width={250} height={250}></Logo>
    </View>
  )
}
export default WelcomeForm;