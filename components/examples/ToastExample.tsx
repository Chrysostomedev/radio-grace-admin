"use client";

import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";

/**
 * Exemple de composant utilisant le Toast Context
 * À utiliser comme référence pour intégrer les toasts dans d'autres pages
 */
export function ToastExample() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Opération réussie!", "Succès");
  };

  const handleError = () => {
    toast.error("Une erreur s'est produite", "Erreur");
  };

  const handleWarning = () => {
    toast.warning("Attention à cette action", "Avertissement");
  };

  const handleInfo = () => {
    toast.info("Information importante", "Info");
  };

  return (
    <div className="space-y-3">
      <Button onClick={handleSuccess} variant="default">
        Toast Success
      </Button>
      <Button onClick={handleError} variant="destructive">
        Toast Error
      </Button>
      <Button onClick={handleWarning} variant="outline">
        Toast Warning
      </Button>
      <Button onClick={handleInfo} variant="secondary">
        Toast Info
      </Button>
    </div>
  );
}
