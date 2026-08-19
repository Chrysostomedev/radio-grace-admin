"use client";

import { LoginForm } from "@/components/form/auth/login-form";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-[#FFFBF0]">

      {/* ================= LEFT PANEL ================= */}

      <section className="relative hidden lg:flex w-[55%] overflow-hidden bg-gradient-to-br from-[#0E241C] via-[#163A2C] to-[#1E5A3D]">

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10" />

        {/* SVG — rayons soleil Grâce-Espoir */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 1200 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {[180, 300, 420, 540, 660].map((r, i) => (
            <ellipse
              key={i}
              cx="450"
              cy="450"
              rx={r * 1.5}
              ry={r}
              stroke="#F0A93E"
              strokeWidth="2"
            />
          ))}

          {[80, 150, 230].map((r, i) => (
            <ellipse
              key={`b${i}`}
              cx="0"
              cy="900"
              rx={r * 1.4}
              ry={r}
              stroke="#F0A93E"
              strokeWidth="1.5"
            />
          ))}

          {[70, 120, 180].map((r, i) => (
            <ellipse
              key={`t${i}`}
              cx="1180"
              cy="0"
              rx={r * 1.3}
              ry={r}
              stroke="#F0A93E"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* Décorations */}

        <div className="absolute left-10 bottom-10 h-16 w-16 rounded-full border border-[#F0A93E]/30 bg-[#F0A93E]/10" />

        <div className="absolute top-12 right-16 h-8 w-8 rounded-full bg-[#F0A93E]/40 border border-white/20" />

        <div className="absolute top-24 right-44 h-4 w-4 rounded-full bg-[#F0A93E]/30" />

        {/* Halo soleil */}
        <div className="absolute top-[45%] left-[40%] w- h- rounded-full bg-[#F0A93E]/10 blur-3xl pointer-events-none" />

        {/* Contenu */}

        <div className="relative z-10 flex h-full flex-col justify-center px-20">

          <div className="mb-10 flex h-28 w-28 items-center justify-center rounded- bg-white shadow-2xl">
            <Logo
              width={70}
              height={70}
              className="h-16 w-16"
            />
          </div>

          <h1 className="max-w-lg text-5xl font-extrabold leading-tight text-white">
            Bienvenue sur <span className="text-[#F0A93E]">Radio Grâce-Espoir</span>
          </h1>

          <p className="mt-8 max-w-lg text-xl leading-9 text-white/80">
            L'Évangile au cœur de l'Homme. Gérez vos contenus, vos émissions et votre direct, où que vous soyez.
          </p>

        </div>

      </section>

      {/* ================= RIGHT PANEL ================= */}

      <section className="flex flex-1 items-center justify-center bg-[#FFFBF0] px-8">

        <div className="w-full max-w-md">

          <div className="mb-10 flex justify-center lg:hidden">
            <Logo
              width={80}
              height={80}
            />
          </div>

          <h2 className="text-5xl font-extrabold text-[#163A2C]">
            Connexion
          </h2>

          <p className="mt-4 text-lg leading-8 text-[#163A2C]/60">
            Entrez vos informations pour accéder à votre espace.
          </p>

          <div className="mt-10">
            <LoginForm />
          </div>

        </div>

      </section>

    </main>
  );
}