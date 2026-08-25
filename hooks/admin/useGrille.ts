"use client";

import { useCallback, useState } from "react";
import type { ProgrammeGrille, ProgrammeGrillePayload } from "@/types/admin";

const API_BASE = "/admin";

export function useGrille(programmeId: number) {
  const [creneaux, setCreneaux] = useState<ProgrammeGrille[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchGrille = useCallback(async () => {
    if (!programmeId || !token) return;
    setLoading(true);
    try {
      const res = await window.fetch(`${API_BASE}/programmes/${programmeId}/grille`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCreneaux(data.data || []);
        setError(null);
      } else {
        throw new Error("Impossible de charger les créneaux");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [programmeId, token]);

  const create = useCallback(
    async (payload: Omit<ProgrammeGrillePayload, "programme_id"> & { programme_id: number }) => {
      if (!token) throw new Error("Non authentifié");
      const res = await window.fetch(`${API_BASE}/programmes/${payload.programme_id}/grille`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      const data = await res.json();
      setCreneaux((prev) => [...prev, data.data]);
      return data.data;
    },
    [token]
  );

  const update = useCallback(
    async (creneauId: number, payload: ProgrammeGrillePayload) => {
      if (!token) throw new Error("Non authentifié");
      const res = await window.fetch(`${API_BASE}/programme-grilles/${creneauId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      const data = await res.json();
      setCreneaux((prev) =>
        prev.map((c) => (c.id === creneauId ? data.data : c))
      );
      return data.data;
    },
    [token]
  );

  const destroy = useCallback(
    async (creneauId: number) => {
      if (!token) throw new Error("Non authentifié");
      const res = await window.fetch(`${API_BASE}/programme-grilles/${creneauId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Impossible de supprimer");
      setCreneaux((prev) => prev.filter((c) => c.id !== creneauId));
    },
    [token]
  );

  return { creneaux, loading, error, fetch: fetchGrille, create, update, destroy };
}