// public/firebase-messaging-sw.js
// Service Worker pour Firebase Cloud Messaging
// Configuration injectée depuis le client via window.__FIREBASE_CONFIG__

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Variables globales
let firebaseConfig = null;
let messaging = null;
let initialized = false;

// Helper pour attendre la configuration (5 secondes max)
const waitForConfig = (maxAttempts = 50) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkConfig = () => {
      // Vérifier si config est disponible
      if (typeof self !== 'undefined' && self.__FIREBASE_CONFIG__) {
        firebaseConfig = self.__FIREBASE_CONFIG__;
        console.log('[SW] ✅ Config reçue:', {
          projectId: firebaseConfig?.projectId,
          hasMsgSenderId: !!firebaseConfig?.messagingSenderId,
        });
        resolve(firebaseConfig);
        return;
      }
      
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkConfig, 100);
      } else {
        console.warn('[SW] ⚠️ Config not available après 5s');
        reject(new Error('Firebase config not available after 5s'));
      }
    };
    
    checkConfig();
  });
};

// Initialiser Firebase quand le config est disponible
waitForConfig()
  .then((config) => {
    try {
      firebase.initializeApp(config);
      messaging = firebase.messaging();
      console.log('[SW] ✅ Firebase initialized with config');
      initialized = true;
    } catch (error) {
      console.error('[SW] ❌ Error initializing Firebase:', error);
    }
  })
  .catch((error) => {
    console.warn('[SW] ⚠️ Config wait timeout:', error.message);
  });

// Handle lifecycle events
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// Helper pour afficher les notifications en background
const handleBackgroundMessage = async (payload) => {
  console.log('[SW] 📨 Background message received:', {
    title: payload.notification?.title,
    body: payload.notification?.body,
    dataType: payload.data?.type,
  });

  if (!payload.notification) {
    console.warn('[SW] ⚠️ Payload without notification data');
    return;
  }

  const notificationTitle = payload.notification.title || '🎙️ Radio Grâce-Espoir';
  const notificationOptions = {
    body: payload.notification.body || 'Nouvelle notification',
    icon: payload.notification.image || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.type || 'notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
      },
      {
        action: 'close',
        title: 'Fermer',
      },
    ],
  };

  try {
    await self.registration.showNotification(notificationTitle, notificationOptions);
    console.log('[SW] ✅ Notification affichée');
  } catch (error) {
    console.error('[SW] ❌ Error showing notification:', error);
  }
};

// Setup message handler quand Firebase est prêt
const setupMessageHandler = async () => {
  console.log('[SW] ⏳ Waiting for Firebase initialization...');
  
  // Attendre que Firebase soit initialisé (10 secondes)
  let maxAttempts = 100;
  while (!initialized && maxAttempts > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    maxAttempts--;
  }

  if (!initialized || !messaging) {
    console.error('[SW] ❌ Firebase not initialized after timeout');
    return;
  }

  console.log('[SW] ✅ Firebase ready, setting up message handler');
  
  try {
    messaging.onBackgroundMessage((payload) => {
      handleBackgroundMessage(payload);
    });
    console.log('[SW] ✅ Background message handler configured');
  } catch (error) {
    console.error('[SW] ❌ Error setting up message handler:', error);
  }
};

// Lancer le setup
setupMessageHandler();

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 Notification clicked:', {
    title: event.notification.title,
    tag: event.notification.tag,
    data: event.notification.data,
  });

  const notification = event.notification;
  const data = notification.data || {};

  notification.close();

  if (event.action === 'close') {
    return;
  }

  // Envoyer message au client
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Chercher un client pour l'app
      for (const client of clientList) {
        // Envoyer le message
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          notification: data,
        });
        
        // Focus si possible
        if ('focus' in client) {
          return client.focus();
        }
      }

      // Ouvrir une nouvelle window si aucun client n'existe
      if (self.clients.openWindow) {
        return self.clients.openWindow('/').then((client) => {
          if (client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              notification: data,
            });
          }
        });
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', () => {
  console.log('[SW] ❌ Notification closed');
});
