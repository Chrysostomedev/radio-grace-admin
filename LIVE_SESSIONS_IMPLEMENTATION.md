# Guide Complet: Implémentation Live Sessions avec Docker, OBS & Nginx-RTMP

## 🎯 Architecture Globale

```
OBS (Encodeur) 
    ↓ RTMP
Nginx-RTMP (Serveur RTMP dans Docker)
    ↓ HLS/DASH
CDN / Frontend Mobile/Web
    ↓ WebSocket
Chat en Temps Réel (Pusher/Ably)
```

---

## 📋 ÉTAPE 1: Lancer le Conteneur Docker avec Nginx-RTMP

### 1.1 Installer Docker
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Mac: https://docs.docker.com/desktop/install/mac-install/
- Linux: `sudo apt-get install docker.io`

### 1.2 Créer le Dockerfile
Crée un fichier `docker-compose.yml` à la racine du projet:

```yaml
version: '3.8'

services:
  nginx-rtmp:
    image: jrottenberg/ffmpeg:latest
    container_name: nginx-rtmp-server
    ports:
      - "1935:1935"      # RTMP
      - "8080:8080"      # HLS/DASH HTTP
      - "8081:8081"      # Stats
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./rtmp-hls:/mnt/hls
    command: "nginx -g 'daemon off;'"
    networks:
      - rge-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: rge-backend
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - APP_NAME=Radio Grâce Espoir
      - DB_HOST=mysql
      - DB_DATABASE=rge
    networks:
      - rge-network

  mysql:
    image: mysql:8.0
    container_name: rge-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: rge
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - ./storage/db:/var/lib/mysql
    networks:
      - rge-network

networks:
  rge-network:
    driver: bridge
```

### 1.3 Créer nginx.conf
Crée `nginx.conf` à la racine:

```nginx
worker_processes auto;
events {
    worker_connections 1024;
}

rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        
        application live {
            live on;
            record off;
            
            # HLS
            hls on;
            hls_path /mnt/hls;
            hls_fragment 3s;
            hls_playlist_length 60s;
            
            # DASH
            dash on;
            dash_path /mnt/hls;
            
            # Redirection vers l'API backend
            on_publish http://backend:8000/api/v1/live/start;
            on_publish_done http://backend:8000/api/v1/live/stop;
        }
    }
}

http {
    server {
        listen 8080;
        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
                application/dash+xml mpd;
            }
            alias /mnt/hls;
            expires 10s;
            add_header Cache-Control "public, max-age=10";
        }
    }
}
```

### 1.4 Lancer le Conteneur

```bash
docker-compose up -d nginx-rtmp
```

**Vérifier:**
```bash
docker ps  # Vérifier que nginx-rtmp tourne
docker logs nginx-rtmp-server  # Voir les logs
```

---

## 🎬 ÉTAPE 2: Configurer OBS

### 2.1 Ouvrir OBS

