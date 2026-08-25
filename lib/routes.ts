/**
 * Routes centralisées pour l'application
 */
export const ROUTES = {
  // Auth
  LOGIN: "/login",
  LOGOUT: "/logout",

  // Admin Dashboard
  ADMIN_DASHBOARD: "/admin/dashboard",

  // Admin - Programmes
  ADMIN_PROGRAMMES: "/admin/programmes",
  ADMIN_PROGRAMMES_GRILLE: "/admin/programmes/grille",

  // Admin - Podcasts
  ADMIN_PODCASTS: "/admin/podcasts",

  // Admin - Actualités
  ADMIN_ACTUALITES: "/admin/actualites",

  // Admin - Évènements
  ADMIN_EVENEMENTS: "/admin/evenements",

  // Admin - Live Sessions
  ADMIN_LIVE_SESSIONS: "/admin/live-sessions",

  // Admin nested object for compatibility
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    PROGRAMMES: "/admin/programmes",
    PODCASTS: "/admin/podcasts",
    ACTUALITES: "/admin/actualites",
    EVENEMENTS: "/admin/evenements",
    LIVE_SESSIONS: "/admin/live-sessions",
    PROJETS: "/admin/programmes",
  },

  // Redacteur
  REDACTEUR_DASHBOARD: "/redactor/dashboard",
  REDACTEUR_EMISSIONS: "/redactor/emissions",

  // Public
  HOME: "/",
};
