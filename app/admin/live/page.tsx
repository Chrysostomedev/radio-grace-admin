'use client';

import { useState, useEffect } from 'react';
import { useLiveSession } from '@/app/admin/hooks/useLiveSession';
import { liveStreamService } from '@/services/liveSessionService';
import LivePlayer from '@/components/live/LivePlayer';
import LiveControls from '@/components/live/LiveControls';
import MobilePreview from '@/components/live/MobilePreview';
import type { LiveSession, LiveSessionPayload } from '@/types/admin';
import { toast } from 'sonner';

/**
 * Page principale de gestion du live streaming
 * Affiche le lecteur vidéo, les contrôles et l'aperçu mobile
 */
export default function LivePage() {
  const { sessions, currentSession, loading, error, isUsingMockData, createSession, stopSession } = useLiveSession();
  const [saving, setSaving] = useState(false);

  // Trouver la session en direct ou prochaine
  const liveSession = sessions.find((s) => s.is_live) || sessions[0] || null;

  // Mapper la réponse API vers le type LiveSession attendu par les composants
  const mappedSession = liveSession ? mapToLiveSession(liveSession) : null;

  const handleCreateSession = async (payload: LiveSessionPayload): Promise<LiveSession | null> => {
    try {
      setSaving(true);
      const newSession = await createSession({
        titre: payload.titre,
        type: payload.type,
      });

      if (newSession) {
        toast.success('Session live créée! Configurez OBS avec les identifiants ci-dessus.');
        return mapToLiveSession(newSession);
      } else {
        toast.error('Erreur lors de la création de la session');
        return null;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleForceStop = async () => {
    if (!liveSession?.id) return;

    try {
      setSaving(true);
      const confirmed = confirm('Êtes-vous sûr d\'arrêter le direct maintenant?');
      if (!confirmed) return;

      const success = await stopSession(liveSession.id);
      if (success) {
        toast.success('Session live arrêtée');
      } else {
        toast.error('Erreur lors de l\'arrêt de la session');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[#163A2C] mb-1">🎬 Live Streaming</h1>
          <p className="text-sm text-[#163A2C]/60">Gérez les sessions en direct avec OBS</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm font-semibold text-red-700">⚠️ {error}</p>
          </div>
        )}

        {/* Mock Data Warning */}
        {isUsingMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-700 mb-1">⚠️ Mode Démo Activé</p>
              <p className="text-xs text-yellow-600">
                Le backend n'est pas accessible. Les données affichées sont des exemples. Lancez Docker pour activer le vrai système.
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-black rounded-full">DÉMO</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <LivePlayer
              session={mappedSession}
              onForceStop={handleForceStop}
              saving={saving}
            />

            {/* Controls Panel */}
            <LiveControls
              session={mappedSession}
              onCreate={handleCreateSession}
              onForceStop={handleForceStop}
              saving={saving}
            />

            {/* Sessions List */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5">
                <h3 className="font-black text-[#163A2C] text-sm mb-4">Historique des sessions</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-xl border transition ${
                        session.is_live
                          ? 'bg-red-50 border-red-200'
                          : 'bg-[#FBF6EA] border-[#163A2C]/10 hover:border-[#F0A93E]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-[#163A2C]">{session.titre}</p>
                          <p className="text-xs text-[#163A2C]/50 mt-1">
                            Type: {session.type === 'VIDEO' ? '📹 Vidéo' : '🎙️ Audio'}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-black px-2 py-1 rounded-full ${
                            session.is_live
                              ? 'bg-red-200 text-red-700'
                              : 'bg-[#163A2C]/10 text-[#163A2C]/60'
                          }`}
                        >
                          {session.is_live ? '🔴 LIVE' : '✅ Fin'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Mobile Preview & Info */}
          <div className="space-y-6">
            {/* Mobile Preview */}
            <MobilePreview session={mappedSession} />

            {/* Info Panel */}
            <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-5 space-y-4">
              <h3 className="font-black text-[#163A2C] text-sm">ℹ️ Comment ça marche?</h3>
              <ol className="text-xs text-[#163A2C]/70 space-y-3">
                <li className="flex gap-3">
                  <span className="font-black flex-shrink-0">1️⃣</span>
                  <span>Créez une session live avec un titre</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-black flex-shrink-0">2️⃣</span>
                  <span>Copiez l'URL serveur et la clé de flux</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-black flex-shrink-0">3️⃣</span>
                  <span>Configurez OBS avec ces valeurs</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-black flex-shrink-0">4️⃣</span>
                  <span>Lancez le stream depuis OBS</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-black flex-shrink-0">5️⃣</span>
                  <span>Le direct s'affiche automatiquement sur l'app</span>
                </li>
              </ol>

              <div className="pt-4 border-t border-[#163A2C]/5">
                <p className="text-xs font-bold text-[#163A2C] mb-2">📊 Sessions actives</p>
                <p className="text-2xl font-black text-[#F0A93E]">{sessions.filter((s) => s.is_live).length}</p>
              </div>
            </div>

            {/* Technical Info */}
            {mappedSession && mappedSession.obs && (
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 space-y-3">
                <h3 className="font-black text-blue-900 text-xs">🔧 Configuration OBS</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-blue-700 font-bold mb-1">Serveur:</p>
                    <code className="bg-white p-2 rounded block border border-blue-200 font-mono overflow-x-auto">
                      {mappedSession.obs.serveur}
                    </code>
                  </div>
                  <div>
                    <p className="text-blue-700 font-bold mb-1">Clé de flux:</p>
                    <code className="bg-white p-2 rounded block border border-blue-200 font-mono overflow-x-auto">
                      {mappedSession.obs.cle_de_flux}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mapper la réponse API vers le type LiveSession attendu par les composants
 */
function mapToLiveSession(apiSession: any): LiveSession {
  return {
    id: apiSession.id,
    titre: apiSession.titre,
    type: apiSession.type || 'VIDEO',
    stream_url: apiSession.stream_url || apiSession.hls_url,
    is_live: apiSession.is_live || apiSession.statut === 'EN_DIRECT',
    auditeurs_live: apiSession.auditeurs_live || apiSession.auditeurs_actifs || 0,
    signal: apiSession.signal || 'OK',
    duree_en_cours_minutes: apiSession.duree_en_cours_minutes || 0,
    programme: apiSession.programme || null,
    obs: apiSession.obs,
  };
}
