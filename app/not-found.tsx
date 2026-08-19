"use client";

import { ArrowLeft, Home, Search, RadioTower } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#163A2C]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#163A2C]/10 flex items-center justify-center p-1">
            <Image src="/img/logo.png" alt="RGE" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <p className="font-black text-[#163A2C] text- leading-none">Radio Grâce-Espoir</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#163A2C] text-white text- font-black uppercase">
          <RadioTower size={12} className="text-[#F0A93E]" /> En direct
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* 404 */}
        <div className="relative mb-8 select-none">
          <span className="text- sm:text- font-black text-[#163A2C]/5 leading-none tracking-tighter">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F0A93E] blur-2xl opacity-30 rounded-full" />
              <div className="relative h-20 w-20 rounded- bg-[#163A2C] flex items-center justify-center shadow-[0_12px_24px_rgba(22,58,44,0.25)] rotate-3">
                <Search className="h-8 w-8 text-[#F0A93E]" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-black text-[#163A2C] mb-3 tracking-tight">
            Fréquence non trouvée
          </h1>
          <p className="text-[#163A2C]/60 text- leading-relaxed">
            La page que vous cherchez n'émet plus sur cette fréquence.
            Vérifiez l'URL ou revenez au studio principal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center h-12 px-6 rounded-xl bg-[#163A2C] text-white font-bold hover:bg-[#0E241C] transition-all shadow-[0_8px_16px_rgba(22,58,44,0.2)]"
          >
            <Home className="mr-2 h-4 w-4 text-[#F0A93E]" />
            Tableau de bord
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center h-12 px-6 rounded-xl border border-[#163A2C]/10 bg-white text-[#163A2C] font-bold hover:bg-[#FBF6EA] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Page précédente
          </button>
        </div>

        <p className="mt-10 text- font-bold uppercase tracking-widest text-[#163A2C]/30">
          L'Évangile au cœur de l'Homme • RGE
        </p>
      </main>

      {/* Bottom strip RGE */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#163A2C] via-[#F0A93E] to-[#1E9D55]" />
    </div>
  );
}