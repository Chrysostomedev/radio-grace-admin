import { useToast } from "@/context/ToastContext";
import { useCallback } from "react";

/**
 * Hook pour wrapper des appels API avec gestion automatique des toasts
 */
export function useApiCall() {
  const toast = useToast();

  const executeWithToast = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      options?: {
        successMessage?: string;
        successTitle?: string;
        errorMessage?: string;
        errorTitle?: string;
        showSuccess?: boolean;
      }
    ): Promise<{ success: boolean; data?: T; error?: any }> => {
      try {
        const data = await apiCall();
        
        if (options?.showSuccess !== false) {
          toast.success(
            options?.successMessage || "Opération réussie",
            options?.successTitle || "Succès"
          );
        }
        
        return { success: true, data };
      } catch (err: any) {
        const errorMsg = err?.errorMessage || err?.message || "Une erreur est survenue";
        toast.error(
          options?.errorMessage || errorMsg,
          options?.errorTitle || "Erreur"
        );
        return { success: false, error: err };
      }
    },
    [toast]
  );

  return { executeWithToast };
}
