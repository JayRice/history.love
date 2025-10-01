import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useEffect, useState } from 'react';
import { Screen } from '@/src/components/layout/Screen';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import { router } from 'expo-router';
import { Text, Title } from 'react-native-paper';
import { View } from 'react-native';

import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { Input } from 'postcss';
import * as CONSTANTS from '@/constants';
import { TextField } from '@/src/components/inputs/TextField';
import { MAX_DEFAULT_TITLE_LENGTH } from '@/constants';
import { BackButton } from '@/src/components/buttons/BackButton';
import DatePicker from '@/src/components/inputs/DatePicker';
import { PhotoInput } from '@/src/components/inputs/PhotoInput';
import PickedPhoto from '@/src/types/PickedPhoto';
import { LocationPicker } from '@/src/components/inputs/LocationPicker';
import { useLocationModalStore } from '../../store/useLocationModalStore';
import { GeoLocation } from '@/src/types/GeoLocation';

export default function AddMemoryScreen() {

  const colors = useThemeColors()

  const [title, setTitle] = React.useState('');

  const [date, setDate] = React.useState<Date | null>(null);

  const [photos, setPhotos] = useState<PickedPhoto[]>([])

  const [location, setLocation] = React.useState<GeoLocation | null>(null);



  useEffect(() => {
    console.log("current photo uris: ", photos)
  }, [photos]);
  return (
    <Screen safeArea scrollable style={{backgroundColor: colors.background}}>



        <View className={"h-20 sticky"}>
          <BackButton></BackButton>
        </View>
        <Text   variant={"headlineMedium"} className={"font-bold"}>Add a memory to your timeline</Text>

        <View className={"space-y-8"}>
          <TextField showMax
            label="Title"
            placeholder="e.g., Exciting Date Night"
            value={title}
            onChangeText={(input) => setTitle(input)}
            autoCorrect={true}
            maxLength={CONSTANTS.MAX_DEFAULT_TITLE_LENGTH}
          />

          <View className={"flex"} style={{gap: 10}}>
            <View>
              <Text variant={"bodyLarge"}>Photos</Text>
              <Text variant={"bodySmall"}>Add one or more photos to always remember that special moment</Text>
              <Text variant={"bodySmall"} className={"font-light"}>(Optional)</Text>
            </View>


            <PhotoInput photos={photos} setPhotos={setPhotos} maxPhotos={6}></PhotoInput>
          </View>


          <View className={"flex"} style={{gap: 10}}>
            <DatePicker date={date} onChangeDate={setDate}></DatePicker>

            <LocationPicker value={location} onChange={setLocation}></LocationPicker>
          </View>



          <PrimaryButton className={"relative top-10 mb-20 "} variant={"filled"} onPress={() => {

          }}>Create Memory</PrimaryButton>

 
        </View>







    </Screen>
  )
}