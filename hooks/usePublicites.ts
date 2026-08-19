import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicitesService } from "@/services/publicites.service";

export const usePublicites = (position?: string) => {
  return useQuery({
    queryKey: ["publicites", position],
    queryFn: () => publicitesService.getPublicites(position),
  });
};

export const useCreatePublicite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => publicitesService.createPublicite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicites"] });
    },
  });
};

export const useUpdatePublicite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      publicitesService.updatePublicite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicites"] });
    },
  });
};

export const useDeletePublicite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => publicitesService.deletePublicite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicites"] });
    },
  });
};
