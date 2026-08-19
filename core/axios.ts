// core/axios.ts — instance axios centrale + helpers get/post/put/del
import axios, { type AxiosRequestConfig } from "axios";
import type { ApiError } from "@/types";

export const TOKEN_STORAGE_KEY = "rge_admin_token";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
    headers: {
        Accept: "application/json",
    },
});

// ── Requête : injecte le Bearer token stocké après le flow OTP ──────────────
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ── Réponse : normalise les erreurs, gère l'expiration de session ───────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const payload = error?.response?.data;

        const normalized: ApiError = {
            status,
            errorMessage:
                payload?.message ??
                (status === 422 ? "Certains champs sont invalides." : "Une erreur est survenue."),
            errors: payload?.errors,
        };

        // Session expirée / token invalide → on nettoie et on renvoie vers le login
        if (status === 401 && typeof window !== "undefined") {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(normalized);
    }
);

// ── Helpers utilisés par les services (retournent directement response.data) ─
export const get = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config).then((res) => res.data);

export const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config).then((res) => res.data);

export const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config).then((res) => res.data);

export const patch = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.patch(url, data, config).then((res) => res.data);

export const del = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then((res) => res.data);

// À ajouter dans core/axios.ts
export const apiClient = api;
export default api;