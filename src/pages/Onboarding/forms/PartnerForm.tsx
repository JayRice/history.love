import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { TextField } from '@/src/components/inputs/TextField';
import BirthdayPicker from '@/src/components/inputs/BirthdayPicker';
import React from 'react';
import FormProps from '@/src/types/props/FormProps';


const PartnerForm = ({formUser, updateFormUser}: FormProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}>Tell me about your partner!</Text>


      <TextField
        label="Your Partner's name"
        value={formUser?.partner?.name ?? ""}
        onChangeText={(input) =>  updateFormUser("partner.name", input)}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
      />

      <View>
        <Text>When did you start dating: </Text>

        <BirthdayPicker date={formUser?.partner?.together_since ?? null} onChangeDate={(date) => {
          updateFormUser("partner.together_since", date);
        }}></BirthdayPicker>

      </View>



    </View>
  )
}


export default PartnerForm