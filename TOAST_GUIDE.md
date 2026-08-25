# Guide d'utilisation du Toast Context

## Prérequis

Le `ToastProvider` est déjà intégré dans `app/layout.tsx`. Aucune configuration supplémentaire n'est nécessaire.

## Utilisation basique

### 1. Import du hook

```tsx
import { useToast } from "@/context/ToastContext";
```

### 2. Dans un composant

```tsx
export default function MonComposant() {
  const toast = useToast();

  const handleAction = async () => {
    try {
      // Votre logique
      toast.success("Opération réussie");
    } catch (error) {
      toast.error("Une erreur s'est produite");
    }
  };

  return <button onClick={handleAction}>Cliquer</button>;
}
```

## API disponible

### `toast.success(message, title?, duration?)`
Affiche un toast vert de succès
```tsx
toast.success("Utilisateur créé", "Succès", 3000);
```

### `toast.error(message, title?, duration?)`
Affiche un toast rouge d'erreur (durée par défaut: 5000ms)
```tsx
toast.error("Email déjà utilisé", "Erreur");
```

### `toast.warning(message, title?, duration?)`
Affiche un toast orange d'avertissement
```tsx
toast.warning("Attention, données non sauvegardées");
```

### `toast.info(message, title?, duration?)`
Affiche un toast bleu d'information
```tsx
toast.info("Nouvelle version disponible");
```

## Exemples d'utilisation

### Formulaire avec gestion d'erreurs

```tsx
import { useToast } from "@/context/ToastContext";

export function MonFormulaire() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await apiService.create(data);
      toast.success(`${data.nom} créé avec succès`, "Création réussie");
      // Redirection ou réinitialisation du form
    } catch (err) {
      toast.error(
        err?.errorMessage || "Erreur lors de la création",
        "Erreur"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* Champs du form */}
      <button disabled={isLoading}>Enregistrer</button>
    </form>
  );
}
```

### Avec le hook `useApiCall`

```tsx
import { useApiCall } from "@/hooks/useApiCall";

export function MonComposant() {
  const { executeWithToast } = useApiCall();

  const handleDelete = async (id) => {
    const result = await executeWithToast(
      () => apiService.delete(id),
      {
        successMessage: "Élément supprimé",
        successTitle: "Suppression",
        errorMessage: "Impossible de supprimer",
      }
    );

    if (result.success) {
      // Rafraîchir la liste
    }
  };

  return <button onClick={() => handleDelete(123)}>Supprimer</button>;
}
```

### Validation de formulaire

```tsx
const handleSubmit = async (data) => {
  // Validation locale
  if (!data.email) {
    toast.warning("Email requis", "Validation");
    return;
  }

  try {
    await apiService.save(data);
    toast.success("Données sauvegardées");
  } catch (err) {
    toast.error(err.message);
  }
};
```

## Personnalisation

### Durées de display

- **Succès**: 3000ms (par défaut)
- **Erreur**: 5000ms (par défaut)
- **Avertissement/Info**: 3000ms (par défaut)
- **Pas d'auto-close**: Passer `duration: 0`

```tsx
// Toast permanent jusqu'au clic
toast.info("Message important", "Info", 0);

// Toast rapide
toast.success("Copié!", "OK", 1500);
```

## Styles disponibles

Le Toast adapte automatiquement son style selon le type:

- **success**: Fond vert (`#1E9D55`), icône CheckCircle2
- **error**: Fond rouge, icône AlertCircle
- **warning**: Fond orange, icône AlertTriangle
- **info**: Fond bleu, icône Info

## Points importants

1. **Toujours utiliser le Toast pour les retours utilisateur** plutôt que `alert()` ou `console.log()`
2. **Messages courts et clairs**: "Utilisateur créé" plutôt que "L'utilisateur a été créé dans la base de données avec succès"
3. **Titre optionnel mais recommandé** pour clarifier le contexte
4. **Pour les erreurs API**: Toujours extraire le message de l'erreur pour l'afficher à l'utilisateur
5. **Pas de toasts imbriquées**: N'appel pas toast à l'intérieur d'un toast (max 1 toast à la fois)

## Intégration avec les pages/composants existants

Toutes les pages admin qui ont des formulaires doivent utiliser le Toast:

- ✅ `app/admin/emissions/page.tsx` - Intégré
- ✅ `app/admin/animateurs/page.tsx` - À intégrer
- ✅ `app/admin/users/page.tsx` - À intégrer
- ✅ `app/admin/categories-actu/page.tsx` - À intégrer
- ✅ Tous les forms auth - Intégré

## Dépannage

### Le Toast n'apparaît pas
- Vérifier que le composant est enveloppé dans `ToastProvider` (via `layout.tsx`)
- Vérifier que `useToast()` est appelé au niveau du composant, pas en dehors

### Plusieurs toasts superposés
- Les toasts s'affichent en bas à droite en pile
- Ils disparaissent après la durée définie

### Erreur "useToast must be used within ToastProvider"
- S'assurer que le composant est un client component (`"use client"`)
- Vérifier que le layout inclut `<ToastProvider>`
