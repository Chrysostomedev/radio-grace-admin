"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Key, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { authService } from "@/services/auth.service";

const BRAND_GRACE = "bg-[#F0A93E] hover:bg-[#E0972E] text-[#163A2C]";
const BRAND_GRACE_RING = "focus:border-[#F0A93E] focus:ring-[#F0A93E]/20";

const schema = z.object({
  email: z.string().min(1, "Email requis").email("Format email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type LoginValues = z.infer<typeof schema>;

export function LoginForm({ forgotPasswordHref = "/login/password" }: { forgotPasswordHref?: string }) {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    try {
      const res: any = await authService.login(values.email, values.password);
      const data = res?.data || res; // { token, user }

      if (!data?.token) throw new Error("Token manquant");

      authService.setToken(data.token);
      toast.success(`Bienvenue, ${data.user?.prenom || data.user?.nom_complet || values.email}`);

      // redirection par rôle
      const role = data.user?.role;
      if (role === "ADMIN") router.replace("/admin");
      else if (role === "REDACTEUR") router.replace("/redacteur");
      else if (role === "ANIMATEUR") router.replace("/animateur");
      else router.replace("/admin");

    } catch (e: any) {
      toast.error(e?.errorMessage || e?.message || "Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-[#1E5A3D]/50 pointer-events-none" />
                  <Input type="email" placeholder="Email" className={`h-12 pl-11 bg-white border-[#163A2C]/10 ${BRAND_GRACE_RING}`} disabled={isLoading} {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Key className="absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-[#1E5A3D]/50 pointer-events-none" />
                  <Input type={showPw ? "text" : "password"} placeholder="Mot de passe" className={`h-12 pl-11 pr-12 bg-white border-[#163A2C]/10 ${BRAND_GRACE_RING}`} disabled={isLoading} {...field} />
                  <button type="button" tabIndex={-1} className="absolute top-1/2 -translate-y-1/2 right-4 text-[#1E5A3D]/50 hover:text-[#163A2C]" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="flex justify-end">
            <Link href={forgotPasswordHref} className="text-sm text-[#163A2C]/60 hover:text-[#F0A93E]">Mot de passe oublié?</Link>
          </div>
          <Button type="submit" disabled={isLoading} className={`w-full h-12 rounded-xl font-semibold ${BRAND_GRACE}`}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion...</> : "Se connecter"}
          </Button>
        </form>
      </Form>
    </div>
  );
}