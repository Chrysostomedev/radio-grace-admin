# 📹 Guide Complet: Configuration OBS pour Radio Grâce-Espoir

## 🎯 Objectif
Configurer OBS (Open Broadcaster Software) pour envoyer un flux RTMP vers le serveur Nginx dans Docker.

---

## PART 1: Installation & Lancement OBS

### Étape 1.1: Télécharger OBS
- **Windows**: https://obsproject.com/download
- **macOS**: https://obsproject.com/download
- **Linux**: `sudo apt install obs-studio`

### Étape 1.2: Lancer OBS
Cliquer sur l'application pour lancer

### Étape 1.3: Configuration Initiale
À la première ouverture:
1. Choisir la langue: **Français** (si disponible)
2. Cliquer **Next** sur l'assistant de configuration
3. Sélectionner "Je vais streamer vers un serveur personnalisé"

---

## PART 2: Configurer le Serveur de Stream

### Étape 2.1: Accéder aux Paramètres
1. **Fichier** → **Paramètres** (ou **File** → **Settings**)
2. Dans le panneau de gauche, cliquer sur **Stream**

### Étape 2.2: Configurer la Cible RTMP

| Paramètre | Valeur |
|-----------|--------|
| **Service** | Custom (Personnalisé) |
| **Serveur** | `rtmp://192.168.1.81:1935/live` |
| **Clé de flux** | `direct` |

**Attention**: Remplacer `192.168.1.81` par votre IP locale si différente!

```
RTMP URL complet: rtmp://192.168.1.81:1935/live/direct
```

### Étape 2.3: Configurer l'Audio
1. Aller à **Paramètres** → **Audio**
2. Configuration recommandée:

| Paramètre | Valeur |
|-----------|--------|
| **Appareil de microphone** | Votre micro |
| **Appareil audio de bureau** | Système audio |
| **Fréquence d'échantillonnage** | 48 kHz |
| **Canaux** | Stéréo |

### Étape 2.4: Configurer l'Encodage
1. Aller à **Paramètres** → **Sortie**
2. Mode: **Avancé**
3. Section **Streaming**:

| Paramètre | Valeur |
|-----------|--------|
| **Encodeur** | `x264` (CPU) ou `NVIDIA NVENC` (si GPU) |
| **Débit vidéo** | 2500 kbps |
| **Limite de débit** | 3000 kbps |
| **Taille de buffer** | 6000 kbps |
| **Qualité CPU** | veryfast (rapide) |
| **Profil** | Main |
| **Niveau** | auto |

**Section Audio**:

| Paramètre | Valeur |
|-----------|--------|
| **Encodeur audio** | AAC (LC) |
| **Débit audio** | 128 kbps |

### Étape 2.5: Cliquer "Appliquer" et "OK"

---

## PART 3: Créer une Scène

### Étape 3.1: Créer une Nouvelle Scène
1. Dans le panneau en bas à gauche **Scènes**
2. Cliquer **+** (plus)
3. Donner un nom: `Direct Louange`
4. Cliquer **OK**

### Étape 3.2: Ajouter une Source Vidéo
Dans le panneau **Sources**, cliquer **+** (plus) et choisir:

#### Option A: Capture d'Écran (Bureau)
1. **Capture d'écran**
2. Nom: `Écran Principal`
3. Choisir le moniteur à capturer
4. Cliquer **OK**
5. Redimensionner dans la prévisualisation

#### Option B: Capture de Fenêtre
1. **Capture de fenêtre**
2. Sélectionner la fenêtre de l'application
3. Cliquer **OK**

#### Option C: Fichier Vidéo
1. **Source multimédia**
2. Parcourir et sélectionner un fichier vidéo
3. Cliquer **OK**

#### Option D: Webcam
1. **Webcam**
2. Choisir votre webcam
3. Cliquer **OK**

### Étape 3.3: Ajouter du Texte (Optionnel)
1. Dans **Sources**, cliquer **+**
2. **Texte (GDI+)** ou **Texte (FreeType2)**
3. Écrire le titre: `EN DIRECT - RADIO GRÂCE-ESPOIR`
4. Positionner en haut

### Étape 3.4: Ajouter un Logo (Optionnel)
1. Dans **Sources**, cliquer **+**
2. **Image**
3. Sélectionner le logo PNG
4. Cliquer **OK**
5. Redimensionner et positionner

---

## PART 4: Configurer l'Audio

### Étape 4.1: Mixer Audio
En bas, le panneau **Audio Mixer** affiche:
- Microphone
- Audio de bureau
- Autres sources

### Étape 4.2: Vérifier les Niveaux
- Les barres vertes doivent être entre -20dB et -3dB
- Rouge = écrêtage (trop fort)
- Gris = silencieux

### Étape 4.3: Ajuster les Niveaux
- Cliquer sur le **slider** du microphone/bureau
- Ou cliquer sur l'engrenage ⚙️ pour plus d'options

---

## PART 5: Configurer les Hotkeys (Raccourcis)

### Étape 5.1: Accéder aux Hotkeys
1. **Fichier** → **Paramètres**
2. Gauche: **Hotkeys**

