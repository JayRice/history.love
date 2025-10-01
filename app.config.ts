// app.config.ts
export default () => ({
  expo: {
    name: "history.love",
    slug: "historylove",
    owner: "jaydenrice",
    entryPoint: "./index.tsx",
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
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },

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
      usesCleartextTraffic: true
    },
    extra: {
      router: {},
      "eas": {
        "projectId": "bd3fcdab-b533-42b8-8275-54aee70ef587"
      },
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      locationIQKey: process.env.EXPO_PUBLIC_LOCATIONIQ_KEY,
      api_url: "http://10.0.2.2:5000"
    },
  },
});