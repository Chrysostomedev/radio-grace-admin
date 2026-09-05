'use client';

import { useQuery } from '@tanstack/react-query';
import { auditeurService, type Auditeur, type AuditeurDetail } from '@/services/admin/auditeur.service';

/**
 * Hook pour récupérer la liste des auditeurs
 */
export function useAuditeurs(page: number = 1, search: string = "") {
  return useQuery({
    queryKey: ['auditeurs', page, search],
    queryFn: () => auditeurService.getAll(page, search),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

/**
 * Hook pour récupérer les détails d'un auditeur
 */
export function useAuditeurDetail(id: number | null) {
  return useQuery({
    queryKey: ['auditeur', id],
    queryFn: () => {
      if (!id) throw new Error('ID manquant');
      return auditeurService.getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
