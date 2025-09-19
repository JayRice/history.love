import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, List, Divider } from 'react-native-paper';
import { Settings, Bell, Shield, Palette, User, CircleHelp as HelpCircle, Info, LogOut, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { ToggleField } from '@/src/components/inputs/ToggleField';
import { SecondaryButton } from '@/src/components/buttons/SecondaryButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { router } from 'expo-router';
import logout from '@/src/database/auth/logout';
import { useUserStore } from '@/src/store/userStore';

interface SettingItemProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  icon,
  onPress,
  rightElement,
}) => {
  const colors = useThemeColors();

  return (
    <List.Item
      title={title}
      description={description}
      left={() => (
        <View className="mr-3 justify-center">
          {icon}
        </View>
      )}
      right={() => 
        rightElement || (
          onPress ? <ChevronRight size={20} color={colors.onSurfaceVariant} /> : null
        )
      }
      onPress={onPress}
      style={{
        paddingVertical: 8,
      }}
    />
  );
};

export default function SettingsScreen() {

  const colors = useThemeColors();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const user = useUserStore(state => state.user)

  const handleLogout = async () => {
    if (logout){
      await logout();
    }
    router.replace('/(auth)/login');
  };

  return (
    <Screen scrollable>
      <SectionHeader title="Settings" />

      {/* Account Section */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-4">
          <Text variant="titleMedium" className="text-gray-900 font-semibold mb-4">
            Account
          </Text>
          
          <SettingItem
            title="Profile Information"
            description="Update your personal details and preferences"
            icon={<User size={24} color={colors.primary} />}
            onPress={() => router.push('/(app)/profile')}
          />

          <Divider className="my-2" />

          <SettingItem
            title="Privacy & Security"
            description="Manage your privacy settings and security options"
            icon={<Shield size={24} color={colors.secondary} />}
            onPress={() => console.log('Privacy settings')}
          />
        </Card.Content>
      </Card>

      {/* Preferences Section */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-4">
          <Text variant="titleMedium" className="text-gray-900 font-semibold mb-4">
            Preferences
          </Text>

          <ToggleField
            label="Push Notifications"
            description="Receive notifications about timeline events and journal reminders"
            value={notifications}
            onValueChange={setNotifications}
          />

          <Divider className="my-2" />

          <ToggleField
            label="Biometric Authentication"
            description="Use fingerprint or face ID to secure your app"
            value={biometrics}
            onValueChange={setBiometrics}
          />

          <Divider className="my-2" />

          <SettingItem
            title="Theme"
            description="Choose your preferred color scheme"
            icon={<Palette size={24} color="#FF9500" />}
            onPress={() => console.log('Theme settings')}
            rightElement={
              <View className="flex-row items-center">
                <Text variant="bodySmall" className="text-gray-600 mr-2">
                  Light
                </Text>
                <ChevronRight size={20} color={colors.onSurfaceVariant} />
              </View>
            }
          />
        </Card.Content>
      </Card>

      {/* Data & Privacy Section */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-4">
          <Text variant="titleMedium" className="text-gray-900 font-semibold mb-4">
            Data & Privacy
          </Text>

          <ToggleField
            label="Usage Analytics"
            description="Help improve the app by sharing anonymous usage data"
            value={analytics}
            onValueChange={setAnalytics}
          />

          <Divider className="my-2" />

          <SettingItem
            title="Export Data"
            description="Download a copy of your timeline and journal entries"
            icon={<Settings size={24} color={colors.onSurfaceVariant} />}
            onPress={() => console.log('Export data')}
          />

          <Divider className="my-2" />

          <SettingItem
            title="Delete Account"
            description="Permanently delete your account and all data"
            icon={<Settings size={24} color={colors.error} />}
            onPress={() => console.log('Delete account')}
          />
        </Card.Content>
      </Card>

      {/* Support Section */}
      <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-4">
          <Text variant="titleMedium" className="text-gray-900 font-semibold mb-4">
            Support
          </Text>

          <SettingItem
            title="Help & FAQ"
            description="Get answers to common questions"
            icon={<HelpCircle size={24} color="#34A853" />}
            onPress={() => console.log('Help & FAQ')}
          />

          <Divider className="my-2" />

          <SettingItem
            title="About History.love"
            description="App version, terms of service, and privacy policy"
            icon={<Info size={24} color={colors.onSurfaceVariant} />}
            onPress={() => console.log('About')}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <View className="mt-8">
        <SecondaryButton
          onPress={handleLogout}
          size="large"
          style={{ borderColor: colors.error }}
        >
          <View className="flex-row items-center">
            <LogOut size={20} color={colors.error} />
            <Text className="ml-2" style={{ color: colors.error }}>
              Sign Out
            </Text>
          </View>
        </SecondaryButton>
      </View>

      <View className="mt-6 items-center">
        <Text variant="bodySmall" className="text-gray-500">
          History.love v1.0.0
        </Text>
        <Text variant="bodySmall" className="text-gray-500 mt-1">
          Logged in as {user?.email}
        </Text>
      </View>
    </Screen>
  );
}