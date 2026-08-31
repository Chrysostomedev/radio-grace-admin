"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "@/core/axios";

export interface CreneauEnCours {
    id: number | null;
    programme: {
        id: number;
        titre: string;
        description: string | null;
        image: string | null;
        animateur?: { nom_scene: string; photo?: string | null } | null;
    } | null;
    jour: string | null;
    heure_debut: string | null;
    heure_fin: string | null;
    is_rediffusion: boolean;
}

export function useProgrammeEnCoursAdmin() {
    const query = useQuery({
        queryKey: ["admin-grille-en-cours"],
        queryFn: async () => {
            const res = await axios.get("/mobile/grille/en-cours"); // endpoint public
            return res.data.data as {
                en_cours: CreneauEnCours | null;
                a_suivre: CreneauEnCours | null;
            };
        },
        refetchInterval: 60_000,
        staleTime: 30_000,
    });

    return {
        enCours: query.data?.en_cours ?? null,
        aSuivre: query.data?.a_suivre ?? null,
        chargement: query.isLoading,
        erreur: query.isError ? "Impossible de charger l'émission en cours" : null,
    };
}
