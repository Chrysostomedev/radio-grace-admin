'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/axios';

export interface CategorieActu {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export function useCategorieActuQuery() {
  return useQuery<CategorieActu[]>({
    queryKey: ['categories-actu'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/categories-actu');
      return response.data.data || response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
