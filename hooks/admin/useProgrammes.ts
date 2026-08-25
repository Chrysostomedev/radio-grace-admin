"use client";

import { useState, useEffect, useCallback } from "react";
import { programmeService } from "@/services/admin/programme.service";
import type { Programme, ProgrammeCategorie } from "@/types/admin";
import axios from "@/core/axios";

export function useProgrammes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState<ProgrammeCategorie | "all">("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetch = useCallback(async () => {
  setLoading(true);
  try {
    const params: any = {
      page,
      per_page: 12,
    };
    if (search && search.trim() !== "") params.search = search;
    if (categorie && categorie !== "all") params.categorie = categorie; // <- NE JAMAIS ENVOYER "all"

    const res = await programmeService.getAll(params);
    console.log("RAW programmes response", res.data); // <- regarde ça dans ta console

    const payload = res.data;
    const list = payload.data ?? payload ?? [];
    setProgrammes(Array.isArray(list) ? list : []);
    setLastPage(payload.last_page ?? 1);
  } catch (e: any) {
    console.error("Erreur fetch programmes", e.response?.data || e);
    setProgrammes([]);
  } finally {
    setLoading(false);
  }
}, [search, categorie, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search, categorie]);

  const create = async (fd: FormData) => {
    try {
      const { data } = await programmeService.create(fd);
      await fetch();
      // Toast appelé dans la page, pas ici
      return data.data;
    } catch (err: any) {
      throw err; // La page gérera le toast
    }
  };

  const update = async (id: number, fd: FormData) => {
    try {
      const { data } = await programmeService.update(id, fd);
      await fetch();
      return data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const remove = async (id: number) => {
    try {
      await programmeService.delete(id);
      await fetch();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    programmes, loading, error, fetch,
    search, setSearch,
    categorie, setCategorie,
    page, setPage, lastPage,
    create, update, remove,
  };
}




export const useProgramme = (id: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if(!id) return;
    setLoading(true);
    axios.get(`/admin/programmes/${id}`).then(r => {
      const p = r.data.data || r.data;
      setData(p);
    }).finally(() => setLoading(false));
  }, [id]);
  return { data, loading };
}

export const useAnimateurs = () => {
  const [animateurs, setAnimateurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimateurs = async () => {
      setLoading(true);
      setError(null);
      try {
        // per_page=-1 retourne tous les animateurs sans pagination
        const res = await axios.get("/admin/animateurs?per_page=-1");
        console.log("✅ Animateurs API response:", res);
        const data = res.data?.data || res.data || [];
        console.log("✅ Animateurs data parsed:", data);
        console.log("✅ Is array?", Array.isArray(data), "Length:", data.length);
        setAnimateurs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Erreur chargement animateurs:", err);
        console.error("Status:", err.status);
        console.error("Message:", err.errorMessage);
        console.error("Response data:", err);
        setError(err.errorMessage || err.message);
        setAnimateurs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimateurs();
  }, []);

  return animateurs;
}

export function useProgrammeDetail(id: number) {
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await programmeService.getById(id);
    setProgramme(data.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { programme, loading, refresh: fetch };
}