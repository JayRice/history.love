import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/components/inputs/ToggleButtons';
import React from 'react';
import FormProps from '@/src/types/props/FormProps';


const KidsForm = ({formUser, updateFormUser}: FormProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Do either of you have kids? </Text>

      <Text variant={"bodyLarge"} className={"mb-10"}>This can be from past relationships as well.</Text>

      <ToggleButtons
        scrollable
        selected={formUser?.partner?.kids ? "yes":"no"}
        parentClassName=""
        dict={{
          "yes": "Yes",
          "no": "No",
        }}
        commands={{
          "default": (answer) => {
            updateFormUser("kids",  answer == "yes" ? true:false);
          }
        }}
      />



    </View>
  )
}


export default KidsForm