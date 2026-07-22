import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import DatePicker from '@/src/shared/ui/inputs/DatePicker';
import React from 'react';
import FormProps from '@/src/shared/types/props/FormProps';

const AboutForm = ({formUser, updateFormUser}: FormProps) => {

  return (
    <View className={"w-full h-full space-y-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> Tell us a little about yourself </Text>


      <TextField
        label="Your fist name"
        value={formUser?.profile?.first_name ?? ""}
        onChangeText={(input) => {
          const sanitized = input.replace(/[0-9]/g, "");
          updateFormUser("profile.first_name", sanitized)
        }}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
      />

      <TextField
        label="Your last name"
        value={formUser?.profile?.last_name ?? ""}
        onChangeText={(input) => {
          const sanitized = input.replace(/[0-9]/g, "");
          updateFormUser("profile.last_name", sanitized)
        }}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={50}
      />

      <View>
        <Text>Your Birthday: </Text>

        <DatePicker maximumDate={new Date()} date={formUser?.profile?.birthday ?? null}  onChangeDate={(date) => {
          updateFormUser("profile.birthday", date);
        }}></DatePicker>

      </View>


    </View>
  )
}


export default AboutForm;