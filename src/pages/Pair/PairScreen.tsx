import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

import React, { useEffect } from 'react';
import PinInput from '@/src/components/inputs/PinInput';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useUserStore } from '@/src/store/userStore';
import getMatchCode from '@/src/server/getMatchCode';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import TapToCopy from '@/src/components/inputs/TapToCopy';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import pairUsers from '@/src/server/pairUsers';
import { isValidMatchCode } from '@/src/logic/isValidMatchCode';
import { Screen } from '@/src/components/layout/Screen';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import { router } from 'expo-router';
export default function PairScreen ()  {

  const colors = useThemeColors();

  const [pinValue, setPinValue] = React.useState<string>('');

  const [isPairing, setIsPairing] = React.useState(false);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    console.log("match code: ", user?.profile?.match_code)
  }, []);
  useEffect(() => {

    asyncGetMatchCode()
    async function asyncGetMatchCode(){
      if (user && !user?.profile?.match_code){
        const match_code = await getMatchCode();
        console.log("got match code: ", match_code);
        setUser({
          ...user,
          profile: {
            ...user.profile,
            match_code,
          },
        });
      }
    }

  }, [user?.profile?.match_code]);
  return (
    <Screen className={"relative"} backgroundColor={colors.surface} padding>

      <CloseButton position={"right"} onPress={() => {
        router.back()
      }}></CloseButton>
      <View className={"relative w-full h-full space-y-4"}>

        <Text variant={"displaySmall"} className={"font-bold"}>Pair with your Partner</Text>

        <Text variant={"bodyLarge"} className={"font-light"}>Share your pin code or ask them for theirs!</Text>

        <View style={{backgroundColor: colors.secondaryAccent2}} className={"relative w-full text-white flex flex-col justify-center p-4 "}>

          <Text variant={"headlineSmall"} className={"font-bold text-center"}>I want to invite {user?.partner?.name?.split(" ")[0]}</Text>

          <Text variant={'bodySmall'} className={"m-1"}>Tap to copy</Text>

          { user?.profile?.match_code && <TapToCopy text={user?.profile?.match_code}></TapToCopy>}

          <PinInput disabled  length={6} value={user?.profile?.match_code ?? "000000"} ></PinInput>

          <View  style={{
            backgroundColor: colors.background,
            transform: [{ translateY: '50%' }, {translateX:'-25%'}]
          }} className={"absolute left-1/2 bottom-0 mt-2  p-4 rounded-full z-50"}>
            <Text>OR</Text>
          </View>
        </View>

        <View style={{backgroundColor: colors.primaryAccent2}} className={"relative w-full text-white flex justify-center p-4 "}>
          <Text variant={"headlineSmall"} className={"font-bold text-center"}>I have a code from {user?.partner?.name?.split(" ")[0]} </Text>

          <PinInput   length={6} value={pinValue}  setValue={setPinValue}></PinInput>


          <PrimaryButton disabled={!isValidMatchCode(pinValue)} onPress={async () => {


            const response = await pairUsers(pinValue)

            console.log("response", response)

          }}>Pair</PrimaryButton>
        </View>

      </View>
    </Screen>
  )
}


