import { View } from 'react-native';
import { Text } from 'react-native-paper';

import React, { useEffect } from 'react';
import PinInput from '@/src/shared/ui/inputs/PinInput';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { useUserStore } from '@/src/store/userStore';
import getMatchCode from '../data/legacy/getMatchCode';
import TapToCopy from '@/src/shared/ui/inputs/TapToCopy';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import pairUsers from '../data/legacy/pairUsers';
import { isValidMatchCode } from '@/src/features/relationships/domain/isValidMatchCode';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { CloseButton } from '@/src/shared/ui/buttons/CloseButton';
import { router } from 'expo-router';
import { SecondaryButton } from '@/src/shared/ui/buttons/SecondaryButton';


export default function PairScreen ()  {

  const colors = useThemeColors();

  const [pinValue, setPinValue] = React.useState<string>('');

  const [isPairing, setIsPairing] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);



  useEffect(() => {

    asyncGetMatchCode()
    async function asyncGetMatchCode(){
      if (user && !user?.profile?.match_code){
        console.log("gettting match code")
        setLoading(true);
        await getMatchCode();
        setLoading(false)
      }
    }

  }, []);
  const first_name = user?.partner?.name?.trim().split(" ")[0] ?? "my partner"
  return (
    <Screen className={"relative"} backgroundColor={colors.surface} padding>

      <CloseButton position={"right"} onPress={() => {
        router.back()
      }}></CloseButton>
      <View className={"relative w-full h-full space-y-4"}>

        <Text variant={"displaySmall"} className={"font-bold"}>Pair with {user?.partner?.relationship != "single" ? first_name:"your Partner"}</Text>

        <Text variant={"bodyLarge"} className={"font-light"}>Share your pin code or ask them for theirs!</Text>

        <View  style={{backgroundColor: colors.secondaryAccent2 ?? "", gap: 8}} className={"relative w-full text-white flex flex-col justify-center p-4 "}>

          <Text variant={"headlineSmall"} className={"font-bold "}>I want to invite {first_name}</Text>

          <View className={"flex flex-row items-center"} style={{gap: 4}}>
            <Text variant={'bodySmall'} className={""}>Your code: </Text>

            { user?.profile?.match_code && <TapToCopy text={user?.profile?.match_code}></TapToCopy>}
          </View>


          <PinInput disabled loading={loading}  length={6} value={user?.profile?.match_code ?? "000000"} ></PinInput>

          <SecondaryButton variant={"filled"} onPress={() => {

          }}>Share your invite code</SecondaryButton>

          <View  style={{
            backgroundColor: colors.background,
            transform: [{ translateY: '50%' }, {translateX:'-25%'}]
          }} className={"absolute left-1/2 bottom-0 mt-2  p-4 rounded-full z-50"}>
            <Text>OR</Text>
          </View>
        </View>

        <View style={{backgroundColor: colors.primaryAccent2 ?? "", gap: 8}} className={"relative w-full text-white flex justify-center p-4 "}>
          <Text variant={"headlineSmall"} className={"font-bold"}>I have a code from {first_name} </Text>

          <PinInput   length={6} value={pinValue}  setValue={setPinValue}></PinInput>


          <PrimaryButton loading={isPairing} disabled={!isValidMatchCode(pinValue)} onPress={async () => {


            setIsPairing(true)
            const response = await pairUsers(pinValue)
            setIsPairing(false)

            if (response.success){
              router.replace("/pair_congratulations")
            }
          }}>Pair</PrimaryButton>
        </View>

      </View>
    </Screen>
  )
}


