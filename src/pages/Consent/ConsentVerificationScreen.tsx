import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, Divider, IconButton  } from 'react-native-paper';
import { Shield, MapPin, Clock, Fingerprint, Mic } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { ToggleField } from '@/src/components/inputs/ToggleField';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/src/components/buttons/SecondaryButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ConsentVerificationForm } from '@/src/types/Consent';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import { router } from 'expo-router';

export default function ConsentVerificationScreen() {
  const [form, setForm] = useState<ConsentVerificationForm>({
    isEighteenPlus: false,
    isSober: false,
    isFreewill: false,
    biometricConsent: false,
    dataProcessingConsent: false,
    locationConsent: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const colors = useThemeColors();

  const updateForm = (field: keyof ConsentVerificationForm, value: boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Mock consent verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success and navigate back
      alert('Consent verification completed successfully');
    } catch (error) {
      console.error('Failed to create consent record:', error);
      alert('Failed to create consent record');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.isEighteenPlus && form.isSober && form.isFreewill;
      case 2:
        return form.dataProcessingConsent && form.locationConsent;
      case 3:
        return form.biometricConsent;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
      <Card.Content className="p-6">
        <View className="items-center mb-6">
          <View className="bg-primary/10 p-4 rounded-full mb-4">
            <Shield size={32} color={colors.primary} />
          </View>
          <Text variant="headlineSmall" className="text-gray-900 font-semibold text-center">
            Consent Verification
          </Text>
          <Text variant="bodyMedium" className="text-gray-600 text-center mt-2">
            Please confirm your eligibility and consent
          </Text>
        </View>

        <ToggleField
          label="I am 18 years of age or older"
          description="You must be 18+ to proceed"
          value={form.isEighteenPlus}
          onValueChange={(value) => updateForm('isEighteenPlus', value)}
        />

        <Divider className="my-4" />

        <ToggleField
          label="I am sober and of sound mind"
          description="You are not under the influence of substances"
          value={form.isSober}
          onValueChange={(value) => updateForm('isSober', value)}
        />

        <Divider className="my-4" />

        <ToggleField
          label="I am acting of my own free will"
          description="You are not being coerced or pressured"
          value={form.isFreewill}
          onValueChange={(value) => updateForm('isFreewill', value)}
        />
      </Card.Content>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
      <Card.Content className="p-6">
        <View className="items-center mb-6">
          <View className="bg-secondary/10 p-4 rounded-full mb-4">
            <MapPin size={32} color={colors.secondary} />
          </View>
          <Text variant="headlineSmall" className="text-gray-900 font-semibold text-center">
            Privacy & Data
          </Text>
          <Text variant="bodyMedium" className="text-gray-600 text-center mt-2">
            Grant permissions for verification
          </Text>
        </View>

        <ToggleField
          label="Data Processing Consent"
          description="Allow processing of your consent data for verification purposes"
          value={form.dataProcessingConsent}
          onValueChange={(value) => updateForm('dataProcessingConsent', value)}
        />

        <Divider className="my-4" />

        <ToggleField
          label="Location Access"
          description="Record your location for this consent verification"
          value={form.locationConsent}
          onValueChange={(value) => updateForm('locationConsent', value)}
        />

        <View className="mt-6 p-4 bg-amber-50 rounded-lg">
          <Text variant="bodySmall" className="text-amber-800">
            📍 Your location and timestamp will be securely recorded to provide legal validity to this consent record.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="mb-6" style={{ backgroundColor: colors.surface }}>
      <Card.Content className="p-6">
        <View className="items-center mb-6">
          <View className="bg-green-100 p-4 rounded-full mb-4">
            <Fingerprint size={32} color="#34A853" />
          </View>
          <Text variant="headlineSmall" className="text-gray-900 font-semibold text-center">
            Biometric Verification
          </Text>
          <Text variant="bodyMedium" className="text-gray-600 text-center mt-2">
            Complete verification with biometric data
          </Text>
        </View>

        <ToggleField
          label="Biometric Verification Consent"
          description="Allow fingerprint or face ID verification for this consent record"
          value={form.biometricConsent}
          onValueChange={(value) => updateForm('biometricConsent', value)}
        />

        <Divider className="my-4" />

        <View className="space-y-4">
          <View className="flex-row items-center p-4 bg-gray-50 rounded-lg">
            <Fingerprint size={24} color={colors.onSurfaceVariant} />
            <View className="ml-3 flex-1">
              <Text variant="bodyMedium" className="text-gray-900 font-medium">
                Fingerprint Scan
              </Text>
              <Text variant="bodySmall" className="text-gray-600">
                Ready to authenticate
              </Text>
            </View>
          </View>

          <View className="flex-row items-center p-4 bg-gray-50 rounded-lg">
            <Mic size={24} color={colors.onSurfaceVariant} />
            <View className="ml-3 flex-1">
              <Text variant="bodyMedium" className="text-gray-900 font-medium">
                Voice Signature
              </Text>
              <Text variant="bodySmall" className="text-gray-600">
                "I consent to this verification"
              </Text>
            </View>
          </View>

          <View className="flex-row items-center p-4 bg-gray-50 rounded-lg">
            <Clock size={24} color={colors.onSurfaceVariant} />
            <View className="ml-3 flex-1">
              <Text variant="bodyMedium" className="text-gray-900 font-medium">
                Timestamp
              </Text>
              <Text variant="bodySmall" className="text-gray-600">
                {new Date().toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 p-4 bg-green-50 rounded-lg">
          <Text variant="bodySmall" className="text-green-800">
            🔒 All biometric data is encrypted and stored securely. This information is used solely for consent verification purposes.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Screen safeArea scrollable>

      <View className={"absolute right-0 top-0 m-2 z-10"}>
        <CloseButton onPress={() => router.push("/") } />

      </View>


      <SectionHeader 
        title="Consent Verification"
        subtitle={`Step ${currentStep} of 3`}
      />


      {/* Progress Indicator */}
      <View className="flex-row mb-6 z-10">
        {[1, 2, 3].map((step) => (
          <View key={step} className="flex-1 flex-row items-center">
            <View 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step < currentStep ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <Text 
                variant="bodySmall" 
                className={step <= currentStep ? 'text-white font-semibold' : 'text-gray-600'}
              >
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View 
                className={`flex-1 h-1 mx-2 ${
                  step < currentStep ? 'bg-red-600' : 'bg-gray-300'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation Buttons */}
      <View className="flex-row space-x-4 mt-6">
        {currentStep > 1 && (
          <View className="flex-1">
            <SecondaryButton onPress={handleBack} size="large">
              Back
            </SecondaryButton>
          </View>
        )}
        <View className="flex-1">
          <PrimaryButton
            onPress={handleNext}
            disabled={!canProceed()}
            loading={loading}
            size="large"
          >
            {currentStep === 3 ? 'Complete Verification' : 'Continue'}
          </PrimaryButton>
        </View>
      </View>
    </Screen>
  );
}