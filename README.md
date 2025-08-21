# History.love

A beautifully designed mobile app for documenting and exploring your relationship journey.

## Features

- **Relationship Timeline**: Interactive timeline to document relationship events, milestones, and memories
- **Journal & Reflections**: AI-powered journal with guided prompts for personal growth and relationship insights
- **Consent Verification**: Secure, timestamped consent records with biometric verification
- **Profile Management**: Comprehensive profile system with privacy controls
- **Modern Design**: Romantic color scheme with smooth animations and intuitive navigation

## Tech Stack

- **React Native** with **Expo SDK 52**
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS for React Native)
- **React Native Paper** for Material Design components
- **Expo Router** for file-based navigation
- **React Native Reanimated** for smooth animations
- **React Native Gesture Handler** for native gesture support

## Color Scheme

- **Primary**: Soft Rose (#E63946)
- **Secondary**: Deep Navy (#1D3557)
- **Background**: Off-white (#F8F9FA)
- **Accents**: Gold (#FFD700), Soft Pink (#F8BBD9)

## Project Structure

```
src/
├── contexts/          # React contexts (Auth)
├── pages/            # Screen components organized by feature
├── components/       # Reusable UI components
├── server/           # Placeholder API functions
├── theme/            # Theme configuration
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── assets/           # Static assets
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the Expo Go app on your device and scan the QR code

## Note

This is a frontend-only implementation with placeholder API functions. All data is mocked and stored locally using AsyncStorage. The app is designed to be mobile-only and includes comprehensive type definitions for future backend integration.