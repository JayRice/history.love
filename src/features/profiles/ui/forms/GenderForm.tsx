import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/shared/ui/inputs/ToggleButtons';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import FormProps from '@/src/shared/types/props/FormProps';


const GenderForm = ({formUser, updateFormUser}: FormProps) => {

  const [showOtherInput, setShowOtherInput] = useState<boolean>();
  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> What gender describes you best? </Text>

      <ToggleButtons selected={formUser?.profile?.gender ?? ""} parentClassName={"mt-10"} dict={{
        "female": "Female",
        "male": "Male",
        "non-binary": "Gender queer / Non-binary",
        "other": "Other",
      }} commands={{
        "default": (gender) => {
          setShowOtherInput(false)
          updateFormUser("profile.gender", gender)
        },
        "other": () => {
          updateFormUser("profile.gender", "")
          setShowOtherInput(true)
        }

      }}

      ></ToggleButtons>

      {showOtherInput && (
        <View>
          <TextField
            label="Your gender"
            value={formUser?.profile?.gender ?? ""}
            onChangeText={(input) =>  updateFormUser("profile.gender", input)}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
          ></TextField>
        </View>
      )}

    </View>
  )
}


export default  GenderForm