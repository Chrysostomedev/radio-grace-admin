# Guide: Upload Asynchrone des Podcasts vers Cloudflare R2

## Vue d'ensemble

L'upload des fichiers audio de podcasts fonctionne en **2 étapes asynchrones** pour éviter les timeouts et réduire la charge sur le VPS:

```
Frontend → Backend (multipart) → Stockage local temp
                                     ↓
                           Redis Job Queue
                                     ↓
                           Upload vers R2
                                     ↓
                        Mise à jour status
```

## Flux détaillé

### 1. Frontend - Formulaire de création/modification

**Fichier:** `components/form/podcast-form.tsx`

```tsx
// L'utilisateur charge un fichier audio
const handleAudioChange = (file) => {
  setAudioFile(file);
  setAudioPreview(audioBlob);
  // Récupérer la durée automatiquement
};

// À la soumission
const onSubmitForm = (data) => {
  const fd = new FormData();
  // ...
  
  if (audioFile) {
    fd.append("audio_url", audioFile);
    setAudioUploadStatus("uploading");
  }
  
  await onSubmit(fd); // Envoie au backend
  
  // Message info au user
  toast.info("Podcast créé. L'audio s'upload en arrière-plan...");
};
```

### 2. Backend - Réception et mise en queue

**Fichier:** `app/Http/Controllers/Api/V1/Admin/PodcastController.php`

```php
public function store(PodcastRequest $request)
{
    $data = $request->validated();
    $data['audio_status'] = 'EN_COURS'; // Par défaut
    
    $tempAudioPath = null;
    if ($request->hasFile('audio_url')) {
        $file = $request->file('audio_url');
        
        // 1. Stocker temporairement sur disque local
        $tempAudioPath = $this->uploadService->storeTemp($file);
        $audioExtension = $file->getClientOriginalExtension();
        
        // 2. NE PAS ajouter audio_url au $data
        // (il sera rempli par le job quand upload R2 réussi)
        unset($data['audio_url']);
        $data['audio_status'] = 'EN_COURS';
    }
    
    // 3. Créer le podcast avec audio_status='EN_COURS'
    $podcast = Podcast::create($data);
    
    // 4. Dispatcher le job asynchrone
    if ($tempAudioPath) {
        UploadPodcastAudioJob::dispatch($podcast->id, $tempAudioPath, $audioExtension);
    }
    
    return new PodcastResource($podcast);
}
```

### 3. Job - Upload vers R2

**Fichier:** `app/Jobs/UploadPodcastAudioJob.php`

Le job s'exécute en arrière-plan via la **Redis queue worker**:

```php
class UploadPodcastAudioJob implements ShouldQueue
{
    public int $tries = 3;      // Retry 3 fois en cas d'erreur
    public int $backoff = 30;   // Attendre 30s entre les tentatives
    
    public function handle(): void
    {
        $podcast = Podcast::find($this->podcastId);
        
        try {
            // Lire le fichier depuis le disque local/temp
            $stream = Storage::disk('local')->readStream($this->tempPath);
            
            // Générer une key unique
            $key = 'podcasts/audio/' . Str::uuid() . '.' . $this->extension;
            
            // Upload vers R2
            Storage::disk('r2')->put($key, $stream, 'public');
            
            // Récupérer l'URL publique R2
            $url = Storage::disk('r2')->url($key);
            
            // Mettre à jour le podcast
            $podcast->update([
                'audio_url' => $url,
                'audio_status' => 'PRET',  // ✓ Upload réussi
            ]);
        } catch (\Throwable $e) {
            // En cas d'erreur, relancer (retry automatique)
            throw $e;
        } finally {
            // TOUJOURS nettoyer le fichier local
            Storage::disk('local')->delete($this->tempPath);
        }
    }
    
    public function failed(\Throwable $exception): void
    {
        // Après 3 tentatives échouées, marquer comme ECHEC
        Podcast::where('id', $this->podcastId)
            ->update(['audio_status' => 'ECHEC']);
    }
}
```

### 4. Worker - Écoute la queue

**Docker Compose:** `docker-compose.yml`

```yaml
queue-worker:
  build:
    context: .
    dockerfile: Dockerfile
  command: php artisan queue:work redis --tries=3 --timeout=300
  # Écoute la Redis queue et exécute les jobs
```

## États d'un Podcast

```
audio_status = 'EN_COURS'   # Upload en cours
audio_status = 'PRET'       # Upload réussi, URL R2 disponible
audio_status = 'ECHEC'      # Upload échoué après 3 tentatives
```

## Configuration Requise

### .env
```bash
QUEUE_CONNECTION=redis      # La queue utilise Redis
REDIS_HOST=redis           # Host Redis
REDIS_PORT=6379

R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=rge-podcasts
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_URL=https://<domaine-public-ou-cdn>
```

