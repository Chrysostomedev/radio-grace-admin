import { del, get, post, put } from "@/core/axios";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { LiveSession, LiveSessionPayload } from "@/types/admin";

export const liveSessionsService = {
    getAll: (): Promise<PaginatedResponse<LiveSession>> =>
        get("/admin/live-sessions"),

    getOne: (id: number | string): Promise<ApiResponse<LiveSession>> =>
        get(`/admin/live-sessions/${id}`),

    create: (payload: LiveSessionPayload): Promise<ApiResponse<LiveSession>> =>
        post("/admin/live-sessions", payload),

    update: (id: number | string, payload: Partial<LiveSessionPayload>): Promise<ApiResponse<LiveSession>> =>
        put(`/admin/live-sessions/${id}`, payload),

    // Coupure manuelle d'urgence — distincte de l'arrêt naturel du flux (piloté par le webhook)
    forceStop: (id: number | string): Promise<ApiResponse<LiveSession>> =>
        post(`/admin/live-sessions/${id}/force-stop`),

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        del(`/admin/live-sessions/${id}`),
};
