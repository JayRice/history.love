export interface ConsentRecord {
  id: string;
  userId: string;
  partnerId?: string;
  consentType: 'meeting' | 'intimacy' | 'relationship' | 'data-sharing';
  isConsenting: boolean;
  verificationMethod: 'digital-signature' | 'biometric' | 'voice' | 'video';
  ageVerified: boolean;
  sobrietyConfirmed: boolean;
  freeWillConfirmed: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: string;
  biometricData?: {
    fingerprintHash?: string;
    faceIdHash?: string;
    voiceSignature?: string;
  };
  witnesses?: string[];
  notes?: string;
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentVerificationForm {
  isEighteenPlus: boolean;
  isSober: boolean;
  isFreewill: boolean;
  biometricConsent: boolean;
  dataProcessingConsent: boolean;
  locationConsent: boolean;
}