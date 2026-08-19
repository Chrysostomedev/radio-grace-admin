# 🚀 Démarrage Rapide Live Sessions

## 1️⃣ Lancer Docker

```bash
# À la racine du projet
docker-compose up -d

# Vérifier que tout fonctionne
docker ps

# Voir les logs
docker logs -f nginx-rtmp-server
docker logs -f rge-backend
```

## 2️⃣ Créer les tables

```bash
docker exec rge-backend php artisan migrate
```

## 3️⃣ Configurer OBS

1. **Settings** → **Stream**
2. Service: Custom
3. Server: `rtmp://192.168.1.81:1935/live`
4. Stream Key: `direct`
5. **Start Streaming** (F10)

## 4️⃣ Créer une session Live (Admin)

```bash
TOKEN="votre_token_admin"

curl -X POST http://192.168.1.81:8000/api/v1/admin/live-sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Direct Louange",
    "description": "Session live",
    "programme_id": 1
  }'
```

## 5️⃣ Voir la session (Mobile)

```bash
TOKEN="votre_token_user"

# Récupérer la session actuelle
curl -X GET http://192.168.1.81:8000/api/v1/mobile/live \
  -H "Authorization: Bearer $TOKEN"

# Réponse:
# {
#   "data": {
#     "hls_url": "http://192.168.1.81:8080/hls/stream_xxx/index.m3u8",
#     "statut": "EN_DIRECT",
#     ...
#   }
# }
```

## 6️⃣ Utiliser le Chat (Mobile)

```bash
# Envoyer un message
curl -X POST http://192.168.1.81:8000/api/v1/mobile/live/1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Super!"}'

# Récupérer les messages
curl -X GET http://192.168.1.81:8000/api/v1/mobile/live/1/chat \
  -H "Authorization: Bearer $TOKEN"
```

## 📁 Fichiers Créés

✅ Models:
- `app/Models/LiveSession.php`
- `app/Models/LiveChat.php`

✅ Services:
- `app/Services/LiveStreamService.php`

✅ Controllers:
- `app/Http/Controllers/Api/V1/Admin/LiveSessionController.php`
- `app/Http/Controllers/Api/V1/Mobile/LiveSessionController.php`
- `app/Http/Controllers/Api/V1/Mobile/LiveChatController.php`

✅ Resources:
- `app/Http/Resources/LiveSessionResource.php`

✅ Docker:
- `docker-compose.yml`
- `Dockerfile`
- `nginx.conf`

## 🔗 Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/admin/live-sessions` | Créer session |
| GET | `/api/v1/admin/live-sessions` | Lister sessions |
| GET | `/api/v1/admin/live-sessions/{id}` | Détail |
| POST | `/api/v1/admin/live-sessions/{id}/force-stop` | Arrêter |
| GET | `/api/v1/mobile/live` | Session actuelle |
| GET | `/api/v1/mobile/live/{id}/chat` | Messages |
| POST | `/api/v1/mobile/live/{id}/chat` | Envoyer message |

## 🎬 Flow Complet

```
1. Admin crée session via POST /admin/live-sessions
2. Système génère un RTMP URL unique
3. Admin lance OBS et configure le serveur RTMP
4. OBS commence à streamer
5. Nginx reçoit le stream et génère HLS
6. Mobile récupère l'URL HLS et lit la vidéo
7. Chat en temps réel via messages
8. OBS arrête le stream
9. Session passe à TERMINEE
```

## 🐛 Si ça ne marche pas

```bash
# Vérifier nginx
docker logs nginx-rtmp-server

# Vérifier backend
docker logs rge-backend

# Vérifier les fichiers HLS
docker exec nginx-rtmp-server ls -la /mnt/hls/

# Tester la connection RTMP
docker exec nginx-rtmp-server netstat -tlnp | grep 1935
```

## 📺 Tester HLS en direct

Ouvre dans VLC:
```
http://192.168.1.81:8080/hls/direct/index.m3u8
```

---

**C'est prêt! 🎉**
