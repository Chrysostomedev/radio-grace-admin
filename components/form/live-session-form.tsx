'use client';

import { useState } from 'react';
import { CreateLiveSessionDTO } from '@/services/liveSessionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface LiveSessionFormProps {
  onSubmit: (data: CreateLiveSessionDTO) => Promise<void>;
  initialData?: CreateLiveSessionDTO;
  loading?: boolean;
  onCancel?: () => void;
}

/**
 * Formulaire de création/édition d'une session live
 */
export function LiveSessionForm({
  onSubmit,
  initialData,
  loading = false,
  onCancel,
}: LiveSessionFormProps) {
  const [formData, setFormData] = useState<CreateLiveSessionDTO>(
    initialData || {
      titre: '',
      description: '',
      programme_id: undefined,
      animateur_id: undefined,
      debut_prevue: '',
    }
  );

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      setFormData({
        titre: '',
        description: '',
        programme_id: undefined,
        animateur_id: undefined,
        debut_prevue: '',
      });
    } catch (error) {
      console.error('Erreur submission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre du direct *
        </label>
        <Input
          type="text"
          name="titre"
          placeholder="ex: Direct Louange Matinale"
          value={formData.titre}
          onChange={handleChange}
          disabled={loading || submitting}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          name="description"
          placeholder="Décrivez le contenu du direct..."
          value={formData.description || ''}
          onChange={handleChange}
          disabled={loading || submitting}
          className="w-full min-h-24"
        />
      </div>

      {/* Début prévu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date/Heure de début
        </label>
        <Input
          type="datetime-local"
          name="debut_prevue"
          value={formData.debut_prevue || ''}
          onChange={handleChange}
          disabled={loading || submitting}
          className="w-full"
        />
      </div>

      {/* Programme ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Programme associé
        </label>
        <Input
          type="number"
          name="programme_id"
          placeholder="ID du programme (optionnel)"
          value={formData.programme_id || ''}
          onChange={handleChange}
          disabled={loading || submitting}
          className="w-full"
        />
      </div>

      {/* Animateur ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Animateur
        </label>
        <Input
          type="number"
          name="animateur_id"
          placeholder="ID de l'animateur (optionnel)"
          value={formData.animateur_id || ''}
          onChange={handleChange}
          disabled={loading || submitting}
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading || submitting || !formData.titre.trim()}
          className="flex-1"
        >
          {submitting ? '⏳ Création...' : '🎬 Créer Session'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || submitting}
          >
            Annuler
          </Button>
        )}
      </div>

      {/* Aide */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        <p className="font-medium mb-1">💡 Comment ça marche:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Remplissez le formulaire ci-dessus</li>
          <li>Cliquez sur "Créer Session"</li>
          <li>Vous recevrez l'URL RTMP et la Stream Key</li>
          <li>Configurez OBS avec ces informations</li>
          <li>Lancez le stream depuis OBS</li>
          <li>Le direct apparaîtra automatiquement sur l'app mobile</li>
        </ol>
      </div>
    </form>
  );
}
