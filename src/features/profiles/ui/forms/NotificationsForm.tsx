import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import React from 'react';
import FormProps from '@/src/shared/types/props/FormProps';


const NotificationsForm = ({formUser, updateFormUser}: FormProps) => {

  let partnerName = formUser?.partner?.name?.split(" ")[0] ?? "Your Partner";

  if (formUser?.partner?.name) {
    partnerName = partnerName[0].toUpperCase().trim() + partnerName.substring(1);
  }
  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Card.Cover className={""}  style={{ width: "100%", height: "60%" }}
                  resizeMode="cover" source={require("@/assets/images/photos/couple2.jpg")} />
      <View >
        <Text variant={"displaySmall"} className={"font-bold mb-4 text-center"}> {`Recieve notifications from ${partnerName}`}? </Text>

        <Text variant={"bodyLarge"} className={"mb-10 text-center"}>We&apos;ll send you notifcations whenever your partner does something`.</Text>

      </View>





    </View>
  )
}


export default  NotificationsForm