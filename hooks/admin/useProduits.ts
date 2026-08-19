"use client";
import { useCallback, useEffect, useState } from "react";
import { produitService } from "@/services/admin/produit.service";

export function useProduits() {
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("all");
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await produitService.getAll({ search: search||undefined, categorie: categorie!=="all"?categorie:undefined, page, per_page: 20 });
      setProduits(res.data.data || []);
    } finally { setLoading(false); }
  }, [search, categorie, page]);

  useEffect(()=>{ fetch(); },[fetch]);
  return { produits, loading, search, setSearch, categorie, setCategorie, refresh: fetch };
}