1. Lancer OBS Studio
2. Aller à **Settings** → **Stream**
3. Configurer:
   - **Service**: Custom
   - **Server**: `rtmp://VOTRE_IP_DOCKER:1935/live`
   - **Stream Key**: `direct` (ou n'importe quel nom)
   
   **Exemple:**
   ```
   rtmp://192.168.1.81:1935/live/direct
   ```

### 2.2 Créer une Scène
1. **Sources** → **+** → Ajouter une source:
   - Display Capture (écran)
   - Window Capture (fenêtre)
   - Media Source (vidéo)
   - Webcam

### 2.3 Configurer l'Audio
1. **Audio Mixer** → Vérifier que le micro/son système est en vert
2. **Settings** → **Audio** → Configurer les périphériques

### 2.4 Configurer l'Encodage
1. **Settings** → **Output** → **Streaming**
2. Encoder: NVIDIA NVENC (si GPU) ou x264 (CPU)
3. Bitrate: 2500 kbps (standard)
4. Preset: veryfast (pour CPU) ou low-latency (pour GPU)

### 2.5 Hotkeys pour le Direct
1. **Settings** → **Hotkeys**
2. Ajouter:
   - `Start Streaming`: F10
   - `Stop Streaming`: F11

---

## 🗄️ ÉTAPE 3: Base de Données - Migrations

### 3.1 Créer la Migration pour LiveSession

```bash
php artisan make:migration create_live_sessions_table
```

**Fichier: `database/migrations/YYYY_MM_DD_create_live_sessions_table.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('live_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->foreignId('programme_id')->nullable()->constrained('programmes');
            $table->foreignId('animateur_id')->nullable()->constrained('users');
            $table->enum('statut', ['PLANIFIEE', 'EN_DIRECT', 'TERMINEE'])->default('PLANIFIEE');
            $table->timestamp('debut_prevue')->nullable();
            $table->timestamp('debut_reel')->nullable();
            $table->timestamp('fin_reel')->nullable();
            $table->string('stream_key')->unique();
            $table->string('rtmp_url')->nullable();
            $table->string('hls_url')->nullable();
            $table->integer('auditeurs_actifs')->default(0);
            $table->integer('auditeurs_total')->default(0);
            $table->integer('duree_secondes')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_sessions');
    }
};
```

Exécuter:
```bash
php artisan migrate
```

### 3.2 Migration pour LiveChat

```bash
php artisan make:migration create_live_chats_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('live_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_session_id')->constrained('live_sessions')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('message');
            $table->enum('type', ['MESSAGE', 'REACTION', 'INFO'])->default('MESSAGE');
            $table->json('metadata')->nullable(); // Pour réactions emoji, etc.
            $table->timestamps();
            
            $table->index(['live_session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_chats');
    }
};
```

Exécuter:
```bash
php artisan migrate
```

---

## 📦 ÉTAPE 4: Modèles Eloquent

### 4.1 Modèle LiveSession

**Fichier: `app/Models/LiveSession.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveSession extends Model
{
    protected $fillable = [
        'titre', 'description', 'programme_id', 'animateur_id',
        'statut', 'debut_prevue', 'debut_reel', 'fin_reel',
        'stream_key', 'rtmp_url', 'hls_url', 'auditeurs_actifs',
        'auditeurs_total', 'duree_secondes'
    ];

    protected $casts = [
        'debut_prevue' => 'datetime',
        'debut_reel' => 'datetime',
        'fin_reel' => 'datetime',
    ];

    // Relations
    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    public function animateur()
    {
        return $this->belongsTo(User::class, 'animateur_id');
    }

    public function chats()
    {
        return $this->hasMany(LiveChat::class);
    }

    // Méthodes utiles
    public function estEnDirect(): bool
    {
        return $this->statut === 'EN_DIRECT';
    }

    public function genererStreamKey(): string
    {
        return 'stream_' . uniqid() . '_' . now()->timestamp;
    }
}
```

### 4.2 Modèle LiveChat

**Fichier: `app/Models/LiveChat.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveChat extends Model
{
    protected $fillable = [
        'live_session_id', 'user_id', 'message', 'type', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'json',
    ];

    public function liveSession()
    {
        return $this->belongsTo(LiveSession::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

## 📡 ÉTAPE 5: Services

### 5.1 LiveStreamService

**Fichier: `app/Services/LiveStreamService.php`**

```php
<?php

namespace App\Services;

use App\Models\LiveSession;
use Illuminate\Support\Facades\Log;

class LiveStreamService
{
    /**
     * Créer une nouvelle session live
     */
    public function creerSession(array $data): LiveSession
    {
        $streamKey = 'stream_' . uniqid();
        
        $session = LiveSession::create([
            'titre' => $data['titre'],
            'description' => $data['description'] ?? null,
            'programme_id' => $data['programme_id'] ?? null,
            'animateur_id' => $data['animateur_id'] ?? null,
            'statut' => 'PLANIFIEE',
            'debut_prevue' => $data['debut_prevue'] ?? null,
            'stream_key' => $streamKey,
            'rtmp_url' => "rtmp://192.168.1.81:1935/live/{$streamKey}",
            'hls_url' => "http://192.168.1.81:8080/hls/{$streamKey}/index.m3u8",
        ]);

        Log::info('Live session créée', ['session_id' => $session->id]);
        return $session;
    }

    /**
     * Démarrer une session (appelée par Nginx webhook)
     */
    public function demarrerSession(string $streamKey): void
    {
        $session = LiveSession::where('stream_key', $streamKey)->first();
        
        if ($session) {
            $session->update([
                'statut' => 'EN_DIRECT',
                'debut_reel' => now(),
                'auditeurs_total' => 0,
            ]);

            Log::info('Live session démarrée', ['session_id' => $session->id]);
            
            // Envoyer notification Firebase
            app(FirebaseService::class)->sendToTopic('live_updates', [
                'titre' => $session->titre,
                'message' => 'Le direct commence maintenant!',
                'data' => ['live_session_id' => $session->id],
            ]);
        }
    }

    /**
     * Terminer une session
     */
    public function terminerSession(string $streamKey): void
    {
        $session = LiveSession::where('stream_key', $streamKey)->first();
        
        if ($session && $session->estEnDirect()) {
            $duree = $session->debut_reel->diffInSeconds(now());
            
            $session->update([
                'statut' => 'TERMINEE',
                'fin_reel' => now(),
                'duree_secondes' => $duree,
            ]);

            Log::info('Live session terminée', [
                'session_id' => $session->id,
                'duree' => $duree,
                'auditeurs' => $session->auditeurs_total
            ]);
        }
    }

    /**
     * Envoyer un message de chat
     */
    public function envoyerMessage(int $sessionId, int $userId, string $message): void
    {
        $session = LiveSession::find($sessionId);
        
        if (!$session || !$session->estEnDirect()) {
            throw new \Exception('Session non active');
        }

        $chat = $session->chats()->create([
            'user_id' => $userId,
            'message' => $message,
            'type' => 'MESSAGE',
        ]);

        // Broadcaster via Pusher/Ably
        broadcast(new \App\Events\LiveChatMessageSent($chat));
    }
}
```

---

## 🎮 ÉTAPE 6: Controllers

### 6.1 LiveSessionAdminController

**Fichier: `app/Http/Controllers/Api/V1/Admin/LiveSessionController.php`**

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LiveSessionResource;
use App\Models\LiveSession;
use App\Services\LiveStreamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LiveSessionController extends Controller
{
    protected $liveService;

    public function __construct(LiveStreamService $liveService)
    {
        $this->liveService = $liveService;
    }

    /**
     * POST /api/v1/admin/live-sessions
     * Créer une session live
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'programme_id' => 'nullable|exists:programmes,id',
            'animateur_id' => 'nullable|exists:users,id',
            'debut_prevue' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        $session = $this->liveService->creerSession($validated);

        Log::info('Live session créée par admin', [
            'admin_id' => auth()->id(),
            'session_id' => $session->id
        ]);

        return new LiveSessionResource($session);
    }

    /**
     * GET /api/v1/admin/live-sessions
     */
    public function index()
    {
        $sessions = LiveSession::with(['programme', 'animateur'])
            ->latest('created_at')
            ->paginate(20);

        return LiveSessionResource::collection($sessions);
    }

    /**
     * GET /api/v1/admin/live-sessions/{id}
     */
    public function show(LiveSession $liveSession)
    {
        return new LiveSessionResource($liveSession->load(['programme', 'animateur', 'chats']));
    }

    /**
     * POST /api/v1/admin/live-sessions/{id}/force-stop
     * Forcer l'arrêt d'une session
     */
    public function forceStop(LiveSession $liveSession)
    {
        if ($liveSession->estEnDirect()) {
            $this->liveService->terminerSession($liveSession->stream_key);
            return response()->json([
                'success' => true,
                'message' => 'Session arrêtée',
                'data' => new LiveSessionResource($liveSession->fresh())
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => 'Session non active'
        ], 400);
    }
}
```

### 6.2 LiveChatController (Mobile)

**Fichier: `app/Http/Controllers/Api/V1/Mobile/LiveChatController.php`**

```php
<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use App\Services\LiveStreamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LiveChatController extends Controller
{
    protected $liveService;

    public function __construct(LiveStreamService $liveService)
    {
        $this->liveService = $liveService;
    }

    /**
     * GET /api/v1/mobile/live/{id}/chat
     * Récupérer les messages du chat
     */
    public function index(LiveSession $live)
    {
        if (!$live->estEnDirect()) {
            return response()->json([
                'success' => false,
                'error' => 'Session non active'
            ], 404);
        }

        $messages = $live->chats()
            ->with('user:id,nom,prenom,avatar')
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'success' => true,
            'live_session_id' => $live->id,
            'messages' => $messages,
        ]);
    }

    /**
     * POST /api/v1/mobile/live/{id}/chat
     * Envoyer un message
     */
    public function store(LiveSession $live, Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
        ]);

        try {
            $this->liveService->envoyerMessage(
                $live->id,
                auth()->id(),
                $validated['message']
            );

            return response()->json([
                'success' => true,
                'message' => 'Message envoyé',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur envoi chat', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

---



## 💾 ÉTAPE 7: Ressources (Resources)

### 7.1 LiveSessionResource

**Fichier: `app/Http/Resources/LiveSessionResource.php`**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'statut' => $this->statut,
            'debut_prevue' => $this->debut_prevue,
            'debut_reel' => $this->debut_reel,
            'fin_reel' => $this->fin_reel,
            'duree_secondes' => $this->duree_secondes,
            'auditeurs_actifs' => $this->auditeurs_actifs,
            'auditeurs_total' => $this->auditeurs_total,
            'stream_key' => $this->stream_key,
            'rtmp_url' => $this->rtmp_url,
            'hls_url' => $this->hls_url,
            'programme' => new ProgrammeResource($this->whenLoaded('programme')),
            'animateur' => [
                'id' => $this->animateur->id ?? null,
                'nom' => $this->animateur->nom ?? null,
                'prenom' => $this->animateur->prenom ?? null,
            ],
            'chat_messages_count' => $this->chats()->count(),
        ];
    }
}
```

---

## 🌐 ÉTAPE 8: Routes

### 8.1 Routes Admin

**Ajouter dans `routes/Api/V1/admin.php`:**

```php
Route::middleware('role:ADMIN,ANIMATEUR')->group(function () {
    
    // Live Sessions
    Route::apiResource('live-sessions', Admin\LiveSessionController::class);
    Route::post('live-sessions/{live_session}/force-stop', [Admin\LiveSessionController::class, 'forceStop']);
    
});
```

### 8.2 Routes Mobile

**Ajouter dans `routes/Api/V1/mobile.php`:**

```php
// Live - Consultation
Route::get('live', [Mobile\LiveSessionController::class, 'current']);
Route::get('live/{live}/chat', [Mobile\LiveChatController::class, 'index']);
Route::post('live/{live}/chat', [Mobile\LiveChatController::class, 'store']);
```

---

## 🪝 ÉTAPE 9: Webhooks Nginx (pour démarrage/arrêt)

### 9.1 Endpoint de Webhook

**Fichier: `app/Http/Controllers/Api/V1/Webhooks/NginxWebhookController.php`**

```php
<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\LiveStreamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NginxWebhookController extends Controller
{
    protected $liveService;

    public function __construct(LiveStreamService $liveService)
    {
        $this->liveService = $liveService;
    }

    /**
     * POST /webhooks/nginx/on-publish
     * Appelé quand un stream RTMP se connecte
     */
    public function onPublish(Request $request)
    {
        $streamKey = $request->input('name');
        
        Log::info('Nginx publish webhook', ['stream_key' => $streamKey]);
        
        $this->liveService->demarrerSession($streamKey);
        
        return response()->json(['success' => true]);
    }

    /**
     * POST /webhooks/nginx/on-publish-done
     * Appelé quand un stream RTMP se déconnecte
     */
    public function onPublishDone(Request $request)
    {
        $streamKey = $request->input('name');
        
        Log::info('Nginx publish-done webhook', ['stream_key' => $streamKey]);
        
        $this->liveService->terminerSession($streamKey);
        
        return response()->json(['success' => true]);
    }
}
```

**Ajouter les routes (sans middleware):**

```php
// routes/api.php
Route::prefix('webhooks')->group(function () {
    Route::post('nginx/on-publish', [Webhooks\NginxWebhookController::class, 'onPublish']);
    Route::post('nginx/on-publish-done', [Webhooks\NginxWebhookController::class, 'onPublishDone']);
});
```

---

## 📱 ÉTAPE 10: Frontend Mobile - Lecteur Vidéo

### 10.1 Composant React Native / Expo

**Fichier: `mobile/components/LiveVideoPlayer.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

interface LiveVideoPlayerProps {
  hlsUrl: string;
  titre: string;
  statut: 'EN_DIRECT' | 'TERMINEE' | 'PLANIFIEE';
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({
  hlsUrl,
  titre,
  statut,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (statut === 'EN_DIRECT') {
      setIsPlaying(true);
    }
  }, [statut]);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: hlsUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay={isPlaying}
        style={styles.video}
        useNativeControls
        progressUpdateIntervalMillis={1000}
      />
      
      <View style={styles.titleContainer}>
        <Text style={styles.titre}>{titre}</Text>
        {statut === 'EN_DIRECT' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>🔴 EN DIRECT</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    padding: 10,
    backgroundColor: '#1a1a1a',
  },
  titre: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveBadge: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ff0000',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

### 10.2 Chat Composant

**Fichier: `mobile/components/LiveChat.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { usePusher } from '../hooks/usePusher';

interface Message {
  id: number;
  user: { nom: string; prenom: string };
  message: string;
  created_at: string;
}

interface LiveChatProps {
  liveSessionId: number;
  token: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({ liveSessionId, token }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { channel } = usePusher(`live.${liveSessionId}`);

  useEffect(() => {
    // Charger les messages initiaux
    fetchMessages();
    
    // S'abonner aux nouveaux messages
    if (channel) {
      channel.bind('message-sent', (data: Message) => {
        setMessages(prev => [...prev, data]);
      });
    }

    return () => {
      if (channel) {
        channel.unbind('message-sent');
      }
    };
  }, [channel]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.81:8000/api/v1/mobile/live/${liveSessionId}/chat`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Erreur fetch messages:', error);
    }
  };

  const envoyerMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.81:8000/api/v1/mobile/live/${liveSessionId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newMessage }),
        }
      );

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.userName}>
              {item.user.prenom} {item.user.nom}
            </Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={envoyerMessage}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  messageItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    color: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#0a0a0a',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
```

---

## 🚀 ÉTAPE 11: Lancer Tout avec Docker

### 11.1 Créer Dockerfile pour Backend

**Fichier: `Dockerfile` (à la racine)**

```dockerfile
FROM php:8.2-fpm

WORKDIR /app

# Installer les dépendances
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo pdo_mysql zip

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copier les fichiers
COPY . /app

# Installer les dépendances PHP
RUN composer install --no-dev

# Permissions
RUN chown -R www-data:www-data /app

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### 11.2 Lancer tout

```bash
# À la racine du projet
docker-compose up -d

# Vérifier
docker ps

# Migrations
docker exec rge-backend php artisan migrate

# Logs
docker logs -f nginx-rtmp-server
docker logs -f rge-backend
```

---

## ✅ ÉTAPE 12: Tests Complets

### 12.1 Vérifier Nginx-RTMP

```bash
# Vérifier que Nginx écoute sur le port 1935
docker exec nginx-rtmp-server netstat -tlnp | grep 1935
```

### 12.2 Configurer OBS

1. **Settings** → **Stream**:
   - Server: `rtmp://VOTRE_IP:1935/live`
   - Stream Key: `direct`

2. **Ajouter une scène** avec Display Capture

3. **Cliquer Start Streaming**

### 12.3 Tester l'Endpoint Admin

```bash
# Créer une session
curl -X POST http://192.168.1.81:8000/api/v1/admin/live-sessions \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Direct Louange",
    "description": "Session de louange en direct",
    "programme_id": 1,
    "debut_prevue": "2026-08-02 14:00:00"
  }'

# Récupérer la session
curl -X GET http://192.168.1.81:8000/api/v1/admin/live-sessions/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 12.4 Tester le Chat Mobile

```bash
# Envoyer un message
curl -X POST http://192.168.1.81:8000/api/v1/mobile/live/1/chat \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Super direct!"}'

# Récupérer les messages
curl -X GET http://192.168.1.81:8000/api/v1/mobile/live/1/chat \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## 📊 Endpoints Résumé

### Admin
- `POST /api/v1/admin/live-sessions` - Créer session
- `GET /api/v1/admin/live-sessions` - Lister sessions
- `GET /api/v1/admin/live-sessions/{id}` - Détail session
- `POST /api/v1/admin/live-sessions/{id}/force-stop` - Arrêter session

### Mobile
- `GET /api/v1/mobile/live` - Session actuelle
- `GET /api/v1/mobile/live/{id}/chat` - Messages du chat
- `POST /api/v1/mobile/live/{id}/chat` - Envoyer message

### Webhooks (Nginx)
- `POST /webhooks/nginx/on-publish` - Démarrage stream
- `POST /webhooks/nginx/on-publish-done` - Fin stream

---

## 🐛 Dépannage

| Problème | Solution |
|----------|----------|
| Nginx ne démarre pas | Vérifier `docker logs nginx-rtmp-server` |
| OBS ne se connecte pas | Vérifier l'IP et le port 1935 est accessible |
| HLS ne charge pas | Vérifier que les fichiers sont dans `/mnt/hls` |
| Chat ne fonctionne pas | Vérifier Pusher/Ably config |
| Mobile ne reçoit pas vidéo | Vérifier l'URL HLS et CORS |

---

**Tout est prêt! 🚀**
