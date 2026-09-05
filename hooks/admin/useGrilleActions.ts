'use client';

import { useState } from 'react';
import { programmeGrillesService } from '@/services/admin/programme-grilles.service';
import { toast } from 'sonner';
import type { ProgrammeGrille } from '@/types/admin';

/**
 * Hook pour gérer les actions sur les créneaux de grille:
 * - Déplacer 1h avant/après
 * - Supprimer un créneau
 * - Editer un créneau
 */
export function useGrilleActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Déplace un créneau de 1 heure avant (- 1h)
   * @param creneau - Le créneau à déplacer
   * @param onSuccess - Callback après succès (pour rafraîchir la grille)
   */
  const moveCreneauBefore = async (creneau: ProgrammeGrille, onSuccess?: () => void) => {
    setIsLoading(true);
    try {
      const startMinutes = parseInt(creneau.heure_debut?.split(':')[0] || '0') * 60;
      
      // Vérifier qu'on peut déplacer avant (pas avant 00:00)
      if (startMinutes < 60) {
        toast.error('Impossible de déplacer avant 00:00');
        return;
      }

      const newStartHour = String(Math.floor((startMinutes - 60) / 60)).padStart(2, '0');
      const endMinutes = parseInt(creneau.heure_fin?.split(':')[0] || '1') * 60;
      const newEndHour = String(Math.floor((endMinutes - 60) / 60)).padStart(2, '0');

      const newStart = `${newStartHour}:00`;
      const newEnd = `${newEndHour}:00`;

      // Appeler l'endpoint PUT avec TOUS les champs requis
      // Le backend valide: programme_id, jour, heure_debut, heure_fin, is_rediffusion
      await programmeGrillesService.update(creneau.id, {
        programme_id: creneau.programme_id,
        jour: creneau.jour,
        heure_debut: newStart,
        heure_fin: newEnd,
        is_rediffusion: creneau.is_rediffusion,
      });

      toast.success(`"${creneau.programme?.titre || 'Créneau'}" déplacé 1h avant`);
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Erreur déplacement';
      toast.error(errorMsg);
      console.error('Move before error:', error?.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déplace un créneau de 1 heure après (+ 1h)
   * @param creneau - Le créneau à déplacer
   * @param onSuccess - Callback après succès (pour rafraîchir la grille)
   */
  const moveCreneauAfter = async (creneau: ProgrammeGrille, onSuccess?: () => void) => {
    setIsLoading(true);
    try {
      const startMinutes = parseInt(creneau.heure_debut?.split(':')[0] || '0') * 60;
      
      // Vérifier qu'on peut déplacer après (pas après 23:00)
      if (startMinutes >= 23 * 60) {
        toast.error('Impossible de déplacer après 23:00');
        return;
      }

      const newStartHour = String(Math.floor((startMinutes + 60) / 60)).padStart(2, '0');
      const endMinutes = parseInt(creneau.heure_fin?.split(':')[0] || '1') * 60;
      const newEndHour = String(Math.floor((endMinutes + 60) / 60)).padStart(2, '0');

      const newStart = `${newStartHour}:00`;
      const newEnd = `${newEndHour}:00`;

      // Appeler l'endpoint PUT avec TOUS les champs requis
      // Le backend valide: programme_id, jour, heure_debut, heure_fin, is_rediffusion
      await programmeGrillesService.update(creneau.id, {
        programme_id: creneau.programme_id,
        jour: creneau.jour,
        heure_debut: newStart,
        heure_fin: newEnd,
        is_rediffusion: creneau.is_rediffusion,
      });

      toast.success(`"${creneau.programme?.titre || 'Créneau'}" déplacé 1h après`);
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Erreur déplacement';
      toast.error(errorMsg);
      console.error('Move after error:', error?.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Supprime un créneau
   * @param creneau - Le créneau à supprimer
   * @param onSuccess - Callback après succès (pour rafraîchir la grille)
   */
  const deleteCreneau = async (creneau: ProgrammeGrille, onSuccess?: () => void) => {
    setIsLoading(true);
    try {
      // Appeler l'endpoint DELETE
      await programmeGrillesService.delete(creneau.id);

      toast.success(`"${creneau.programme?.titre || 'Créneau'}" supprimé`);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Erreur suppression');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Edite un créneau (jours, heures, rediffusion)
   * @param creneau - Le créneau à éditer
   * @param updates - Les champs à mettre à jour
   * @param onSuccess - Callback après succès (pour rafraîchir la grille)
   */
  const editCreneau = async (
    creneau: ProgrammeGrille,
    updates: Partial<{
      jour: string;
      heure_debut: string;
      heure_fin: string;
      is_rediffusion: boolean;
    }>,
    onSuccess?: () => void
  ) => {
    setIsLoading(true);
    try {
      // Construire le payload avec TOUS les champs requis
      // Le backend valide: programme_id, jour, heure_debut, heure_fin, is_rediffusion
      const payload = {
        programme_id: creneau.programme_id,
        jour: updates.jour || creneau.jour,
        heure_debut: updates.heure_debut || creneau.heure_debut,
        heure_fin: updates.heure_fin || creneau.heure_fin,
        is_rediffusion: updates.is_rediffusion !== undefined ? updates.is_rediffusion : creneau.is_rediffusion,
      };

      // Appeler l'endpoint PUT avec tous les champs
      await programmeGrillesService.update(creneau.id, payload);

      toast.success(`Créneau modifié`);
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Erreur modification';
      toast.error(errorMsg);
      console.error('Edit error:', error?.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    moveCreneauBefore,
    moveCreneauAfter,
    deleteCreneau,
    editCreneau,
  };
}
