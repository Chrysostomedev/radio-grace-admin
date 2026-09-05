'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type UserProfile, type UpdateProfilePayload, type UpdatePasswordPayload } from '@/services/admin/profile.service';
import { toast } from 'sonner';

/**
 * Hook pour gérer le profil utilisateur (admin/rédacteur/animateur)
 * - Récupérer le profil
 * - Mettre à jour les infos
 * - Changer le mot de passe
 */
export function useProfile() {
  const queryClient = useQueryClient();

  // Récupérer le profil
  const profileQuery = useQuery<{ success: boolean; data?: UserProfile }>({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // Mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (response) => {
      // Invalider le cache du profil pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(response.message || 'Profil mis à jour avec succès');
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      toast.error(errorMsg);
    },
  });

  // Changer le mot de passe
  const updatePasswordMutation = useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => profileService.updatePassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Mot de passe mis à jour avec succès');
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(errorMsg);
    },
  });

  return {
    // Query pour récupérer le profil
    profile: profileQuery.data?.data,
    isLoadingProfile: profileQuery.isLoading,
    isErrorProfile: profileQuery.isError,
    errorProfile: profileQuery.error,

    // Mutation pour mettre à jour le profil
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Mutation pour changer le mot de passe
    updatePassword: updatePasswordMutation.mutate,
    isUpdatingPassword: updatePasswordMutation.isPending,
  };
}
