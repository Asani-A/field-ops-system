import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence, 
  Auth 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth conditionally based on Platform
let auth: Auth;

if (Platform.OS === 'web') {
  // If running in browser (Expo Web), use standard browser storage
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  // If running on iOS/Android, use Native Async Storage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);
