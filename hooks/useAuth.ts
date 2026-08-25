"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { TOKEN_STORAGE_KEY } from "@/core/axios";
import type { AuthUser } from "@/types";
import { toast } from "sonner";

type DashboardPath = "/admin/dashboard" | "/redacteur" | "/animateur";

const getDashboardByRole = (role: string): DashboardPath => {
  switch (role) {
    case "ADMIN": return "/admin/dashboard";
    case "REDACTEUR": return "/redacteur";
    case "ANIMATEUR": return "/animateur";
    default: return "/admin/dashboard";
  }
};

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!token) {
      setLoading(false);
      if (requireAuth) router.replace("/login");
      return;
    }
    try {
      const u = await authService.me();
      setUser(u);
      setIsAuthenticated(true);
    } catch {
      authService.clear();
      setUser(null);
      setIsAuthenticated(false);
      if (requireAuth) router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [requireAuth, router]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const res: any = await authService.login(email, password);
      const data = res?.data || res;

      if (data?.requires_otp || data?.temp_token) {
        localStorage.setItem("rge_temp_token", data.temp_token);
        toast.success("Code OTP envoyé");
        router.push(`/login/verify-otp?email=${email}`);
        return { requiresOtp: true, temp_token: data.temp_token };
      }

      authService.setToken(data.token);
      setUser(data.user);
      toast.success(`Bienvenue, ${data.user.prenom}`);
      router.replace(getDashboardByRole(data.user.role));
      return { requiresOtp: false };
    } catch (e: any) {
      toast.error(e?.errorMessage || "Identifiants invalides");
      throw e;
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      const temp_token = localStorage.getItem("rge_temp_token") || undefined;
      const res: any = await authService.verifyOtp(otp, temp_token);
      const data = res?.data || res;

      localStorage.removeItem("rge_temp_token");
      authService.setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      const dest = getDashboardByRole(data.user.role);
      toast.success("Connexion réussie");
      router.replace(dest);
      return data.user as AuthUser;
    } catch (e: any) {
      toast.error(e?.errorMessage || "OTP invalide");
      throw e;
    }
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    authService.clear();
    localStorage.removeItem("rge_temp_token");
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/login");
  };

  const resendOtp = async () => {
    const temp_token = localStorage.getItem("rge_temp_token") || undefined;
    await authService.resendOtp(temp_token);
    toast.success("Nouveau code envoyé");
  };

  return { user, loading, isAuthenticated, login, verifyOtp, resendOtp, logout, getDashboardByRole, refresh: fetchUser };
}