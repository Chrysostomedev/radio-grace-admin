# 🎬 Live Sessions System - Radio Grâce-Espoir

## 🎯 Vue d'ensemble

Système complet de diffusion en direct (Live Streaming) avec:
- **OBS** pour l'encodage vidéo
- **Nginx-RTMP** pour recevoir le stream RTMP
- **HLS/DASH** pour la diffusion au mobile
- **Laravel API** pour la gestion et le chat
- **Docker** pour l'infrastructure

---

## 📦 Contenu Livré

### 9 Fichiers PHP + Code Complet
```
✅ Models (2):           LiveSession.php, LiveChat.php
✅ Services (1):         LiveStreamService.php
✅ Controllers (3):      Admin/Live, Mobile/Live, Mobile/Chat
✅ Resources (1):        LiveSessionResource.php
✅ Docker (3):           docker-compose.yml, Dockerfile, nginx.conf
✅ Documentation (4):    LIVE_SESSIONS_*.md + OBS_CONFIGURATION_GUIDE.md
```

### 5 Guides Complets
1. **LIVE_SESSIONS_INDEX.md** - Navigation (lire d'abord!)
2. **LIVE_SESSIONS_QUICK_START.md** - Démarrage 5 min ⭐ COMMENCEZ ICI
3. **OBS_CONFIGURATION_GUIDE.md** - Config OBS en français (très détaillé)
4. **LIVE_SESSIONS_IMPLEMENTATION.md** - Technique complète
5. **LIVE_SESSIONS_FILES_SUMMARY.md** - Récapitulatif fichiers

---

## 🚀 Démarrer en 3 Minutes

### 1. Lancer Docker
```bash
docker-compose up -d
docker exec rge-backend php artisan migrate
```

### 2. Configurer OBS
- Settings → Stream
- Server: `rtmp://192.168.1.81:1935/live`
- Stream Key: `direct`

### 3. Créer une Session
```bash
curl -X POST http://192.168.1.81:8000/api/v1/admin/live-sessions \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{"titre": "Direct", "programme_id": 1}'
```

✅ **Terminé!** Le direct fonctionne!

---

## 📋 Fichiers Créés

### Core Application

#### Models
- `app/Models/LiveSession.php` - Modèle session live avec statuts
- `app/Models/LiveChat.php` - Messages de chat en temps réel

#### Services
- `app/Services/LiveStreamService.php` - Logique métier complète

#### Controllers
- `app/Http/Controllers/Api/V1/Admin/LiveSessionController.php` - Admin API
- `app/Http/Controllers/Api/V1/Mobile/LiveSessionController.php` - Mobile video
- `app/Http/Controllers/Api/V1/Mobile/LiveChatController.php` - Mobile chat

#### Resources
- `app/Http/Resources/LiveSessionResource.php` - Transformation JSON

### Infrastructure

#### Docker
- `docker-compose.yml` - Orchestration (Nginx, Backend, MySQL, Redis)
- `Dockerfile` - Image PHP 8.2 avec extensions
- `nginx.conf` - Configuration RTMP + HLS/DASH + Webhooks

### Documentation

#### Guides Utilisateur
- `LIVE_SESSIONS_INDEX.md` - **Navigation complète (lire d'abord!)**
- `LIVE_SESSIONS_QUICK_START.md` - Démarrage rapide ⭐
- `OBS_CONFIGURATION_GUIDE.md` - Configuration OBS détaillée (français)
- `LIVE_SESSIONS_IMPLEMENTATION.md` - Architecture & code complet
- `LIVE_SESSIONS_FILES_SUMMARY.md` - Récapitulatif technique
- `LIVE_SESSIONS_README.md` - Ce fichier

---

## 🎬 Architecture Complète

```
┌─────────────────────────────────────────────────────────┐
│  OBS Studio (Votre ordinateur)                          │
│  Encodage: H.264, AAC                                   │
│  RTMP: rtmp://192.168.1.81:1935/live/stream_key         │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Nginx-RTMP     │
        │  (Docker)       │
        │                 │
        │  Port 1935 ◀───┘ RTMP from OBS
        │  Port 8080 ───► HLS/DASH HTTP
        │  Port 8081     Stats page
        │                 │
        │  Webhook URLs:  │
        │  /publish       │
        │  /publish-done  │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ↓            ↓            ↓
  HLS         DASH       Webhooks
  .m3u8       .mpd       (Laravel)
    │            │            │
    └────────────┼────────────┘
                 │
        ┌────────▼────────┐
        │  Laravel API    │
        │  (Port 8000)    │
        │                 │
        │  DB:            │
        │  - LiveSession  │
        │  - LiveChat     │
        │  - User         │
        └─────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────────┐       ┌──────────────┐
│ Mobile App   │       │  Web Admin   │
│ (Video HLS)  │       │  (Manage)    │
│ (Chat)       │       │  (Stats)     │
│ (Stats)      │       │              │
└──────────────┘       └──────────────┘
```

---

## 🔗 Endpoints API

### Admin (role: ADMIN | ANIMATEUR)
```
POST   /api/v1/admin/live-sessions           ← Créer session
GET    /api/v1/admin/live-sessions           ← Lister
GET    /api/v1/admin/live-sessions/{id}      ← Détail
PUT    /api/v1/admin/live-sessions/{id}      ← Modifier
DELETE /api/v1/admin/live-sessions/{id}      ← Supprimer
POST   /api/v1/admin/live-sessions/{id}/force-stop ← Arrêter
```

### Mobile (role: AUDITEUR)
```
GET    /api/v1/mobile/live                   ← Session actuelle
GET    /api/v1/mobile/live/{id}/chat         ← Messages
POST   /api/v1/mobile/live/{id}/chat         ← Envoyer message
```

---

## 📊 Database

### LiveSession (Table Principale)
```
- id, titre, description
- programme_id, animateur_id
- statut: PLANIFIEE | EN_DIRECT | TERMINEE
- stream_key (unique RTMP identifier)
- rtmp_url, hls_url
- debut_prevue, debut_reel, fin_reel
- auditeurs_actifs, auditeurs_total
- duree_secondes
- timestamps
```

### LiveChat (Messages)
```
- id, live_session_id, user_id
- message (max 500 chars)
- type: MESSAGE | REACTION | INFO
- metadata (JSON for future features)
- created_at
```

---

## 🎯 Workflow Complet

```
1️⃣ ADMIN crée session
   POST /admin/live-sessions
   → Génère stream_key unique
   → Retourne RTMP + HLS URLs

2️⃣ ADMIN lance OBS
   Settings:
   - Server: rtmp://ip:1935/live
   - Stream Key: {stream_key}

3️⃣ OBS streamse vers Nginx
   rtmp://192.168.1.81:1935/live/{stream_key}

4️⃣ Nginx reçoit et génère HLS
   /mnt/hls/{stream_key}/index.m3u8

5️⃣ Webhook: on_publish
   POST /webhooks/nginx/on-publish
   → LiveSession: PLANIFIEE → EN_DIRECT

6️⃣ MOBILE récupère session
   GET /mobile/live
   → Reçoit HLS URL

7️⃣ MOBILE lit la vidéo
   http://ip:8080/hls/{stream_key}/index.m3u8

8️⃣ MOBILE envoie message
   POST /mobile/live/{id}/chat
   {"message": "Super!"}

9️⃣ OBS arrête streaming
   → Webhook: on_publish_done

🔟 Webhook: on_publish_done
   → LiveSession: EN_DIRECT → TERMINEE
   → Durée et stats finales calculées
```

---

## 📱 Ports & Services

| Service | Port | Protocole | Description |
|---------|------|-----------|-------------|
| Nginx RTMP | 1935 | RTMP | OBS connexion ici |
| Nginx HTTP | 8080 | HTTP | HLS/DASH streaming |
| Nginx Stats | 8081 | HTTP | Monitoring page |
| Laravel API | 8000 | HTTP | Backend API |
| MySQL | 3306 | TCP | Database |
| Redis | 6379 | TCP | Cache |

---

## 🛠️ Technologies Utilisées

### Backend
- **Laravel 11** - Framework PHP
- **Eloquent ORM** - Modèles & DB
- **PHP 8.2** - Langage

### Streaming
- **Nginx-RTMP** - Serveur RTMP
- **FFmpeg** - Encodage
- **HLS** - Protocole streaming
- **DASH** - Protocole streaming

### Infrastructure
- **Docker** - Containerisation
- **Docker Compose** - Orchestration
- **MySQL 8** - Database
- **Redis** - Cache

### Frontend
- **React Native / Expo** - Mobile
- **Pusher/Ably** - WebSocket chat

---

## 🐛 Dépannage Rapide

### OBS ne se connecte pas
```bash
# Vérifier port 1935 écoute
docker exec nginx-rtmp-server netstat -tlnp | grep 1935

# Vérifier URL correcte
rtmp://192.168.1.81:1935/live (pas localhost!)
```

### Mobile voit rien
```bash
# Vérifier HLS générée
docker exec nginx-rtmp-server ls -la /mnt/hls/

# Tester URL dans VLC
http://192.168.1.81:8080/hls/{stream_key}/index.m3u8
```

### Chat ne fonctionne pas
```bash
# Vérifier session EN_DIRECT
curl http://192.168.1.81:8000/api/v1/mobile/live \
  -H "Authorization: Bearer TOKEN"

# Vérifier Pusher config
php artisan config:show broadcasting
```

---

## 📚 Documentation Complète

Consultez dans cet ordre:

1. **LIVE_SESSIONS_INDEX.md** ← Start here!
2. **LIVE_SESSIONS_QUICK_START.md** ← Quick guide
3. **OBS_CONFIGURATION_GUIDE.md** ← OBS setup en français
4. **LIVE_SESSIONS_IMPLEMENTATION.md** ← Technical deep dive
5. **LIVE_SESSIONS_FILES_SUMMARY.md** ← File reference

---

## ✅ Checklist Déploiement

- [ ] Docker installé et testé
- [ ] docker-compose.yml à la racine
- [ ] Dockerfile à la racine
- [ ] nginx.conf à la racine
- [ ] Fichiers PHP créés (9 fichiers)
- [ ] Migrations exécutées
- [ ] Routes enregistrées
- [ ] Token admin généré
- [ ] OBS configuré
- [ ] Nginx RTMP accessible (port 1935)
- [ ] HLS accessible (port 8080)
- [ ] API accessible (port 8000)
- [ ] Vidéo lisible sur mobile
- [ ] Chat fonctionne
- [ ] Stats sauvegardées

---

## 🚀 Commandes Utiles

```bash
# Démarrer Docker
docker-compose up -d

# Migrations
docker exec rge-backend php artisan migrate

# Créer session via CLI
docker exec rge-backend php artisan tinker
>>> App\Models\LiveSession::create([...])

# Voir logs
docker logs -f nginx-rtmp-server
docker logs -f rge-backend

# Accès shell container
docker exec -it rge-backend bash

# Voir fichiers HLS
docker exec nginx-rtmp-server ls -la /mnt/hls/

# Arrêter
docker-compose down
```

---

## 🎉 Résultat Final

✅ Un système Live Streaming **complet** avec:
- Streaming vidéo HD via RTMP/HLS
- Chat en temps réel
- Gestion des sessions
- Admin panel
- Mobile app ready
- Production ready infrastructure
- Comprehensive documentation in French

---

## 📞 Besoin d'aide?

1. Vérifier les logs: `docker logs -f`
2. Lire LIVE_SESSIONS_IMPLEMENTATION.md (Troubleshooting section)
3. Tester chaque composant individuellement
4. Vérifier les ports ouverts: `netstat -tlnp`

---

**Bon courage! 🎬🎉**

*Tous les fichiers sont prêts. Il n'y a plus qu'à lancer Docker et configurer OBS!*
