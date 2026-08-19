"use client";
import { useCallback, useEffect, useState } from "react";
import { evenementService } from "@/services/admin/evenement.service";

export function useEvenements() {
  const [evenements, setEvenements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreType, setFiltreType] = useState<string>("all");
  const [filtreStatut, setFiltreStatut] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 50 };
      if (filtreType !== "all") params.type = filtreType;
      if (filtreStatut !== "all") params.statut = filtreStatut;
      const res = await evenementService.getAll(params);
      const payload = res.data;
      const list = payload.data ?? payload ?? [];
      setEvenements(Array.isArray(list) ? list : []);
      setLastPage(payload.last_page ?? 1);
    } catch(e) {
      console.error(e);
      setEvenements([]);
    } finally {
      setLoading(false);
    }
  }, [filtreType, filtreStatut, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { evenements, loading, filtreType, setFiltreType, filtreStatut, setFiltreStatut, page, setPage, lastPage, refresh: fetch, create: evenementService.create, update: evenementService.update, remove: evenementService.remove };
}