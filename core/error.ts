import { AxiosError } from "axios";

export type ApiError = {
    errorContent: any;
    errorMessage: string;
    statusCode: number | string | undefined;
    timestamp: string;
};

/**
 * Extrait le message lisible depuis la réponse d'erreur du backend.
 * Priorité :
 *   1. data.message                     (ex: "La tâche ne peut pas changer...")
 *   2. Premier message dans data.errors (ex: errors.id_task[0])
 *   3. Fallback générique par status code
 */
function extractBackendMessage(data: any): string | null {
    if (!data) return null;

    // 1. Champ message direct
    if (typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
    }

    // 2. Premier message dans errors (objet ou tableau)
    if (data.errors) {
        const errors = data.errors;
        // errors: { field: ["msg1", ...], ... }
        if (typeof errors === "object" && !Array.isArray(errors)) {
            const first = Object.values(errors)[0];
            if (Array.isArray(first) && typeof first[0] === "string") return first[0];
            if (typeof first === "string") return first;
        }
        // errors: ["msg1", "msg2"]
        if (Array.isArray(errors) && typeof errors[0] === "string") return errors[0];
    }

    return null;
}

const FALLBACK: Record<number, string> = {
    400: "Requête invalide. Vérifiez les données saisies.",
    401: "Session expirée. Veuillez vous reconnecter.",
    403: "Accès refusé. Permissions insuffisantes.",
    404: "Ressource introuvable.",
    409: "Conflit détecté.",
    422: "Données invalides. Corrigez les erreurs de validation.",
    429: "Trop de requêtes. Réessayez dans quelques instants.",
    500: "Erreur serveur. L'équipe technique a été notifiée.",
    502: "Service temporairement indisponible.",
    503: "Service en maintenance.",
};

/**
 * Normalise une erreur Axios en objet ApiError typé.
 * Affiche en priorité le message exact renvoyé par le backend.
 */
export const processApiError = (err: AxiosError): never => {
    const data       = err?.response?.data as any;
    const status     = err?.response?.status;
    const backendMsg = extractBackendMessage(data);

    const errorRes: ApiError = {
        errorContent: data,
        errorMessage:
            backendMsg ??
            (status ? (FALLBACK[status] ?? `Erreur ${status}: ${err.message}`) : ""),
        statusCode: status,
        timestamp:  new Date().toISOString(),
    };

    if (!status) {
        if (err.code === "ERR_NETWORK") {
            errorRes.errorMessage = "Problème de connexion réseau. Vérifiez votre connexion Internet.";
        } else if (err.code === "ECONNABORTED") {
            errorRes.errorMessage = "Délai d'attente dépassé. Le serveur met trop de temps à répondre.";
        } else {
            errorRes.errorMessage = err.message ?? "Une erreur inattendue s'est produite. Réessayez.";
        }
    }

    const isSilent = (err?.config as any)?.silent === true;

    if (process.env.NODE_ENV === "development" && !isSilent) {
        console.group("🔴 API Error");
        console.error("URL:",    err?.config?.url);
        console.error("Method:", err?.config?.method?.toUpperCase());
        console.error("Status:", status);
        console.error("Data:",   data);
        console.error("→ Msg:",  errorRes.errorMessage);
        console.groupEnd();
    }

    throw errorRes;
};
