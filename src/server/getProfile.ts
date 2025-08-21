import { Profile } from '@/src/types';

// Placeholder API function for getting user profile
export default async function getProfile(userId: string) {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));

  // Mock profile data
  const profile: Profile = {
    id: '1',
    userId: userId,
    displayName: 'Demo User',
    bio: 'Love is not about finding the perfect person, but learning to see an imperfect person perfectly ✨',
    age: 28,
    location: 'San Francisco, CA',
    profileImage: undefined,
    isPublic: true,
    relationshipStatus: 'in-relationship',
    interests: ['Travel', 'Photography', 'Cooking', 'Hiking', 'Music', 'Art'],
    preferences: {
      ageRange: { min: 25, max: 35 },
      maxDistance: 25,
      lookingFor: 'serious',
      dealBreakers: ['Smoking', 'No long-term goals'],
    },
    privacy: {
      showAge: true,
      showLocation: false,
      showLastSeen: true,
      allowMessages: 'matches',
      profileVisibility: 'public',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  };

  return {
    success: true,
    data: profile,
  };
}