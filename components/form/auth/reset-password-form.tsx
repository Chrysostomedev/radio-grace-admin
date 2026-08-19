"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Key, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const schema = z.object({ new_password: z.string().min(8), confirm: z.string().min(1) }).refine(d=>d.new_password===d.confirm,{message:"Ne correspond pas", path:["confirm"]});
type Values = z.infer<typeof schema>;

export function ResetPasswordForm({ email, resetToken }: { email: string; resetToken: string; }) {
  const router=useRouter(); const [isLoading,setIsLoading]=useState(false); const [showNew,setShowNew]=useState(false); const [showConf,setShowConf]=useState(false);
  const form=useForm<Values>({resolver:zodResolver(schema), defaultValues:{new_password:"",confirm:""}});
  async function onSubmit(data:Values){
    setIsLoading(true);
    try{
      await authService.reset(email, resetToken, data.new_password, data.confirm);
      localStorage.removeItem("rge_reset_token"); localStorage.removeItem("rge_temp_token");
      toast.success("Mot de passe réinitialisé, connectez-vous");
      router.replace("/login");
    }catch(e:any){ toast.error(e?.errorMessage||"Erreur"); }
    finally{ setIsLoading(false); }
  }
  return (
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField control={form.control} name="new_password" render={({ field })=>(
        <FormItem><FormLabel className="text-[#163A2C]">Nouveau mot de passe</FormLabel><FormControl><div className="relative">
          <Key className="absolute top-1/2 -translate-y-1/2 left-4 text-[#1E5A3D]/50" />
          <Input type={showNew?"text":"password"} className="h-12 pl-11 pr-12 bg-white border-[#163A2C]/10 focus:border-[#F0A93E]" disabled={isLoading} {...field} />
          <button type="button" onClick={()=>setShowNew(!showNew)} className="absolute top-1/2 -translate-y-1/2 right-4">{showNew?<EyeOff/>:<Eye/>}</button>
        </div></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="confirm" render={({ field })=>(
        <FormItem><FormLabel className="text-[#163A2C]">Confirmer</FormLabel><FormControl><div className="relative">
          <Key className="absolute top-1/2 -translate-y-1/2 left-4 text-[#1E5A3D]/50" />
          <Input type={showConf?"text":"password"} className="h-12 pl-11 pr-12 bg-white" disabled={isLoading} {...field} />
          <button type="button" onClick={()=>setShowConf(!showConf)} className="absolute top-1/2 -translate-y-1/2 right-4">{showConf?<EyeOff/>:<Eye/>}</button>
        </div></FormControl><FormMessage /></FormItem>
      )} />
      <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-[#F0A93E] text-[#163A2C]">{isLoading?<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réinitialisation...</>:"Réinitialiser"}</Button>
    </form></Form>
  );
}