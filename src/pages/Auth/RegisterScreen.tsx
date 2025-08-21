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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const colors = useThemeColors();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, username, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !username || !email || !password) return;
    if (password !== confirmPassword) return;
    
    setLoading(true);
    const success = await register({ firstName, lastName, username, email, password });
    
    if (success) {
      router.replace('/(app)/home');
    }
    setLoading(false);
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && 
    formData.password === formData.confirmPassword;

  return (
    <Screen safeArea={false} scrollable className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6 py-12"
      >
        <View className="items-center mb-8">
          <View className="bg-primary p-4 rounded-full mb-4">
            <Heart size={32} color="white" fill="white" />
          </View>
          <Text variant="headlineLarge" className="text-gray-900 font-bold">
            History.love
          </Text>
          <Text variant="bodyLarge" className="text-gray-600 text-center mt-2">
            Start documenting your love story
          </Text>
        </View>

        <Card className="p-6" style={{ backgroundColor: colors.surface }}>
          <Text variant="headlineSmall" className="text-gray-900 font-semibold mb-6 text-center">
            Create Account
          </Text>

          <View className="space-y-4">
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                />
              </View>
            </View>

            <TextField
              label="Username"
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextField
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextField
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
            />

            <TextField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
            />
          </View>

          <View className="mt-8">
            <PrimaryButton
              onPress={handleRegister}
              loading={loading}
              disabled={!isFormValid}
              size="large"
            >
              Create Account
            </PrimaryButton>
          </View>
        </Card>

        <View className="mt-6 flex-row justify-center">
          <Text variant="bodyMedium" className="text-gray-600">
            Already have an account?{' '}
          </Text>
          <SecondaryButton
            variant="text"
            onPress={navigateToLogin}
            compact
          >
            Sign In
          </SecondaryButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}