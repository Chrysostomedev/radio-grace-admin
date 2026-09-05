"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, Menu, AlertTriangle, Radio } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED, NAVBAR_HEIGHT } from "@/components/layouts/sidebar";
import { usePathname } from "next/navigation";

// ── Données mock statiques RGE ───────────────────────────────────────────────
const MOCK_USER = {
  first_name: "Père",
  last_name: "Attobra",
  role: "ADMIN",
  profile_picture_url: null as string | null,
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Nouvelle demande de prière", summary: "Famille Koné - Guérison", read: false },
  { id: 2, title: "Direct en cours", summary: "Acclamez le Seigneur - 16h", read: false },
  { id: 3, title: "Actualité publiée", summary: "Diocèse de Daoa - Retraite validée", read: true },
];

// ── Notification banner ──────────────────────────────────────────────────────
function InAppBanner({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] bg-white border border-[#163A2C]/10 rounded-2xl shadow-[0_20px_50px_-12px_rgba(14,36,28,0.35)] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="h-1 w-full bg-[#F0A93E]" />
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#163A2C] flex items-center justify-center shrink-0 mt-0.5">
          <Bell size={16} className="text-[#F0A93E]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-[#163A2C] leading-tight truncate">{title}</p>
          <p className="text-xs text-[#163A2C]/60 mt-0.5 line-clamp-2 leading-snug">{body}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#FBF6EA] rounded-lg transition text-[#163A2C]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]" aria-label="Fermer">✕</button>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const r = role.toUpperCase();
  if (r === "ADMIN")
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#163A2C] text-[#F0A93E] border border-[#163A2C]/20">
        Admin
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#163A2C]/10 text-[#163A2C] border border-[#163A2C]/10">
      {role}
    </span>
  );
}

