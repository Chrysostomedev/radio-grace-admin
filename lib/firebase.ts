// lib/firebase.ts - Configuration Firebase
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, onMessage, getToken, Messaging } from 'firebase/messaging';
import { firebaseConfig, firebaseVapidKey, isFirebaseConfigured } from '@/config/firebase-config';

// Vérifier que Firebase est configuré
if (!isFirebaseConfigured()) {
  console.error('❌ Firebase configuration incomplete - notifications will not work');
}

// Initialiser Firebase
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

/**
 * Obtenir le FCM Token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging not initialized');
      return null;
    }

    if (!firebaseVapidKey) {
      console.warn('⚠️ Firebase VAPID Key not configured');
      return null;
    }

    // Demander permission de notification
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return null;
    }

    // Obtenir le token
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
    });

    // Log only token prefix for security
    if (token) {
      console.log('✅ FCM Token obtained:', `${token.substring(0, 20)}...`);
    }
    return token;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

/**
 * Listener pour messages en foreground
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('📨 Message received in foreground:', payload);

    // Afficher notification personnalisée
    if (payload.notification) {
      const { title, body, image } = payload.notification;
      const options: NotificationOptions = {
        body,
        icon: image || '/icon-192x192.png',
        tag: payload.data?.type || 'notification',
        data: payload.data,
      };

      new Notification(title || 'Notification', options);
    }

    callback(payload);
  });
};

/**
 * Traiter le click sur notification
 */
export const handleNotificationClick = (callback: (data: any) => void) => {
  if (typeof window === 'undefined') return;

  // ServiceWorker envoie message au frontend
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIFICATION_CLICK') {
      console.log('👆 Notification clicked:', event.data.notification);
      callback(event.data.notification);
    }
  });
};

export { app, messaging };
