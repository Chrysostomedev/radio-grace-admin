"use client";
import { useEffect, useState, useCallback } from "react";
import { actualiteService, Actualite } from "@/services/admin/actualite.service";

export function useActualites(initialPage = 1) {
  const [data, setData] = useState<Actualite[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", statut: "", categorie_id: undefined as number | undefined });

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res: any = await actualiteService.list({ ...filters, page, per_page: 12 });
      // Laravel Resource: res.data = [], res.meta
      setData(res.data || res.data?.data || res);
      setMeta(res.meta || { current_page: page, last_page: 1, total: res.data?.length || 0 });
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetch(1); }, [fetch]);

  return { data, meta, loading, filters, setFilters, fetch };
}