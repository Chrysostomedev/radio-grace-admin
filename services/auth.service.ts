import { get, post } from "@/core/axios";
import type { ApiResponse, AuthUser } from "@/types";
import { TOKEN_STORAGE_KEY } from "@/core/axios";

type LoginData = {
  token: string;
  user: AuthUser;
};

export const authService = {
  // LOGIN DIRECT - plus de temp_token
  login: (email: string, password: string): Promise<ApiResponse<LoginData>> =>
    post("/admin/auth/login", { email, password }),

  logout: (): Promise<ApiResponse<null>> =>
    post("/admin/auth/logout"),

  forgot: (email: string): Promise<ApiResponse<{ message: string }>> =>
    post("/admin/auth/forgot-password", { email }),

  reset: (email: string, token: string, password: string, password_confirmation: string) =>
    post("/admin/auth/reset-password", { email, token, password, password_confirmation }),

  me: (): Promise<AuthUser> =>
    get("/admin/dashboard").then((r: any) => r.user || r.data?.user || r.data || r),

  // storage
  setToken: (t: string) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_STORAGE_KEY, t);
  },
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null),
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem("rge_temp_token");
      localStorage.removeItem("rge_reset_token");
    }
  },
};