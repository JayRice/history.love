import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Avatar, Divider } from 'react-native-paper';
import { CreditCard as Edit3, MapPin, Heart, Users, Eye, EyeOff } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/components/buttons/SecondaryButton';
import { ToggleField } from '@/src/components/inputs/ToggleField';
import { useAuth } from '@/src/contexts/AuthContext';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useUserStore } from '@/src/store/userStore';
import getAgeFromDate from '@/src/logic/getAgeFromDate';

export default function ProfileScreen() {
  const user = useUserStore((state) => state.user)
  const colors = useThemeColors();
  const [isPublic, setIsPublic] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [showLocation, setShowLocation] = useState(false);



  // Mock profile data
  const profileData = {
    displayName: `${user?.profile?.first_name} ${user?.profile?.last_name}`,
    bio: "Love is not about finding the perfect person, but learning to see an imperfect person perfectly ✨",
    age: getAgeFromDate(user?.profile?.birthday ?? new Date()),
    location: "San Francisco, CA",
    relationshipStatus: 'in-relationship',
    interests: ['Travel', 'Photography', 'Cooking', 'Hiking', 'Music'],
    joinedDate: user?.analytics?.created_at,
  };

  const relationshipStats = [
    { label: 'Relationships', value: '3', icon: <Heart size={16} color={colors.primary} /> },
    { label: 'Timeline Events', value: '24', icon: <Users size={16} color={colors.secondary} /> },
    { label: 'Journal Entries', value: '47', icon: <Edit3 size={16} color="#FF9500" /> },
  ];

  return (
    <Screen scrollable>
      <SectionHeader 
        title="Profile"
        rightElement={
          <SecondaryButton variant="text" size="small">
            Edit
          </SecondaryButton>
        }
      />

      {/* Profile Header */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-6">
          <View className="items-center">
            <Avatar.Text 
              size={80} 
              label={`${user?.profile?.first_name?.[0]}${user?.profile?.last_name?.[0]}`}
              style={{ backgroundColor: colors.primary }}
            />
            <Text variant="headlineSmall" className="text-gray-900 font-semibold mt-4">
              {profileData.displayName}
            </Text>
            <View className="flex-row items-center mt-2">
              <Text variant="bodyMedium" className="text-gray-600">
                {profileData.age} • 
              </Text>
              <MapPin size={14} color={colors.onSurfaceVariant} className="mx-1" />
              <Text variant="bodyMedium" className="text-gray-600">
                {profileData.location}
              </Text>
            </View>
            <Text variant="bodyMedium" className="text-center mt-4 text-gray-700 leading-6">
              {profileData.bio}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Stats */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-6">
          <View className="flex-row justify-between">
            {relationshipStats.map((stat, index) => (
              <View key={index} className="items-center flex-1">
                <View className="flex-row items-center mb-2">
                  {stat.icon}
                  <Text variant="headlineSmall" className="text-gray-900 font-bold ml-2">
                    {stat.value}
                  </Text>
                </View>
                <Text variant="bodySmall" className="text-gray-600 text-center">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Privacy Settings */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-6">
          <View className="flex-row items-center mb-4">
            {isPublic ? (
              <Eye size={20} color={colors.primary} />
            ) : (
              <EyeOff size={20} color={colors.onSurfaceVariant} />
            )}
            <Text variant="titleMedium" className="text-gray-900 font-semibold ml-2">
              Privacy Settings
            </Text>
          </View>

          <ToggleField
            label="Public Profile"
            description="Allow others to discover your profile"
            value={isPublic}
            onValueChange={setIsPublic}
          />

          <Divider className="my-2" />

          <ToggleField
            label="Show Age"
            description="Display your age on your profile"
            value={showAge}
            onValueChange={setShowAge}
          />

          <Divider className="my-2" />

          <ToggleField
            label="Show Location"
            description="Display your location to other users"
            value={showLocation}
            onValueChange={setShowLocation}
          />
        </Card.Content>
      </Card>

      {/* Interests */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-6">
          <Text variant="titleMedium" className="text-gray-900 font-semibold mb-4">
            Interests
          </Text>
          <View className="flex-row flex-wrap">
            {profileData.interests.map((interest, index) => (
              <View 
                key={index}
                className="bg-primary/10 px-3 py-2 rounded-full mr-2 mb-2"
              >
                <Text variant="bodySmall" style={{ color: colors.primary }} className="font-medium">
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Relationship History Preview */}
      <Card style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="titleMedium" className="text-gray-900 font-semibold">
              Relationship History
            </Text>
            <SecondaryButton variant="text" size="small">
              View All
            </SecondaryButton>
          </View>
          <Text variant="bodyMedium" className="text-gray-600 mb-4">
            A timeline of your meaningful connections and personal growth
          </Text>
          <PrimaryButton variant="outlined" size="small">
            Manage Timeline
          </PrimaryButton>
        </Card.Content>
      </Card>
    </Screen>
  );
}