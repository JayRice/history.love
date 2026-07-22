export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  age: number;
  location: string;
  profileImage?: string;
  isPublic: boolean;
  relationshipStatus: 'single' | 'dating' | 'in-relationship' | 'married' | 'complicated';
  interests: string[];
  preferences: ProfilePreferences;
  privacy: PrivacySettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePreferences {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number;
  lookingFor: 'casual' | 'serious' | 'friends' | 'anything';
  dealBreakers: string[];
}

export interface PrivacySettings {
  showAge: boolean;
  showLocation: boolean;
  showLastSeen: boolean;
  allowMessages: 'everyone' | 'matches' | 'nobody';
  profileVisibility: 'public' | 'private' | 'friends';
}