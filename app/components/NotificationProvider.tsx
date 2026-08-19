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
    // 1. Injecter la configuration Firebase dans le window
    injectFirebaseConfig();

    // 2. Enregistrer le Service Worker avec la config injectée
    //    (uniquement si le navigateur le supporte)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  if (!loading && !token) {
    console.warn(' No FCM token available - notifications may not work');
  }

  return <>{children}</>;
}