### Config
```php
// config/filesystems.php
'r2' => [
    'driver' => 's3',
    'region' => 'auto',
    'bucket' => env('R2_BUCKET'),
    'key' => env('R2_ACCESS_KEY_ID'),
    'secret' => env('R2_SECRET_ACCESS_KEY'),
    'endpoint' => env('R2_ENDPOINT'),
    'url' => env('R2_URL'),
]
```

## Frontend - Affichage du statut

**Fichier:** `app/Http/Resources/PodcastResource.php`

```php
return [
    'id' => $this->id,
    'titre' => $this->titre,
    'audio_url' => $this->audio_url, // NULL tant que EN_COURS
    'audio_status' => $this->audio_status, // EN_COURS|PRET|ECHEC
    // ...
];
```

Dans `components/form/podcast-form.tsx`, afficher le statut:

```tsx
{audioUploadStatus === "uploading" && (
  <span className="text-xs text-blue-600">
    (Upload en cours...)
  </span>
)}
```

## Workflow Complet - Scénario

### 1. Admin upload un podcast
```
Frontend: "Créer podcast" → Charge audio.mp3 → Envoie FormData
Toast: "Podcast créé. L'audio s'upload en arrière-plan..."
```

### 2. Backend reçoit et met en queue
```
Backend: 
  - Stocke audio.mp3 en /storage/app/temp/podcasts/uuid.mp3
  - Crée Podcast(titre, audio_status='EN_COURS')
  - Dispatch UploadPodcastAudioJob
  - Retourne PodcastResource(audio_url=null, audio_status='EN_COURS')
```

### 3. Queue worker traite le job
```
Redis Queue:
  1. Lit /storage/app/temp/podcasts/uuid.mp3
  2. Upload vers R2: podcasts/audio/new-uuid.mp3
  3. Récupère URL: https://r2-url/podcasts/audio/new-uuid.mp3
  4. UPDATE podcast SET audio_url='https://...', audio_status='PRET'
  5. Supprime /storage/app/temp/podcasts/uuid.mp3
```

### 4. Frontend affiche l'audio
```
GET /admin/podcasts/{id}
PodcastResource:
  audio_url: "https://r2-url/podcasts/audio/..."
  audio_status: "PRET"
  
Frontend affiche <audio src="..." controls />
```

## Gestion des Erreurs

### Erreur réseau R2 (retry automatique)
```
Tentative 1: ÉCHEC
Wait 30s...
Tentative 2: ÉCHEC
Wait 30s...
Tentative 3: ÉCHEC

Après 3 tentatives: audio_status='ECHEC'
Admin voit le podcast avec audio_status='ECHEC'
```

### Vérifier les logs du queue worker
```bash
docker-compose logs -f rge-queue-worker
```

## Performance

- **VPS:** Les uploads n'utilisent plus la bande passante du VPS
- **Frontend:** Pas de timeout (upload asynchrone)
- **Stockage:** Les fichiers résident sur R2 (80% moins cher que VPS)
- **Scalabilité:** Ajouter plus de workers si besoin

## Tests

### Test local (dev)

```bash
# 1. Vérifier la queue
docker-compose exec backend php artisan queue:failed

# 2. Écouter la queue en direct
docker-compose exec queue-worker tail -f /app/storage/logs/laravel.log

# 3. Forcer un job à échouer
# Dans UploadPodcastAudioJob::handle():
//   throw new Exception("Test");
# Puis observer failed()
```

### Test de statut

```bash
# Frontend - Vérifier audio_status
curl http://localhost:8000/api/v1/admin/podcasts
# Réponse:
# { "audio_status": "EN_COURS" }  # En cours
# { "audio_status": "PRET" }      # Prêt
# { "audio_status": "ECHEC" }     # Échoué
```

## Points Importants

1. **JAMAIS** synchrone: L'audio n'est jamais envoyé directement vers R2 depuis le frontend
2. **TOUJOURS** nettoyer: Les fichiers temp sont supprimés même en cas d'erreur
3. **Retry intelligent**: 3 tentatives avec délai croissant avant abandon
4. **UX transparente**: L'admin voit le podcast créé immédiatement (audio_status='EN_COURS')
5. **Redis queue**: Requis pour fonctionner (configure dans .env)

## Troubleshooting

### Queue worker ne démarre pas
```bash
docker-compose up rge-queue-worker
# Vérifier les logs
docker-compose logs rge-queue-worker
```

### Audio n'upload pas vers R2
```bash
# Vérifier les credentials R2
cat .env | grep R2_

# Vérifier le statut du podcast
SELECT id, audio_status FROM podcasts;

# Vérifier les jobs échoués
php artisan queue:failed
```

### Storage disk 'r2' not found
```bash
# Vérifier config/filesystems.php
grep -A 10 "'r2'" config/filesystems.php

# Si absent, ajouter la config et relancer
docker-compose restart backend queue-worker
```
