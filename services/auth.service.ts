import { get, post } from "@/core/axios";
import type { ApiResponse, AuthUser } from "@/types";
import { TOKEN_STORAGE_KEY } from "@/core/axios";

type LoginData = {
  token: string;
  user: AuthUser;
  requires_otp?: boolean;
  temp_token?: string;
};

export const authService = {
  login: (email: string, password: string): Promise<ApiResponse<LoginData>> =>
    post("/admin/auth/login", { email, password }),

  verifyOtp: (otp: string, temp_token?: string): Promise<ApiResponse<LoginData>> =>
    post("/admin/auth/verify-otp", { otp, temp_token }),

  resendOtp: (temp_token?: string): Promise<ApiResponse<{ message: string }>> =>
    post("/admin/auth/resend-otp", { temp_token }),

  verifyForgotOtp: (email: string, otp: string): Promise<ApiResponse<{ token: string }>> =>
    post("/admin/auth/verify-forgot-otp", { email, otp }),

  logout: (): Promise<ApiResponse<null>> =>
    post("/admin/auth/logout"),

  forgot: (email: string): Promise<ApiResponse<{ message: string }>> =>
    post("/admin/auth/forgot-password", { email }),

  reset: (email: string, token: string, password: string, password_confirmation: string) =>
    post("/admin/auth/reset-password", { email, token, password, password_confirmation }),

  me: (): Promise<AuthUser> =>
    get("/admin/dashboard").then((r: any) => r.user || r.data?.user || r.data || r),

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