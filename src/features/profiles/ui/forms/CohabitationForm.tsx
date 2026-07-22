import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/shared/ui/inputs/ToggleButtons';
import { Cohabitation } from '@/src/shared/types/User';
import React from 'react';
import FormProps from '@/src/shared/types/props/FormProps';


const CohabitationForm = ({formUser, updateFormUser}: FormProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}>Do you live together? </Text>


      <ToggleButtons
        scrollable
        selected={formUser?.partner?.cohabitation ?? ""}
        parentClassName=""
        dict={{
          "together": "Together",
          "separately-nearby": "Separately nearby",
          "separately-far": "Separately far",
        } as Record<Cohabitation, string>}
        commands={{
          "default": (answer) => {
            updateFormUser("partner.cohabitation",  answer);
          }
        }}
      />



    </View>
  )
}

export default  CohabitationForm