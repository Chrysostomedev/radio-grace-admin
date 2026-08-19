"use client";
import { RadioTower, Volume2, Maximize2, Activity } from "lucide-react";
import { useState } from "react";

export default function LivePlayer({ mode, isLive, title, image, onToggleLive }: { mode: "audio" | "video"; isLive: boolean; title: string; image: string; onToggleLive: (v: boolean)=>void }) {
  return (
    <div className="relative rounded- overflow-hidden bg-[#0E241C] aspect-video group border border-[#163A2C]">
      {/* Bg */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-[1.02] transition duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E241C] via-[#0E241C]/40 to-transparent" />

      {/* Top */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text- font-black uppercase backdrop-blur-md border ${isLive? "bg-red-500 text-white border-red-400 animate-pulse" : "bg-black/40 text-white/70 border-white/10"}`}>
          <span className={`w-2 h-2 rounded-full ${isLive? "bg-white animate-ping absolute" : "bg-white/30"} `} />
          <span className="relative w-2 h-2 rounded-full bg-white" />
          {isLive? `ON AIR • ${mode.toUpperCase()}` : "HORS ANTENNE"}
        </span>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text- font-bold border border-white/10 flex items-center gap-1"><Activity size={10}/> 1.2k auditeurs</span>
          <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center justify-center"><Maximize2 size={14}/></button>
        </div>
      </div>

      {/* Center Play Wave */}
      <div className="absolute inset-0 flex items-center justify-center">
        {mode==="audio"? (
          <div className="flex items-end gap-1 h-16">
            {[...Array(24)].map((_,i)=>(
              <div key={i} className={`w-1 rounded-full bg-[#F0A93E] ${isLive? "animate-[wave_0.8s_ease-in-out_infinite]" : "h-2 opacity-30"}`} style={{ height: isLive? `${12+ Math.random()*40}px` : "8px", animationDelay: `${i*0.05}s` }} />
            ))}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <RadioTower size={28} className="text-[#163A2C]" />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
        <div>
          <h3 className="font-black text-white text-lg leading-tight">{title}</h3>
          <p className="text-white/60 text-xs mt-1 flex items-center gap-1"><Volume2 size={12}/>  Studio RGE Abidjan</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <div className="w-2 h-2 rounded-full bg-[#1E9D55] animate-pulse" />
          <span className="text- font-bold text-white uppercase">Signal OK</span>
        </div>
      </div>

      <style>{`@keyframes wave { 0%,100%{ transform: scaleY(0.5)} 50%{ transform: scaleY(1.5)} }`}</style>
    </div>
  );
}