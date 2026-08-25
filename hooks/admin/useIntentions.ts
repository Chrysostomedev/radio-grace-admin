"use client";
import { useCallback, useEffect, useState } from "react";
import { intentionService } from "@/services/admin/intention.service";

export function useIntentions() {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState("all");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await intentionService.getAll({ statut: statut!== "all"? statut : undefined, page, per_page: 20 });
      setIntentions(res.data.data || []);
    } finally { setLoading(false); }
  }, [statut, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const markAsPrie = async (id: number, s: string = "PRIE") => {
    await intentionService.updateStatut(id, s);
  };

  const refresh = async () => {
    await fetch();
  };

  return { intentions, loading, statut, setStatut, markAsPrie, refresh };
}