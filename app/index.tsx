import { useEffect, useState } from 'react';
import { View , Image} from 'react-native';
import { Card } from "react-native-paper";

import { Redirect, router } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import Logo from '@/assets/images/logo.svg';
import { useUserStore } from '@/src/store/userStore';

export default function Index() {

  const { authUser, authUserLoading } = useAuth();



  const [dataUserLoading, setDataUserLoading] = useState<boolean>(false);

  if (false) {
    return <View className="flex-1 w-screen h-screen bg-background justify-center items-center gap-2">
      <Card>
        <Logo width={64} height={64}></Logo>
        <LoadingSpinner />
      </Card>
    </View>
  }

  return <Redirect href={authUser ? "/home" : "/start"} />;

}