import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/shared/ui/buttons/SecondaryButton';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { router } from 'expo-router';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';
import Logo from '@/assets/images/logo.svg';
import useLogin from '@/src/features/auth/hooks/useLogin';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formError, setFormError] = useState<string | null>(null)


  const colors = useThemeColors();




  const {login} = useLogin()
  console.log("logging in")




  const handleLogin = async () => {
    if (!email || !password) return;
    
    setSubmitLoading(true);
    const response = await login("email-login",email, password);

    if (!response.success) {
      setFormError(response.error)
      setSubmitLoading(false)
      return;
    }

    setSubmitLoading(false);
  };



  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <Screen safeArea={false} className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <BackButton onPress={() => router.replace("/start")}/>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-12">

          <Logo width={200} height={200}></Logo>

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
              loading={submitLoading}
              error={formError ?? ""}
              disabled={!email || !password}
              size="large"
            >
              Sign In
            </PrimaryButton>
          </View>
        </Card>

        <View className="mt-6 flex-row justify-center items-center">
          <Text variant="bodyMedium" className="text-gray-600">
            Don&apos;t have an account?{' '}
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