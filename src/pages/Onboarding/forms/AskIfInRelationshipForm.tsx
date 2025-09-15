import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/components/inputs/ToggleButtons';
import React from 'react';
import FormProps from '@/src/types/props/FormProps';


const AskIfInRelationshipForm = ({formUser, updateFormUser}: FormProps) => {

  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Are you currently in a relationship? </Text>



      <ToggleButtons
        scrollable
        selected={formUser?.partner?.goals ?? ""}
        parentClassName=""
        dict={{
          "yes": "Yes",
          "no": "No",
        }}
        commands={{
          "default": (answer) => {
            const relationship  = answer == "yes" ? "in-relationship":"single";
            updateFormUser("partner.relationship", relationship);
          }
        }}
      />

    </View>
  )
}


export default AskIfInRelationshipForm