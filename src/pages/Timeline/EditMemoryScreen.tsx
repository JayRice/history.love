import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Screen } from '@/src/components/layout/Screen';
import { router } from 'expo-router';
import { Text, Title } from 'react-native-paper';
import { View } from 'react-native';

import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { Input } from 'postcss';
import * as CONSTANTS from '@/constants';
import { TextField } from '@/src/components/inputs/TextField';
import { BackButton } from '@/src/components/buttons/BackButton';
import DatePicker from '@/src/components/inputs/DatePicker';
import { PhotoInput } from '@/src/components/inputs/PhotoInput';
import { LocationPicker } from '@/src/components/inputs/LocationPicker';
import { GeoLocation } from '@/src/types/GeoLocation';
import { addMemory } from '../../server/set/addMemory';
import Memory, { MemoryCategory, MemoryCategoryList, MemoryMood, MemoryMoodList } from '../../types/Memory';
import { CategoryPicker } from '@/src/components/inputs/CategoryPicker';
import Photo from "../../types/Photo"
import { useAuth } from '@/src/contexts/AuthContext';
import { editMemory } from '@/src/server/set/editMemory';
import {ToggleField} from "../../components/inputs/ToggleField"
import { useCurrentModal } from '@/src/hooks/useCurrentModal';
import { useMemoryImageStore } from '@/src/store/memoryImageStore';

interface ModalData {
  memory: Memory;
}
export default function EditMemoryScreen() {

  const { data, close} = useCurrentModal<ModalData, undefined>();


  const [memory, setMemory] = useState<Memory>(data!.memory);

  const colors = useThemeColors()


  const [title, setTitle] = React.useState<string>(memory?.title);

  const [date, setDate] = React.useState<Date | null>(new Date(memory.date));

  const [photos, setPhotos] = useState<Photo[]>([]);

  const [location, setLocation] = React.useState<GeoLocation | null>(memory.location || null);

  const [loading, setLoading] = React.useState(false);

  const [categories, setCategories] = React.useState<MemoryCategory[] | null>(memory.categories || null);

  const [mood, setMood] = React.useState<MemoryMood | null>(memory.mood || null);

  const [shouldDelete, setShouldDelete] = React.useState<boolean>(false);

  const [note, setNote] = React.useState<string>("");
  const [privateNote, setPrivateNote] = React.useState<string>("");

  const {authUser} = useAuth()

  const [deletedPhotos, setDeletedPhotos] = React.useState<string[]>([]);



  const memoryImages = useMemoryImageStore(s => s.memoryImages)
  const oldPhotos : Photo[] | null = useMemo(() => {
    const oldPhots = memory?.photos;
    if (!oldPhots) {return null}
    // change uri to downloadURL so it can be rendered to the user
    return oldPhots
      .filter(p => p.name && p.storedOn && !(deletedPhotos.includes(p.name))) // keep only valid ones
      .map(p => ({ ...p, uri: memoryImages[p.name!] ?? p.uri }));

  }, [memory?.photos, deletedPhotos]);

  const isDisabled = useCallback(() => {
    return !(title || date || location || categories || mood || note || privateNote);
  }, [title, date, photos, location, categories, mood, note, privateNote]);

  const handlePress = async () => {
    if (isDisabled() || !authUser) {return}



    const memoryData : Memory = {
      id: memory.id,
      title: title!,
      date: date?.toISOString() || "",
      location: location,
      mood: mood!,
      categories:  categories,
      notes: note ? [{ createdBy: authUser.uid, note: note }] : null,
      privateNotes: privateNote ? [{ createdBy: authUser.uid, note: privateNote }] : null,
      photos: photos,
    }
    setLoading(true);
    const response = await editMemory(memoryData, shouldDelete , deletedPhotos);
    setLoading(false);
    if (response.success){
      close();
      router.replace("/timeline")
    }
  }


  return (
    <Screen  padding safeArea scrollable style={{backgroundColor: colors.background}}>



      <View className={"h-20 sticky"}>
        <BackButton onPress={() => close()}></BackButton>
      </View>
      <Text   variant={"headlineMedium"} className={"font-bold"}>Edit your memory</Text>

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
            <Text variant={"bodySmall"}>Add or delete photos</Text>
          </View>


          <PhotoInput displayPhotos={oldPhotos ?? []} photos={photos} setPhotos={setPhotos} maxPhotos={6} onDelete={(photo) => {
            // if a stored photo
            if (photo?.storedOn){
              setDeletedPhotos([...deletedPhotos, photo.name].filter((photo) => photo != undefined))
            }

          }}></PhotoInput>
        </View>

        <CategoryPicker maxSelections={3} label={"Category"} categories={[...MemoryCategoryList]} value={categories ?? []} onChange={setCategories} ></CategoryPicker>

        <CategoryPicker multiple={false} label={"Mood"} categories={[...MemoryMoodList]} value={[mood]} onChange={(moods) => setMood(moods[0])} ></CategoryPicker>


        <View className={"flex"} style={{gap: 10}}>
          <DatePicker date={date} onChangeDate={setDate}></DatePicker>

          <LocationPicker value={location} onChange={setLocation}></LocationPicker>
        </View>

        <TextField multiline showMax textArea
                   label="Add a Note"
                   placeholder="e.g., This was so fun, I want us to go back soon..."
                   value={note}
                   onChangeText={(input) => setNote(input)}
                   autoCorrect={true}
                   maxLength={CONSTANTS.MAX_DEFAULT_NOTE_LENGTH}
        />

        <View>
          <TextField multiline showMax textArea optional
                     label="Add a Private Note"
                     placeholder="e.g., I was so nervous, but it was pretty fun..."
                     value={privateNote}
                     onChangeText={(input) => setPrivateNote(input)}
                     autoCorrect={true}
                     maxLength={CONSTANTS.MAX_DEFAULT_NOTE_LENGTH}
          />
        </View>

        <ToggleField label={"Delete Memory"} value={shouldDelete} onValueChange={setShouldDelete} description={"WARNING: THIS WILL DELETE THIS MEMORY PERMANENTLY "}></ToggleField>




        <PrimaryButton loading={loading} disabled={isDisabled()} className={"relative top-10 mb-20 "} variant={"filled"} onPress={() => {
          handlePress()
        }}>Edit Memory</PrimaryButton>


      </View>







    </Screen>
  )
}