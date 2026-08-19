"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { authService } from "@/services/auth.service";

const BRAND_GRACE = "bg-[#F0A93E] hover:bg-[#E0972E] text-[#163A2C]";
const schema = z.object({ email: z.string().email() });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  async function onSubmit(data: Values) {
    setIsLoading(true);
    try {
      await authService.forgot(data.email);
      toast.success("Code OTP envoyé à votre adresse email.");
      onSuccess(data.email);
    } catch (e: any) { toast.error(e?.errorMessage || "Email introuvable"); }
    finally { setIsLoading(false); }
  }
  return (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField control={form.control} name="email" render={({ field }) => (
        <FormItem><FormControl><div className="relative">
          <Mail className="absolute top-1/2 -translate-y-1/2 left-4 text-[#1E5A3D]/50" />
          <Input type="email" placeholder="Votre adresse email" className="h-12 pl-11 bg-white border-[#163A2C]/10 focus:border-[#F0A93E] focus:ring-[#F0A93E]/20" disabled={isLoading} {...field} />
        </div></FormControl><FormMessage /></FormItem>
      )} />
      <Button type="submit" disabled={isLoading} className={`w-full h-12 rounded-xl font-semibold ${BRAND_GRACE}`}>{isLoading? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> : "Envoyer le code"}</Button>
    </form></Form>
  );
}