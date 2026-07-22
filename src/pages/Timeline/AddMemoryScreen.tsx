import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import React, { useState } from 'react';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { router } from 'expo-router';
import { Text } from 'react-native-paper';
import { View } from 'react-native';

import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import * as CONSTANTS from '@/src/shared/config/constants';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';
import DatePicker from '@/src/shared/ui/inputs/DatePicker';
import { PhotoInput } from '@/src/shared/ui/inputs/PhotoInput';
import { LocationPicker } from '@/src/shared/ui/inputs/LocationPicker';
import { GeoLocation } from '@/src/shared/types/GeoLocation';
import { addMemory } from '@/src/server/set/addMemory';
import Memory, { MemoryCategory, MemoryCategoryList, MemoryMood, MemoryMoodList } from '@/src/shared/types/Memory';
import { CategoryPicker } from '@/src/shared/ui/inputs/CategoryPicker';
import Photo from "@/src/shared/types/Photo"
import {useAuth} from '@/src/contexts/AuthContext';

export default function AddMemoryScreen() {

  const colors = useThemeColors()

  const [title, setTitle] = React.useState('');

  const [date, setDate] = React.useState<Date | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([])

  const [location, setLocation] = React.useState<GeoLocation | null>(null);

  const [loading, setLoading] = React.useState(false);

  const [categories, setCategories] = React.useState<MemoryCategory[] | null>(null);

  const [mood, setMood] = React.useState<MemoryMood | null>()


  const {authUser}  = useAuth();

  const [note, setNote] = React.useState('');
  const [privateNote, setPrivateNote] = React.useState('');

  const isDisabled = () => {
    return !(title && date && location && categories && mood && note);
  }
  const handlePress = async () => {
    if (isDisabled() || !authUser) {return}


    const memoryData: Omit<Memory, "id"> = {
      title: title,
      date: date!.toISOString(),
      location: location,
      mood: mood!,
      categories:  categories,
      notes: [{ createdBy: authUser.uid, note: note }],
      privateNotes: [{ createdBy: authUser.uid, note: privateNote }],
      photos: photos,
    }
    setLoading(true);
    const response = await addMemory(memoryData)
    setLoading(false);
    if (response.success){
      router.back()
    }
  }

  return (
    <Screen  padding safeArea scrollable style={{backgroundColor: colors.background}}>



        <View className={"h-20 sticky"}>
          <BackButton />
        </View>
        <Text   variant={"headlineMedium"} className={"font-bold"}>Add a memory to your timeline</Text>

        <View style={{gap: 10}} className={"flex"}>
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
              <Text variant={"bodySmall"}>Add atleast one or more photos to always remember that special moment!</Text>
            </View>


            <PhotoInput  photos={photos} setPhotos={setPhotos} maxPhotos={6}></PhotoInput>
          </View>

          <CategoryPicker maxSelections={3} label={"Category"} categories={[...MemoryCategoryList]} value={categories ?? []} onChange={setCategories} ></CategoryPicker>

          <CategoryPicker multiple={false} label={"Mood"} categories={[...MemoryMoodList]} value={[mood]} onChange={(moods) => setMood(moods[0])} ></CategoryPicker>


          <View className={"flex"} style={{gap: 10}}>
            <DatePicker date={date} onChangeDate={setDate}></DatePicker>

            <LocationPicker value={location} onChange={setLocation}></LocationPicker>
          </View>

          <TextField multiline showMax textArea
                     label="Note"
                     placeholder="e.g., This was so fun, I want us to go back soon..."
                     value={note}
                     onChangeText={(input) => setNote(input)}
                     autoCorrect={true}
                     maxLength={CONSTANTS.MAX_DEFAULT_NOTE_LENGTH}
          />

          <View>
            <TextField multiline showMax textArea optional
                       label="Private Note"
                       placeholder="e.g., I was so nervous, but it was pretty fun..."
                       value={privateNote}
                       onChangeText={(input) => setPrivateNote(input)}
                       autoCorrect={true}
                       maxLength={CONSTANTS.MAX_DEFAULT_NOTE_LENGTH}
            />
          </View>




          <PrimaryButton loading={loading} disabled={isDisabled()} className={"relative top-10 mb-20 "} variant={"filled"} onPress={() => {
            handlePress()
          }}>Create Memory</PrimaryButton>

 
        </View>







    </Screen>
  )
}