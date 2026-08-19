// lib/generate-firebase-config.ts
// Génère la configuration Firebase pour le Service Worker

import { firebaseConfig } from '@/config/firebase-config';

/**
 * Génère le script de configuration Firebase pour le Service Worker
 * Ce script doit être exécuté côté client avant que le SW soit enregistré
 */
export const generateFirebaseConfigScript = (): string => {
  return `
    // Auto-generated Firebase configuration for Service Worker
    window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};
  `;
};

/**
 * Injecter la configuration Firebase dans le window object
 * Doit être appelé dès le chargement de l'app
 */
export const injectFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    (window as any).__FIREBASE_CONFIG__ = firebaseConfig;
    console.log('✅ Firebase config injected to window');
  }
};
