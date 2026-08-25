"use client";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

const OTP_LEN = 6; const RESEND_DELAY = 60;
export function OtpVerifyForm({ email, onSuccess, onBack }: { email: string; onSuccess: (resetToken: string) => void; onBack: () => void; }) {
  const router = useRouter();
  const toast = useToast();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [isLoading, setIsLoading] = useState(false); const [cooldown, setCooldown] = useState(RESEND_DELAY);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(()=>{ if(cooldown<=0) return; const t=setInterval(()=> setCooldown(p=> p<=1?0:p-1),1000); return ()=> clearInterval(t); },[cooldown]);

  function handleChange(i:number, val:string){ if(!/^\d*$/.test(val)) return; const n=[...digits]; n[i]=val.slice(-1); setDigits(n); if(val && i<OTP_LEN-1) inputRefs.current[i+1]?.focus(); }
  function handlePaste(e:any){ e.preventDefault(); const pasted=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,OTP_LEN); const n=Array(OTP_LEN).fill(""); pasted.split("").forEach((d:string,i:number)=> n[i]=d); setDigits(n); }

  async function handleVerify(){
    const otp=digits.join(""); if(otp.length<OTP_LEN) return toast.warning(`Entrez les ${OTP_LEN} chiffres`);
    setIsLoading(true);
    try{
      const temp_token = localStorage.getItem("rge_temp_token") || undefined;
      // Cas LOGIN OTP
      if(temp_token){
        const res:any = await authService.verifyOtp(otp, temp_token);
        const data=res?.data||res;
        localStorage.removeItem("rge_temp_token");
        authService.setToken(data.token);
        toast.success("Connexion réussie", "Bienvenue!");
        const role=data.user?.role;
        router.replace(role==="ADMIN"?"/admin":role==="REDACTEUR"?"/redacteur":"/animateur");
        return;
      }
      // Cas FORGOT PASSWORD OTP
      const res:any = await authService.verifyForgotOtp(email, otp);
      const resetToken=res?.data?.token || res?.token || otp; // selon ton backend
      localStorage.setItem("rge_reset_token", resetToken);
      toast.success("Code vérifié avec succès", "Réinitialisation");
      onSuccess(resetToken);
    }catch(e:any){ toast.error(e?.errorMessage||"Code invalide", "Erreur"); }
    finally{ setIsLoading(false); }
  }

  async function handleResend(){
    if(cooldown>0) return;
    const temp_token=localStorage.getItem("rge_temp_token")||undefined;
    try{
      if(temp_token) await authService.resendOtp(temp_token);
      else await authService.forgot(email);
      setCooldown(RESEND_DELAY); toast.success("Nouveau code envoyé", "Renvoi");
    }catch(e:any){ toast.error(e?.errorMessage || "Erreur lors du renvoi", "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-[#163A2C]/70">Code à {OTP_LEN} chiffres envoyé à <span className="font-medium text-[#163A2C]">{email}</span></p>
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {Array.from({ length: OTP_LEN }).map((_, i) => (
          <input key={i} ref={el=>{ inputRefs.current[i]=el; }} type="text" inputMode="numeric" maxLength={1} value={digits[i]} onChange={e=>handleChange(i,e.target.value)} className="h-12 w-12 rounded-xl border border-[#163A2C]/15 bg-white text-center text-xl font-bold text-[#163A2C] focus:border-[#F0A93E] focus:ring-2 focus:ring-[#F0A93E]/20 outline-none" />
        ))}
      </div>
      <Button onClick={handleVerify} disabled={isLoading || digits.join("").length<OTP_LEN} className="w-full h-12 rounded-xl bg-[#F0A93E] text-[#163A2C] font-semibold">{isLoading?<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Vérification...</>:"Vérifier le code"}</Button>
      <div className="flex flex-col items-center gap-2 text-sm">
        <button onClick={handleResend} disabled={cooldown>0} className="flex items-center gap-1.5 text-[#1E9D55] disabled:opacity-50"><RefreshCw className="h-4 w-4" />{cooldown>0?`Renvoyer (${cooldown}s)`:"Renvoyer le code"}</button>
        <button onClick={onBack} className="text-[#163A2C]/60 hover:text-[#F0A93E] underline">Modifier l'adresse email</button>
      </div>
    </div>
  );
}