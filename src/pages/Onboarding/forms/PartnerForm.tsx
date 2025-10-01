import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { TextField } from '@/src/components/inputs/TextField';
import DatePicker from '@/src/components/inputs/DatePicker';
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

        <DatePicker date={formUser?.partner?.together_since ?? null} onChangeDate={(date) => {
          updateFormUser("partner.together_since", date);
        }}></DatePicker>

      </View>



    </View>
  )
}


export default PartnerForm