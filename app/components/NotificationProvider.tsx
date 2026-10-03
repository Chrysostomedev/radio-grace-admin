// app/components/NotificationProvider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useNotifications } from '@/app/hooks/useNotifications';
import { injectFirebaseConfig } from '@/lib/generate-firebase-config';

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { token, loading } = useNotifications();

  useEffect(() => {
    // Flag pour éviter les exécutions multiples
    let isMounted = true;

    // 1. Injecter la configuration Firebase dans le window
    if (isMounted) {
      injectFirebaseConfig();
    }

    // 2. Enregistrer le Service Worker avec la config injectée
    //    (uniquement si le navigateur le supporte)
    if (isMounted && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          if (isMounted) {
            console.log('✅ Service Worker registered:', registration);
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error('❌ Service Worker registration failed:', error);
          }
        });
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && !token) {
    console.warn(' No FCM token available - notifications may not work');
  }

  return <>{children}</>;
}