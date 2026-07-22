import { View } from 'react-native';

import { LoadingSpinner } from '@/src/shared/ui/feedback/LoadingSpinner';
import Logo from '@/assets/images/logo.svg';


import {Screen} from "@/src/shared/ui/layout/Screen"


export default function Index() {


    return <Screen safeArea={true} className={"h-screen w-full items-center justify-center"}>
      <View className={"h-[]"}>
        <Logo width={200} height={200}></Logo>
        <LoadingSpinner  size={50} />
      </View>
    </Screen>

}