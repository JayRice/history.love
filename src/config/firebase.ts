import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import Constants from "expo-constants";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";


let firebaseConfig = {
  apiKey:  Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: "history-love-b75cd.firebaseapp.com",
  projectId: "history-love-b75cd",
  storageBucket: "history-love-b75cd.firebasestorage.app",
  messagingSenderId: "897003630021",
  appId: "1:897003630021:web:3cb5c2e22f40b9ed86afac",
  measurementId: "G-6G8S25R3F4"
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth =
  initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
export const db = getFirestore(app);
export const storage = getStorage(app);


export default app;