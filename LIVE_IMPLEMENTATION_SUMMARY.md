# 🎬 Implémentation Live Sessions - Admin Dashboard

## ✅ Complété

### 1. Service API (`services/liveSessionService.ts`)
- ✅ `create()` - Créer une session
- ✅ `getAll()` - Lister les sessions
- ✅ `getById()` - Récupérer une session
- ✅ `update()` - Modifier une session
- ✅ `delete()` - Supprimer une session
- ✅ `forceStop()` - Arrêter d'urgence

### 2. Hook React (`app/admin/hooks/useLiveSession.ts`)
- ✅ Gestion de l'état des sessions
- ✅ Auto-refresh toutes les 10 secondes si une session est en direct
- ✅ Gestion des erreurs avec toast notifications
- ✅ Méthodes: fetch, create, update, delete, stop

### 3. Page Admin (`app/admin/live/page.tsx`)
- ✅ Connecte les composants existants:
  - `LivePlayer` - Lecteur vidéo/audio
  - `LiveControls` - Création + gestion
  - `MobilePreview` - Aperçu mobile
- ✅ Affiche l'historique des sessions
- ✅ Gère les actions admin (create, stop, delete)
- ✅ Mappage des données API vers les types existants

## 🏗️ Architecture

```
PAGE: app/admin/live/page.tsx
  ├─ Hook: useLiveSession()
  │   └─ Service: liveStreamService
  │       └─ API: axios → /admin/live-sessions
  │
  ├─ Component: LivePlayer
  │   └─ Lit le stream HLS via hls.js
  │
  ├─ Component: LiveControls
  │   ├─ Formulaire création
  │   └─ Bouton emergency stop
  │
  └─ Component: MobilePreview
      └─ Aperçu de ce que voient les utilisateurs
```

## 📡 Flux de Données

```
1. Admin crée session
   POST /admin/live-sessions
   ↓
2. Backend génère stream_key unique
   ↓
3. Admin récupère les identifiants OBS
   (serveur: rtmp://..., clé: stream_key)
   ↓
4. Admin configure OBS avec ces valeurs
   ↓
5. OBS envoie stream RTMP → Nginx
   ↓
6. Webhook: on_publish
   → Backend met à jour: is_live = true
   ↓
7. Frontend auto-refresh toutes les 10s
   → Détecte que is_live = true
   → Affiche le lecteur HLS
   → Affiche "EN DIRECT" badge
   ↓
8. Mobile reçoit le HLS et lit
   ↓
9. OBS arrête stream
   ↓
10. Webhook: on_publish_done
    → Backend met à jour: is_live = false
```

## 🎮 Utilisation

### Pour l'Admin

1. Ouvrir `/admin/live`
2. Cliquer "Créer la session"
3. Copier l'URL serveur et la clé
4. Configurer OBS:
   - Settings → Stream
   - Service: Custom
   - Server: (coller l'URL)
   - Stream Key: (coller la clé)
5. Cliquer "Start Streaming" dans OBS
6. Le direct s'active automatiquement ✅

### Pour l'Utilisateur Mobile

1. Ouvrir l'app
2. Aller à "Live"
3. Voir le player automatiquement avec le badge "EN DIRECT"
4. Cliquer Play pour regarder

## 📊 Endpoints API Utilisés

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/admin/live-sessions` | Créer session |
| GET | `/admin/live-sessions` | Lister sessions |
| GET | `/admin/live-sessions/{id}` | Récupérer détail |
| PUT | `/admin/live-sessions/{id}` | Modifier session |
| DELETE | `/admin/live-sessions/{id}` | Supprimer |
| POST | `/admin/live-sessions/{id}/force-stop` | Arrêter |

## 🔗 Fichiers Créés/Modifiés

### Créés
- ✅ `services/liveSessionService.ts`
- ✅ `app/admin/hooks/useLiveSession.ts`
- ✅ `app/admin/live/page.tsx`

### Existants Connectés
- `components/live/LivePlayer.tsx`
- `components/live/LiveControls.tsx`
- `components/live/MobilePreview.tsx`
- `types/admin.ts` (LiveSession, LiveSessionPayload)

## 🚀 Prochaines Étapes

1. **Backend**: Implémenter les endpoints API (voir LIVE_SESSIONS_IMPLEMENTATION.md)
2. **Mobile**: Créer les hooks/composants pour consommer les APIs live
3. **Tests**: Tester avec OBS et Docker
4. **Production**: Configurer Nginx-RTMP + certificats SSL

## ✨ Features Implémentés

- ✅ Création de sessions
- ✅ Gestion du cycle de vie (create → live → stop → end)
- ✅ Affichage du lecteur en live
- ✅ Copie facile des identifiants OBS
- ✅ Aperçu mobile
- ✅ Auto-refresh des statuts
- ✅ Historique des sessions
- ✅ Emergency stop
- ✅ Error handling + notifications

## 📝 Notes

- La page utilise les composants existants sans les modifier
- Auto-refresh toutes les 10s si une session est en direct
- Support AUDIO et VIDEO
- Responsive design (grid 1 col mobile, 3 cols desktop)
- Toast notifications pour feedback utilisateur

---

**Status**: ✅ Frontend Admin Complet
**Prêt pour**: Backend + Docker + Tests
