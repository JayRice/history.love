// app.config.ts
export default () => ({
  expo: {
    name: "history.love",
    slug: "historylove",
    owner: "jaydenrice",
    // Entry is expo-router/entry via package.json "main"; the router
    // resolves the route tree from src/app (root app/ was moved there).
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,

      infoPlist: {
        NSCameraUsageDescription: "Allow taking a profile photo.",
        NSPhotoLibraryUsageDescription: "Allow choosing a profile photo.",
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router", "expo-font", "expo-web-browser",  "expo-audio", "expo-video"],
    experiments: {
      typedRoutes: true,
    },

    android: {
      package: "com.historylove.app",
    },
    extra: {
      router: {},
      "eas": {
        "projectId": "bd3fcdab-b533-42b8-8275-54aee70ef587"
      },
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      // Set EXPO_PUBLIC_API_URL in .env.local (see .env.example).
      // Validated at app startup by src/config/env.ts.
      api_url: process.env.EXPO_PUBLIC_API_URL
    },
  },
});