### Étape 5.2: Ajouter des Raccourcis
| Action | Raccourci Suggéré |
|--------|------------------|
| Start Streaming | F10 |
| Stop Streaming | F11 |
| Mute Microphone | M |
| Show/Hide Sources | H |

### Étape 5.3: Définir un Hotkey
1. Cliquer dans le champ **+ (Créer nouveau)**
2. Appuyer sur la touche désirée (ex: F10)
3. Cliquer **OK**

---

## PART 6: Test Avant le Direct

### Étape 6.1: Vérifier la Configuration
1. Prévisualisation: Vérifier que tout apparaît bien
2. Audio Mixer: Vérifier les niveaux
3. Sources: Vérifier que tous les éléments sont là

### Étape 6.2: Test de Connexion (Optionnel)
1. Cliquer **Démarrer le flux** (en bas à droite)
2. Attendre 5-10 secondes
3. Vérifier les logs en bas à gauche
4. Cliquer **Arrêter le flux**

### Étape 6.3: Vérifier les Logs
En bas à gauche, cliquer **Affichage du journal** pour voir:
- Connexion établie ✅
- Encodage vidéo
- Vitesse du flux

---

## PART 7: Lancer le Direct

### Étape 7.1: Préparer la Scène
1. Mettre en place toutes les sources
2. Tester l'audio
3. Vérifier les niveaux

### Étape 7.2: Créer la Session Admin
Via API:
```bash
curl -X POST http://192.168.1.81:8000/api/v1/admin/live-sessions \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Direct Louange",
    "description": "Session de louange en direct",
    "programme_id": 1
  }'
```

**Réponse**: Vous recevez:
```json
{
  "id": 1,
  "stream_key": "stream_abc123",
  "rtmp_url": "rtmp://192.168.1.81:1935/live/stream_abc123",
  "hls_url": "http://192.168.1.81:8080/hls/stream_abc123/index.m3u8"
}
```

### Étape 7.3: Mettre à Jour OBS
1. Dans **Paramètres** → **Stream**
2. Changer la **Clé de flux** avec la valeur reçue
   - Ancienne: `direct`
   - Nouvelle: `stream_abc123`
3. Cliquer **Appliquer** et **OK**

### Étape 7.4: Lancer le Stream
**Option A:** Cliquer le bouton **Démarrer le flux** (bas droit)

**Option B:** Appuyer sur **F10** (si configuré)

### Étape 7.5: Vérifier que tout fonctionne
1. Logs OBS en bas à gauche: Vérifier les messages
2. Mobile app: Aller à l'onglet **Live** et vérifier la vidéo
3. Chat: Envoyer un message de test

---

## PART 8: Pendant le Direct

### Gestion des Scènes
- Bouton bas gauche **Scènes**
- Double-cliquer pour changer de scène en direct

### Contrôles Audio
- Utiliser le **Mixer Audio** pour ajuster en direct
- Mute: Cliquer sur le micro-icon
- Réduire le débit si trop fort

### Monitorer le Stream
- Onglet bas gauche **Affichage du journal**
- Vérifier les FPS, bitrate, drops

---

## PART 9: Terminer le Direct

### Étape 9.1: Arrêter le Stream OBS
**Option A:** Cliquer **Arrêter le flux**

**Option B:** Appuyer sur **F11**

### Étape 9.2: Arrêter la Session Admin
Via API:
```bash
curl -X POST http://192.168.1.81:8000/api/v1/admin/live-sessions/1/force-stop \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

### Étape 9.3: Vérifier les Stats
API pour récupérer les infos:
```bash
curl -X GET http://192.168.1.81:8000/api/v1/admin/live-sessions/1 \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

Résultat:
```json
{
  "statut": "TERMINEE",
  "duree_secondes": 1845,
  "auditeurs_total": 42,
  "auditeurs_actifs": 0
}
```

---

## 🎛️ Profils Recommandés

### Profil QUALITÉ (Connexion Rapide)
```
Résolution: 1920x1080
FPS: 30
Bitrate: 5000-8000 kbps
Encodeur: x264 ou GPU
```

### Profil ÉQUILIBRÉ (Recommandé)
```
Résolution: 1280x720
FPS: 30
Bitrate: 2500 kbps
Encodeur: x264
```

### Profil LÉGER (Mauvaise Connexion)
```
Résolution: 854x480
FPS: 24
Bitrate: 1000-1500 kbps
Encodeur: x264
```

---

## 🔧 Dépannage Courant

| Problème | Cause | Solution |
|----------|-------|----------|
| OBS ne se connecte pas | Mauvaise URL/clé | Vérifier IP et port |
| Stream lag | Bitrate trop haut | Réduire à 2500 kbps |
| Audio absent | Périphérique non configuré | Vérifier Paramètres → Audio |
| Écran noir | Source mal configurée | Vérifier la source vidéo |
| CPU 100% | Encodeur CPU surchargé | Utiliser GPU ou réduire résolution |
| Mobile voit rien | HLS pas généré | Vérifier Docker logs |

---

## 📱 Test Mobile

1. Ouvrir l'app mobile
2. Aller à **Accueil** → **Live**
3. Devrait afficher:
   - Titre du direct
   - Bouton lecture vidéo
   - Nombre d'auditeurs
   - Zone chat

---

**C'est bon! Vous êtes prêt à faire un direct! 🎉**
