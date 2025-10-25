import React, { useEffect } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { Text, Card } from 'react-native-paper';
import {  Icon } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { useNotificationsStore } from '@/src/store/notificationsStore';
import { Ionicons } from "@expo/vector-icons";
import { HorizontalScrollList } from '@/src/components/layout/HorizontalScrollList';


import Questions from "@/assets/images/home-images/questions.svg"
import CalendarImage from "@/assets/images/home-images/calendar.svg"
import Trophy from "@/assets/images/home-images/trophy.svg"



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

function NavigationButton({title, children, onPress, style} : {title: string, children: React.ReactNode, onPress: () => void, style?: any}) {
  return (
    <View className={"flex gap-1 justify-center items-center"}>
      <Pressable style={[style]} onPress={onPress} className={"rounded-full w-14 h-14 p-2 flex justify-center items-center"}>
        {children}
      </Pressable>
      <Text className={"px-1"} variant={"bodySmall"}>{title}</Text>
    </View>

  )
}

export default function HomeScreen() {
  const user = useUserStore((state) => state.user);
  const colors = useThemeColors();

  const relationship = useRelationshipStore((state) => state.relationship)



  const notifications = useNotificationsStore(s => s.notifications);
  useEffect(() => {

  }, []);

  const navigationButtonData = [
    {
      id: "questions",
      icon: Questions,
      title: "Questions",
      onPress: () => router.push("/(tabs)/questions"),
      backgroundColor: colors.primaryAccent,
    },
    {
      id: "calender",
      icon: CalendarImage,
      title: "Calender",
      onPress: () => router.push("/(tabs)/calendar"),
      backgroundColor: colors.secondaryAccent,
    },
    {
      id: "games",
      icon: Trophy,
      title: "Games",
      onPress: () => router.push("/(tabs)/games"),
      backgroundColor: colors.secondaryAccent,


    },
    {
      id: "questions",
      icon: Questions,
      title: "Questions",
      onPress: () => router.push("/(tabs)/questions"),
      backgroundColor: colors.primaryAccent,
    },
    {
      id: "calender",
      icon: CalendarImage,
      title: "Calender",
      onPress: () => {router.push("/(tabs)/calendar")},
      backgroundColor: colors.secondaryAccent,
    },
    {
      id: "games",
      icon: Trophy,
      title: "Games",
      onPress: () => router.push("/(tabs)/games"),
      backgroundColor: colors.primaryAccent,


    },
    {
      id: "games",
      icon: Trophy,
      title: "Games",
      onPress: () => router.push("/(tabs)/games"),
      backgroundColor: colors.primaryAccent,


    }
  ]

  return (
    <Screen scrollable style={{flex: 1}}>
      <View className="mb-8">


        <View className={"py-8 px-4"}>
          <View className="flex-row w-full justify-between items-center mb-2 ">
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
        </View>



        <View className={"mt-8"}>
          <HorizontalScrollList horizontalSpacing={8}  data={navigationButtonData} renderItem={({ item }) => {
            const Icon = item.icon;
            return (
              <View>
                <NavigationButton  title={item.title} style={{backgroundColor: item.backgroundColor}} onPress={item.onPress}>
                  <Icon width={40} height={40} />
                </NavigationButton>
              </View>
            )
          }}/>
        </View>


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