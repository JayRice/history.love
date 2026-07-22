import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/shared/ui/inputs/ToggleButtons';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import FormProps from '@/src/shared/types/props/FormProps';

const RelationshipForm = ({formUser, updateFormUser}: FormProps) => {

  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  let partnerName = formUser?.partner?.name?.split(" ")[0] ?? "Your Partner";

  if (formUser?.partner?.name) {
    partnerName = partnerName[0].toUpperCase().trim() + partnerName.substring(1);
  }
  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text  variant={"displaySmall"} className={"font-bold mb-4"}> {`Which best describes your relationship with ${partnerName}?`} </Text>



      <ToggleButtons scrollable={true} selected={formUser?.partner?.relationship ?? ""} parentClassName={""} dict={{
        "in-relationship": "I'm in a relationship",
        "engaged": "I'm engaged",
        "married": "I'm married",
        "civil-partnership": "I'm in a civil partnership",
        "situation": "It's complicated"
      }} commands={{
        "default": (gender) => {
          setShowOtherInput(false)
          updateFormUser("partner.relationship", gender)
        }
      }}

      ></ToggleButtons>


      {showOtherInput && (
        <View>
          <TextField
            label="Your gender"
            value={formUser?.partner?.relationship ?? ""}
            onChangeText={(input) =>  updateFormUser("partner.relationship", input)}
            autoCapitalize="words"
            autoCorrect={false}
          ></TextField>
        </View>
      )}


    </View>
  )
}

export default  RelationshipForm