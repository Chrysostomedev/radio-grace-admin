// config/firebase-config.ts
// Configuration centralisée Firebase - Importe les variables d'env

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

export const firebaseDatabaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '';

// Validation
export const isFirebaseConfigured = (): boolean => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
  
  const allConfigured = required.every((key) => {
    const value = firebaseConfig[key];
    return value && value.length > 0 && value !== 'AIzaSyD...';
  });

  const vapidConfigured = firebaseVapidKey && firebaseVapidKey.length > 0 && firebaseVapidKey !== 'BMx...';

  return allConfigured && vapidConfigured;
};

// Log errors if not configured properly
if (typeof window !== 'undefined') {
  if (!isFirebaseConfigured()) {
    console.warn(
      '⚠️ Firebase is not properly configured. Please check your .env file and ensure all variables are set.'
    );
  }
}

export default firebaseConfig;
