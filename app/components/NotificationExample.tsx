'use client';

import { useState } from 'react';
import { useNotifications } from '@/app/hooks/useNotifications';
import { firebaseConfig, isFirebaseConfigured } from '@/config/firebase-config';

/**
 * Component pour tester les notifications Firebase
 * À utiliser en développement/debugging
 */
export function NotificationExample() {
  const { token, loading, sendTestNotification } = useNotifications();
  const [testMessage, setTestMessage] = useState('Test Notification');
  const [testTitle, setTestTitle] = useState('🎙️ Test');
  const [testType, setTestType] = useState('test');

  const handleSendTest = async () => {
    try {
      await sendTestNotification(testTitle, testMessage, testType);
      alert('✅ Notification de test envoyée!');
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi: ' + error);
    }
  };

  const checkConfig = () => {
    if (!isFirebaseConfigured()) {
      alert('❌ Firebase n\'est pas correctement configuré. Vérifiez les variables d\'env.');
      return;
    }
    alert('✅ Firebase est correctement configuré');
  };

  const copytokenToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert('✅ Token copié au presse-papiers');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔥 Firebase Notifications Debug Panel
      </h2>

      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Status</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Config:</span>
            <span className={`ml-2 font-semibold ${isFirebaseConfigured() ? 'text-green-600' : 'text-red-600'}`}>
              {isFirebaseConfigured() ? '✅ OK' : '❌ KO'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Loading:</span>
            <span className={`ml-2 font-semibold ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
              {loading ? '⏳ Yes' : '✅ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">FCM Token:</span>
            <span className={`ml-2 font-semibold ${token ? 'text-green-600' : 'text-red-600'}`}>
              {token ? '✅ Obtained' : '❌ Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">🔐 Configuration Details</h3>
        <div className="space-y-2 text-xs font-mono bg-white p-3 rounded border border-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
          <div>
            <strong>Project ID:</strong> {firebaseConfig.projectId || '❌ Missing'}
          </div>
          <div>
            <strong>Auth Domain:</strong> {firebaseConfig.authDomain || '❌ Missing'}
          </div>
          <div>
            <strong>API Key:</strong> {firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : '❌ Missing'}
          </div>
          <div>
            <strong>Messaging Sender ID:</strong> {firebaseConfig.messagingSenderId || '❌ Missing'}
          </div>
          <div>
            <strong>App ID:</strong> {firebaseConfig.appId || '❌ Missing'}
          </div>
          <div>
            <strong>VAPID Key:</strong> Available: {typeof (window as any).__FIREBASE_CONFIG__?.vapidKey === 'string' ? '✅ Yes' : '❌ No'}
          </div>
        </div>
        <button
          onClick={checkConfig}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          🔍 Verify Configuration
        </button>
      </div>

      {/* FCM Token */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-900 mb-2">📱 FCM Token</h3>
        <div className="font-mono text-xs bg-white p-3 rounded border border-green-300 break-all mb-3">
          {token ? (
            <span>{token.substring(0, 50)}...</span>
          ) : (
            <span className="text-red-600">❌ Not available yet</span>
          )}
        </div>
        <button
          onClick={copytokenToClipboard}
          disabled={!token}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 text-sm"
        >
          📋 Copy Token
        </button>
      </div>

      {/* Test Notification */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-3">✉️ Send Test Notification</h3>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="test">Test</option>
              <option value="podcast">Podcast</option>
              <option value="emission">Emission</option>
              <option value="animateur">Animateur</option>
              <option value="actualite">Actualité</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSendTest}
          disabled={loading || !token}
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 font-medium"
        >
          🚀 Send Test Notification
        </button>
      </div>

      {/* Service Worker Status */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-2">⚙️ Service Worker</h3>
        <div className="text-sm space-y-2">
          <div>
            <p className="text-gray-700 mb-2">Service Worker registration status:</p>
            <button
              onClick={async () => {
                if ('serviceWorker' in navigator) {
                  try {
                    const registration = await navigator.serviceWorker.ready;
                    alert('✅ Service Worker is ready!\n\nRegistration:\n' + JSON.stringify({
                      scope: registration.scope,
                      active: !!registration.active,
                      waiting: !!registration.waiting,
                    }, null, 2));
                  } catch (error) {
                    alert('❌ Service Worker error: ' + error);
                  }
                } else {
                  alert('❌ Service Workers not supported');
                }
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
            >
              Check Service Worker
            </button>
          </div>

          <div>
            <p className="text-gray-700 mb-2">Check notification permissions:</p>
            <button
              onClick={() => {
                if ('Notification' in window) {
                  alert('📌 Notification Permission: ' + Notification.permission);
                } else {
                  alert('❌ Notifications not supported');
                }
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
            >
              Check Permissions
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <h3 className="font-semibold text-gray-900 mb-2">📖 Instructions</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Verify Configuration is ✅ OK</li>
          <li>Check that FCM Token is available</li>
          <li>Check Service Worker status</li>
          <li>Send a test notification</li>
          <li>Check DevTools Console for errors</li>
          <li>Verify notification appears on screen</li>
        </ol>
      </div>
    </div>
  );
}
