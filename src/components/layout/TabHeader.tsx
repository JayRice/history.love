import { View, ViewStyle } from 'react-native';
import { BackButton } from '@/src/components/buttons/BackButton';
import { Text } from 'react-native-paper';
import Trophy from '@/assets/images/home-images/trophy.svg';
import React, { JSX } from 'react';

export function TabHeader({title, description, Icon, style}: {title: string, description?: string, Icon: JSX.Element, style?: ViewStyle }) {
  return (
    <View className={"space-y-2 mb-4 w-full   "}>

      <View className={"py-8 px-4 "}  style={style}>
        <BackButton absolute={false} addedClasses={"left-[-10%] mb-4"}></BackButton>
        <View className={"flex relative"}>

          <View className={"w-3/4"}>
            <Text variant="headlineMedium" className="text-white font-bold">
              {title}
            </Text>
            <Text variant="bodyLarge" className="text-white font-light">
              {description ? description : ""}
            </Text>
          </View>
          <View className={"absolute left-3/4    z-50"}>
            <Icon width={100} height={100} ></Icon>
          </View>
        </View>
      </View>
    </View>
  )
}