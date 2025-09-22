import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Calendar, BookOpen, Shield, User, Heart } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';
import { useGeneralStore } from '@/src/store/generalStore';
import PairScreen from '@/src/pages/Pair/PairScreen';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';


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

export default function HomeScreen() {
  const user = useUserStore((state) => state.user);
  const colors = useThemeColors();

  const relationship = useRelationshipStore((state) => state.relationship)

  const didShowSubscription = useGeneralStore((state) => state.didShowSubscription);
  const setDidShowSubscription = useGeneralStore((state) => state.setDidShowSubscription);

  const didShowPairScreen = useGeneralStore((state) => state.didShowPairScreen)
  const setDidShowPairScreen = useGeneralStore((state) => state.setDidShowPairScreen)

  useEffect(() => {


    console.log("relationship: ", relationship)
    if ( user?.partner?.relationship != "single" && !relationship){
      setDidShowPairScreen(true);
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

  const dashboardItems = [
    {
      title: 'Relationship Timeline',
      description: 'Document and explore your relationship journey with interactive timelines',
      icon: <Calendar size={24} color={colors.primary} />,
      color: colors.primary,
      onPress: () => router.push('/(app)/timeline'),
    },
    {
      title: 'Journal & Reflections',
      description: 'Capture thoughts, feelings, and memories with AI-powered prompts',
      icon: <BookOpen size={24} color="#FF9500" />,
      color: '#FF9500',
      onPress: () => router.push('/(app)/journal'),
    },
    {
      title: 'Consent Verification',
      description: 'Secure, timestamped consent records for important moments',
      icon: <Shield size={24} color="#34A853" />,
      color: '#34A853',
      onPress: () => router.push('/consent'),
    },
    {
      title: 'Profile & Privacy',
      description: 'Manage your profile, privacy settings, and relationship status',
      icon: <User size={24} color={colors.secondary} />,
      color: colors.secondary,
      onPress: () => router.push('/(app)/profile'),
    },
  ];

  return (
    <Screen scrollable>
      <View className="mb-8">
        <PrimaryButton onPress={() => router.push("/pair")}>/pair</PrimaryButton>
        <PrimaryButton onPress={() => router.push("/pair_congratulations")}>/pair-congratulations</PrimaryButton>


        <View className="flex-row items-center mb-2">
          <Heart size={24} color={colors.primary} fill={colors.primary} className="mr-2" />
          <Text variant="headlineMedium" className="text-gray-900 font-bold">
            Welcome back, {user?.profile?.first_name}
          </Text>
        </View>
        <Text variant="bodyLarge" className="text-gray-600">
          Your relationship journey awaits. What would you like to explore today?
        </Text>
      </View>

      <View>
        {dashboardItems.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            color={item.color}
            onPress={item.onPress}
          />
        ))}
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