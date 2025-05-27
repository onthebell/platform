import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// // Connect to emulators in development
// if (process.env.NODE_ENV === 'development') {
//   // Only connect if not already connected
//   if (!auth.app.automaticDataCollectionEnabled) {
//     try {
//       connectAuthEmulator(auth, 'http://localhost:9099');
//     } catch (error) {
//       // Emulator already connected or not available
//     }
//   }
  
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     // Emulator already connected or not available
//   }
  
//   try {
//     connectStorageEmulator(storage, 'localhost', 9199);
//   } catch (error) {
//     // Emulator already connected or not available
//   }
// }

export default app;
