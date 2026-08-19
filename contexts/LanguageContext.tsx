"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// ── Traductions minimales (FR par défaut) ─────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
    fr: {
        "nav.dashboard":      "Tableau de bord",
        "nav.projets":        "Projets",
        "nav.conference":     "Conférence",
        "nav.evaluation":     "Évaluation",
        "nav.personnels":     "Personnels",
        "nav.historique":     "Historique",
        "nav.faq":            "FAQ",
        "nav.parametres":     "Paramètres",
        "nav.logout":         "Se déconnecter",

        "common.loading":     "Chargement...",
        "common.back":        "Retour",
        "common.cancel":      "Annuler",
        "common.edit":        "Modifier",
        "common.reference":   "Référence",
        "common.see":         "Voir",

        "table.search":       "Rechercher...",
        "table.noData":       "Aucune donnée disponible",

        "notifications.title":           "Notifications",
        "notifications.unread":          "non lue",
        "notifications.unreads":         "non lues",
        "notifications.upToDate":        "Tout est à jour",
        "notifications.markAllRead":     "Tout marquer comme lu",
        "notifications.noNotifications": "Aucune notification",
        "notifications.noNotificationsDesc": "Vous n'avez pas encore de notifications.",

        "pagination.previous": "Précédent",
        "pagination.next":     "Suivant",
    },
};

type LanguageContextType = {
    locale: string;
    t:      (key: string) => string;
    setLocale: (l: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
    locale:    "fr",
    t:         (key) => key,
    setLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState("fr");

    const t = (key: string): string =>
        translations[locale]?.[key] ?? translations["fr"]?.[key] ?? key;

    return (
        <LanguageContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
