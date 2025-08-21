import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Heart } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { TextField } from '@/src/components/inputs/TextField';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/components/buttons/SecondaryButton';
import { useAuth } from '@/src/hooks/useAuth';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const colors = useThemeColors();

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    const success = await login(email, password);
    
    if (success) {
      router.replace('/(app)/home');
    }
    setLoading(false);
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <Screen safeArea={false} className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-12">
          <View className="bg-primary p-4 rounded-full mb-4">
            <Heart size={32} color="white" fill="white" />
          </View>
          <Text variant="headlineLarge" className="text-gray-900 font-bold">
            History.love
          </Text>
          <Text variant="bodyLarge" className="text-gray-600 text-center mt-2">
            Your relationship journey, beautifully documented
          </Text>
        </View>

        <Card className="p-6" style={{ backgroundColor: colors.surface }}>
          <Text variant="headlineSmall" className="text-gray-900 font-semibold mb-6 text-center">
            Welcome Back
          </Text>

          <View className="space-y-4">
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-8">
            <PrimaryButton
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password}
              size="large"
            >
              Sign In
            </PrimaryButton>
          </View>
        </Card>

        <View className="mt-6 flex-row justify-center">
          <Text variant="bodyMedium" className="text-gray-600">
            Don't have an account?{' '}
          </Text>
          <SecondaryButton
            variant="text"
            onPress={navigateToRegister}
            compact
          >
            Sign Up
          </SecondaryButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}