function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-[#0E241C]/40 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div
        style={{ top: NAVBAR_HEIGHT + 8 }}
        className="fixed right-4 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(14,36,28,0.35)] border border-[#163A2C]/10 z-[9999] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200"
      >
        <div className="p-4 border-b border-[#163A2C]/[0.06] bg-[#FBF6EA] flex items-center justify-between">
          <h3 className="font-black text-[#163A2C] text-sm">Notifications RGE</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white rounded-lg text-[#163A2C]/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]" aria-label="Fermer">✕</button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className={`p-4 border-b border-[#163A2C]/[0.06] last:border-b-0 hover:bg-[#FBF6EA]/60 transition-colors ${!notif.read ? "bg-[#F0A93E]/[0.06]" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? "bg-[#F0A93E]" : "bg-[#163A2C]/15"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#163A2C] truncate">{notif.title}</p>
                  <p className="text-xs text-[#163A2C]/55 mt-0.5">{notif.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const { collapsed, toggleMobileOpen } = useSidebar();
  const [firstName] = useState(MOCK_USER.first_name);
  const [lastName] = useState(MOCK_USER.last_name);
  const [role] = useState(MOCK_USER.role);
  const [showLogout, setShowLogout] = useState(false);
  const [profilePic] = useState<string | null>(MOCK_USER.profile_picture_url);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [banner, setBanner] = useState<{ title: string; body: string } | null>(null);
  const pathname = usePathname();

  // Les onglets spécifiques au site
  const SITE_TABS = [
    { label: 'Sections Slides du site', href: '/admin/site/hero-slides' },
    { label: 'Infos-Flash', href: '/admin/site/flashs' },
    { label: 'Publicités', href: '/admin/site/publicites' },
    { label: 'Partenaires', href: '/admin/site/partenaires' },
  ];

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const handleLogout = () => {
    setShowLogout(false);
    window.location.href = "/login";
  };

  const getInitials = () => (firstName || lastName ? `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() : "?");
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Utilisateur";
  const profileHref = "/profil";
  const sidebarOffset = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <>
      {banner && <InAppBanner title={banner.title} body={banner.body} onClose={() => setBanner(null)} />}
      <NotificationPanel isOpen={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />

      <header
        style={{ ["--sidebar-offset" as string]: `${sidebarOffset}px` }}
        className="fixed top-0 left-0 w-full md:w-[calc(100%-var(--sidebar-offset))] md:ml-[var(--sidebar-offset)] bg-white/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(22,58,44,0.06)] z-30 transition-[width,margin] duration-300 ease-in-out flex flex-col"
      >
        <div style={{ height: NAVBAR_HEIGHT }} className="flex items-center justify-between px-4 md:px-6 w-full">
        {/* Gauche */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleMobileOpen}
            className="md:hidden p-2 hover:bg-[#FBF6EA] rounded-xl text-[#163A2C]/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>

          <Link
            href={profileHref}
            className="relative w-11 h-11 rounded-full bg-[#163A2C] text-white font-black flex items-center justify-center text-sm shrink-0 overflow-hidden ring-2 ring-[#F0A93E]/0 hover:ring-[#F0A93E]/60 transition-all"
          >
            {profilePic ? <img src={profilePic} alt="Profil" className="object-cover w-full h-full" /> : getInitials()}
          </Link>

          <div className="hidden md:flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[#163A2C] font-bold text-sm leading-tight truncate">Bienvenue, {fullName}</p>
              <RoleBadge role={role} />
            </div>
            <p className="text-[#163A2C]/45 text-xs font-medium flex items-center gap-1.5">
              <Image src="/img/logo.png" alt="RGE" width={14} height={14} className="object-contain shrink-0" />
              <span className="truncate">Radio Grâce-Espoir </span>
            </p>
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-2 shrink-0">
          {/* <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#163A2C]/[0.04] text-[#163A2C]/70 text-xs font-bold">
            <Radio size={14} className="text-[#F0A93E]" />
            En direct
          </div> */}

          <button
            onClick={() => setNotifPanelOpen(true)}
            onDoubleClick={() => setBanner({ title: "Direct en cours", body: "Acclamez le Seigneur a démarré à 16h" })}
            className="relative flex items-center gap-2 px-3 py-2.5 bg-white border border-[#163A2C]/10 rounded-full hover:bg-[#FBF6EA] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]"
          >
            <div className="relative">
              <Bell size={18} className={unreadCount > 0 ? "text-[#163A2C]" : "text-[#163A2C]/40"} strokeWidth={unreadCount > 0 ? 2.5 : 2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#F0A93E] text-[#163A2C] text-[10px] leading-none font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-sm font-semibold text-[#163A2C]">Notifications</span>
          </button>

          <button
            onClick={() => setShowLogout(true)}
            className="p-2.5 rounded-full bg-[#163A2C] text-white hover:bg-[#0E241C] transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]"
            title="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
        </div>

        {/* ── Slider / Onglets Site Web ── */}
        <div className="w-full border-t border-[#163A2C]/5 bg-[#FBF6EA]/50 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6 px-4 md:px-6 py-2.5 min-w-max">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#163A2C]/50 flex items-center gap-1.5 border-r border-[#163A2C]/10 pr-6">
              <Radio className="w-3.5 h-3.5" />
              Site Web
            </span>
            {SITE_TABS.map((tab) => {
              const isActive = pathname === tab.href.split('?')[0]; // basique, on pourra améliorer selon la query
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`text-sm font-bold transition-all relative py-1 ${
                    isActive 
                      ? 'text-[#F0A93E]' 
                      : 'text-[#163A2C]/70 hover:text-[#163A2C]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute -bottom-2.5 left-0 w-full h-[2px] bg-[#F0A93E] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Logout modal */}
      {showLogout && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0E241C]/60 backdrop-blur-sm" onClick={() => setShowLogout(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 border border-[#163A2C]/10">
            <div className="w-16 h-16 bg-[#F0A93E]/15 rounded-full flex items-center justify-center border border-[#F0A93E]/20">
              <AlertTriangle className="text-[#9A6A1E]" size={28} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-[#163A2C]">Déconnexion de votre compte</h2>
              <p className="text-[#163A2C]/60 text-sm leading-relaxed font-medium">
                Souhaitez-vous vous déconnecter ? Vous pourrez vous reconnecter facilement à tout moment.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-1">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 px-6 rounded-xl bg-[#FBF6EA] text-[#163A2C] text-sm font-bold border border-[#163A2C]/10 hover:bg-[#F0A93E]/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]">
                Rester connecté
              </button>
              <button onClick={handleLogout} className="flex-1 py-3 px-6 rounded-xl bg-[#163A2C] text-white text-sm font-bold hover:bg-[#0E241C] transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}