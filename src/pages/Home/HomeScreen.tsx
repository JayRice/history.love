import React, { useEffect } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Calendar, BookOpen, Shield, User, Heart, Icon } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';
import { useGeneralStore } from '@/src/store/generalStore';
import PairScreen from '@/src/pages/Pair/PairScreen';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { useNotificationsStore } from '@/src/store/notificationsStore';
import markRead from '@/src/database/notifications/markRead';
import { Ionicons } from "@expo/vector-icons";
import { HorizontalScrollList } from '@/src/components/layout/HorizontalScrollList';



interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
                                                       title,
                                                       description,
                                                       icon,
                                                       color,
                                                       onPress,
                                                     }) => {
  const colors = useThemeColors();


  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-4" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-6">
          <View className="flex-row items-start">
            <View
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: color + '20' }}
            >
              {icon}
            </View>
            <View className="flex-1">
              <Text variant="titleMedium" className="text-gray-900 font-semibold mb-1">
                {title}
              </Text>
              <Text variant="bodyMedium" className="text-gray-600 leading-5">
                {description}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

function NavigationButtons({onPress} : {onPress}) {
  return (
    <Pressable onPress={() => onPress} className={"rounded-full h-8 w-h"}>

    </Pressable>
  )
}

export default function HomeScreen() {
  const user = useUserStore((state) => state.user);
  const colors = useThemeColors();

  const relationship = useRelationshipStore((state) => state.relationship)

  const didShowSubscription = useGeneralStore((state) => state.didShowSubscription);
  const setDidShowSubscription = useGeneralStore((state) => state.setDidShowSubscription);

  const didShowPairScreen = useGeneralStore((state) => state.didShowPairScreen)
  const setDidShowPairScreen = useGeneralStore((state) => state.setDidShowPairScreen)

  const notifications = useNotificationsStore(s => s.notifications);
  useEffect(() => {
    if (!relationship || !user ) return;
    let paired_notification =  notifications?.filter(n => n.type == "paired")[0];

    if ( paired_notification ){
      router.push("/pair_congratulations")
      markRead(user.id, paired_notification.id);
    }

  }, [user, relationship]);
  useEffect(() => {
    if ( user?.partner?.relationship != "single" && !relationship){
      router.push("/pair");
    }

    // Prompt user for subscription  when first logged in
    if (!didShowSubscription && user?.analytics?.num_logged_in && user.analytics.num_logged_in <= 1) {
      setTimeout(() => {
        setDidShowSubscription(true);
        router.push('/subscription')
      }, 1000)
    }
  }, []);

  const navigationButtonData = [
    {name: "Quizzes",

    }
  ]

  return (
    <Screen scrollable>
      <View className="mb-8">


        <View className="flex-row w-full justify-between items-center mb-2">
          <Text variant="headlineMedium" className="text-gray-900 font-bold">
            Home
          </Text>

          <View style={{backgroundColor: colors.card_surface}} className={"flex-row gap-1 px-2 py-1 rounded-lg justify-center items-center "}>
            <Ionicons name="flame" size={28} color="#ff5a1f" />
            <Text className={"font-bold"} variant={"bodyMedium"}>{user?.data?.streak || 0}</Text>
          </View>

        </View>
        <Text variant="bodyLarge" className="text-gray-600">
          Your relationship journey awaits. What would you like to explore today?
        </Text>

        {/*<HorizontalScrollList  data={items}*/}
        {/*                       renderItem={({ item }) => (*/}
        {/*                         <View*/}
        {/*                           style={{*/}
        {/*                             backgroundColor: "#333",*/}
        {/*                             padding: 20,*/}
        {/*                             borderRadius: 16,*/}
        {/*                             width: 120,*/}
        {/*                             alignItems: "center",*/}
        {/*                           }}*/}
        {/*                         >*/}
        {/*                           <Text style={{ color: "white" }}>{item.title}</Text>*/}
        {/*                         </View>*/}
        {/*                       )}/>*/}
      </View>

      <View>

      </View>

      <View className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent-pink/10 rounded-2xl">
        <Text variant="titleMedium" className="text-gray-900 font-semibold mb-2">
          💡 Did you know?
        </Text>
        <Text variant="bodyMedium" className="text-gray-700 leading-6">
          Studies show that couples who regularly reflect on their relationship together
          report higher satisfaction and stronger emotional bonds.
        </Text>
      </View>
    </Screen>
  );
}