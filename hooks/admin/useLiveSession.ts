"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { liveSessionsService } from "@/services/admin/live-sessions.service";
import { toast } from "sonner";
import type { LiveSession, LiveSessionPayload } from "@/types/admin";

// Tant que Laravel Reverb (WebSocket) n'est pas branché, on rafraîchit le
// statut réel (is_live / auditeurs_live / signal) par polling léger.
// À remplacer par un echo.channel('live-sessions').listen(...) une fois
// Reverb en place — la fréquence de poll ci-dessous reste raisonnable en
// attendant (pas de charge significative sur une seule session active).
const POLL_INTERVAL_MS = 5000;

export function useLiveSession(id: number | string | null) {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchOne = useCallback(async (silent = false) => {
        if (!id) return;
        if (!silent) setLoading(true);
        setError(null);
        try {
            const res = await liveSessionsService.getOne(id);
            setSession(res.data);
        } catch (err: any) {
            setError(err?.errorMessage ?? "Erreur de chargement.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOne();

        if (!id) return;
        pollRef.current = setInterval(() => fetchOne(true), POLL_INTERVAL_MS);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [id, fetchOne]);

    const create = async (payload: LiveSessionPayload): Promise<LiveSession | null> => {
        setSaving(true);
        try {
            const res = await liveSessionsService.create(payload);
            toast.success("Session créée. Configurez OBS avec les infos affichées, puis démarrez le direct depuis OBS.");
            setSession(res.data);
            return res.data;
        } catch (err: any) {
            toast.error(err?.errorMessage ?? "Erreur lors de la création.");
            return null;
        } finally {
            setSaving(false);
        }
    };

    const forceStop = async (): Promise<boolean> => {
        if (!session) return false;
        setSaving(true);
        try {
            const res = await liveSessionsService.forceStop(session.id);
            setSession(res.data);
            toast.success("Direct coupé manuellement.");
            return true;
        } catch (err: any) {
            toast.error(err?.errorMessage ?? "Impossible de couper le direct.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { session, loading, saving, error, create, forceStop, refresh: () => fetchOne() };
}
