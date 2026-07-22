import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { TextField } from '@/src/shared/ui/inputs/TextField';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/shared/ui/buttons/SecondaryButton';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';
import Logo from '@/assets/images/logo.svg';
import signupWithEmail from '../data/legacy/signupWithEmail';
import { useGoogleLogin } from '@/src/features/auth/hooks/useGoogleLogin';
import { useToast } from '@/src/shared/ui/ToastProvider';

export default function RegisterScreen() {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formError, setFormError] = useState<string | null>(null)

  const setUserProperty = useUserStore((state) => state.setUserProperty);

  const [submitLoading, setSubmitLoading] = useState(false);

  const colors = useThemeColors();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const {email, password, confirmPassword } = formData;
    
    if (!email || !password) return;
    if (password !== confirmPassword) return;

    setSubmitLoading(true);
    const response = await signupWithEmail(email, password);


    if (!response.success){
      setFormError(response.error)
      setSubmitLoading(false)
      return;
    }


    setSubmitLoading(false);
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const toast = useToast();

  const { signInWithGoogle, googleLoading, googleError } = useGoogleLogin();


  const handleGoogleLogin = async () => {
    const userCred = await signInWithGoogle();
    if (userCred) {
      const user = userCred.user;

      const uid = user.uid;
      const email = user.email;
      const displayName = user.displayName;
      const photoURL = user.photoURL;

      if (!email || !displayName || !photoURL) {
        return toast("Google account is invalid, try again.")
      }
      setUserProperty("email", email);
      setUserProperty("name", displayName);
      setUserProperty("profileImage", {
        type: "google",
        url: photoURL
      })

      router.replace("/onboarding");
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && 
    formData.password === formData.confirmPassword;




  return (
    <Screen safeArea={false} scrollable className="bg-gradient-to-br from-primary/10 to-secondary/10">
      <BackButton onPress={() => router.replace("/start")}/>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6 py-12"
      >
        <View className="items-center mb-12">

          <Logo width={200} height={200}></Logo>
          <Text variant="bodyLarge" className="text-gray-600 text-center mt-2">
            Start documenting your love story
          </Text>
        </View>

        <Card className="p-6" style={{ backgroundColor: colors.surface }}>
          <Text variant="headlineSmall" className="text-gray-900 font-semibold mb-6 text-center">
            Create Account
          </Text>

          <View className="space-y-4">


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

          <View className="mt-8 space-y-4">
            <PrimaryButton
              onPress={handleRegister}
              loading={submitLoading}
              disabled={!isFormValid}
              error={formError!}
              size="large"
            >
              Create Account
            </PrimaryButton>
            <View className="relative w-full h-[1px] bg-gray-500 bg-opacity-30 my-4">
              <Text className="absolute text-xl -translate-x-6 left-1/2 -top-3 bg-white px-2 text-gray-600 transform -translate-x-1/2">
                OR
              </Text>
            </View>


            <PrimaryButton
              onPress={handleGoogleLogin}
              error={googleError ?? ""}
              loading={googleLoading}
              size="large"
            >
              <Text className={"text-white"}> Continue with Google</Text>
            </PrimaryButton>
          </View>
        </Card>

        <View className="mt-6 flex-row justify-center items-center">
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