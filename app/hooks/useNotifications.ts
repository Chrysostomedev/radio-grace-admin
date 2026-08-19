// app/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/core/axios';
import { getFCMToken, onForegroundMessage, handleNotificationClick } from '@/lib/firebase';
import { toast } from 'sonner';

interface NotificationData {
  type: string;
  [key: string]: any;
}

export function useNotifications() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        // 1. Obtenir le FCM Token
        const fcmToken = await getFCMToken();
        if (!fcmToken) {
          console.warn('⚠️ Failed to get FCM token');
          setLoading(false);
          return;
        }

        setToken(fcmToken);

        // 2. Enregistrer le device auprès du backend (optionnel, ne pas bloquer)
        try {
          await registerDevice(fcmToken);
        } catch (err) {
          console.warn('⚠️ Device registration failed (non-blocking):', err);
          // Continuer même si l'enregistrement échoue
        }

        // 3. Écouter les notifications en foreground
        onForegroundMessage((payload) => {
          console.log('📨 Foreground notification:', payload);
          
          // Afficher toast
          if (payload.notification) {
            toast.success(payload.notification.body);
          }
        });

        // 4. Traiter les clics sur notification
        handleNotificationClick((data: NotificationData) => {
          navigateToNotificationPage(data);
        });

        console.log('✅ Notifications initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    // Vérifier si le service worker est supporté
    if ('serviceWorker' in navigator && 'Notification' in window) {
      initNotifications();
    } else {
      console.warn('⚠️ Notifications not supported in this browser');
      setLoading(false);
    }
  }, []);

  /**
   * Enregistrer le device auprès du backend (optionnel)
   */
  const registerDevice = async (fcmToken: string) => {
    try {
      const response = await axios.post('/admin/devices/register', {
        fcm_token: fcmToken,
        device_type: 'web',
        device_name: navigator.userAgent,
      });

      console.log('✅ Device registered:', response.data);
      return response.data;
    } catch (error: any) {
      // Erreur non-bloquante
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      console.warn('⚠️ Device registration error:', errorMsg);
      // Ne pas relancer l'erreur, juste logger
      return null;
    }
  };

  /**
   * Naviguer vers la page appropriée selon le type de notification
   */
  const navigateToNotificationPage = (data: NotificationData) => {
    console.log('🔗 Navigating to page:', data);

    const { type } = data;

    switch (type) {
      case 'podcast':
        if (data.podcast_id) {
          router.push(`/admin/podcasts/${data.podcast_id}`);
        }
        break;

      case 'emission':
      case 'programme':
        if (data.programme_id) {
          router.push(`/admin/emissions/${data.programme_id}`);
        }
        break;

      case 'animateur':
        if (data.animateur_id) {
          router.push(`/admin/animateurs/${data.animateur_id}`);
        }
        break;

      case 'actualite':
        if (data.actualite_id) {
          router.push(`/admin/actualites/${data.actualite_id}`);
        }
        break;

      case 'reminder':
        if (data.programme_id) {
          router.push(`/admin/emissions/${data.programme_id}`);
        }
        break;

      default:
        console.warn('Unknown notification type:', type);
    }
  };

  /**
   * Envoyer une notification (test)
   */
  const sendTestNotification = async (
    title: string,
    message: string,
    type: string = 'test'
  ) => {
    try {
      const response = await axios.post('/admin/push-notifications/test', {
        titre: title,
        message,
        data: { type },
      });

      toast.success('Notification de test envoyée');
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
      throw error;
    }
  };

  return {
    token,
    loading,
    registerDevice,
    navigateToNotificationPage,
    sendTestNotification,
  };
}
