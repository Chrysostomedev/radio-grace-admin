"use client";

import { usePathname } from "next/navigation";
import { useState, createContext, useContext, useCallback } from "react";
import {
  LayoutDashboard, ListMusic, CalendarDays, ShoppingBag, HeartHandshake, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, X, Newspaper, RadioTower, Radio,
  Music2Icon,
  HandCoins,
  User2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Constantes de layout partagées ───────────────────────────────────────────
// Utilisées ici, dans Navbar et dans MainContent pour rester parfaitement
// synchronisées : c'était la source du décalage visuel avant (chaque fichier
// avait sa propre valeur, jamais alignée).
export const SIDEBAR_WIDTH_EXPANDED = 280; // px
export const SIDEBAR_WIDTH_COLLAPSED = 88; // px
export const NAVBAR_HEIGHT = 76; // px

// ── Types locaux ─────────────────────────────────────────────────────────────
type SubMenuItem = { label: string; href: string; count?: number };
type NavItem = { label: string; icon: React.ElementType; href: string; submenu?: SubMenuItem[] };

// ── Context sidebar ──────────────────────────────────────────────────────────
interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  toggleMobileOpen: () => void;
  setMobileOpen: (v: boolean) => void;
}
const SidebarContext = createContext<SidebarContextType>({
  collapsed: false, toggleCollapsed: () => { }, mobileOpen: false, toggleMobileOpen: () => { }, setMobileOpen: () => { },
});
export function useSidebar() { return useContext(SidebarContext); }
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const toggleMobileOpen = useCallback(() => setMobileOpen((v) => !v), []);
  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, mobileOpen, toggleMobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ── Nav RGE — ADMIN ──────────────────────────────────────────────────────────
const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/admin/dashboard" },
  {
    label: "Actualités", icon: Newspaper, href: "/admin/actualites",},
   {label: "Bannières des annonces Mobile", icon: ListMusic, href: "/admin/hero-mobile",},
   {
    label: "Grille des programmes", icon: ListMusic, href: "/admin/programmes/grille",
  },
  {
    label: "Émissions", icon: ListMusic, href: "/admin/emissions",  },
  { label: "Podcasts", icon: Music2Icon, href: "/admin/podcasts" },
  { label: "Événements", icon: CalendarDays, href: "/admin/evenements" },
  { label: "Boutique", icon: ShoppingBag, href: "/admin/boutique" },
  { label: "Intentions de prière", icon: HeartHandshake, href: "/admin/intentions" },
  { label: "Direct ", icon: RadioTower, href: "/admin/direct" },
  { label: "Dons", icon: HandCoins, href: "/admin/dons" },
  { label: "Animateurs", icon: User2, href: "/admin/animateurs" },
  { label: "Utilisateurs", icon: Users, href: "/admin/roles" },
];

const REDACTEUR_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/redacteur/dashboard" },
  { label: "Actualités", icon: Newspaper, href: "/redacteur/actualites" },
  { label: "Émissions", icon: ListMusic, href: "/redacteur/emissions" },
  { label: "Événements", icon: CalendarDays, href: "/redacteur/evenements" },
  { label: "Demandes", icon: HeartHandshake, href: "/redacteur/demandes" },
];

const BOTTOM_ITEMS = [{ label: "Paramètres", icon: Settings, href: "/parametres" }];

// ── SubMenu interne — onglets contextuels ────────────────────────────────────
function SubMenu({ label, href, icon, items, collapsed }: { label: string; href: string; icon: React.ReactNode; items: SubMenuItem[]; collapsed: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => pathname.startsWith(href));
  const isActive = pathname === href || pathname.startsWith(href + "/");

  if (collapsed) {
    return (
      <Link
        href={href}
        className={`flex items-center justify-center h-11 w-11 mx-auto rounded-xl transition-all
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E] focus-visible:ring-offset-2
          ${isActive
            ? "bg-[#163A2C] text-[#F0A93E] shadow-[0_6px_16px_-4px_rgba(22,58,44,0.45)]"
            : "text-[#163A2C]/50 hover:bg-[#FBF6EA] hover:text-[#163A2C]"}`}
        title={label}
      >
        {icon}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-[13.5px] font-semibold
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]
          ${isActive
            ? "bg-[#163A2C] text-white shadow-[0_6px_16px_-4px_rgba(22,58,44,0.45)]"
            : "text-[#163A2C]/65 hover:bg-[#FBF6EA] hover:text-[#163A2C]"}`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 text-left truncate">{label}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F0A93E]" />}
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isActive ? "text-white/70" : "text-[#163A2C]/30"}`} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="ml-[22px] pl-4 space-y-0.5 border-l-2 border-[#F0A93E]/25">
            {items.map((item) => {
              const itemActive = pathname === item.href || pathname.includes(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]
                    ${itemActive
                      ? "bg-[#F0A93E]/15 text-[#163A2C] font-bold"
                      : "text-[#163A2C]/55 hover:bg-[#FBF6EA] hover:text-[#163A2C]"}`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-[10px] leading-none px-1.5 py-1 rounded-full bg-[#163A2C] text-white font-bold">{item.count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0E241C]/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 border border-[#163A2C]/10">
        <div className="w-16 h-16 bg-[#F0A93E]/15 rounded-full flex items-center justify-center border border-[#F0A93E]/20">
          <AlertTriangle className="text-[#9A6A1E]" size={28} strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-[#163A2C] tracking-tight">Quitter Radio Grâce-Espoir ?</h2>
          <p className="text-[#163A2C]/60 text-sm leading-relaxed font-medium">
            Vous serez déconnecté de l'administration. Vous pourrez vous reconnecter à tout moment.
          </p>
        </div>
        <div className="flex gap-3 w-full pt-1">
          <button onClick={onCancel} className="flex-1 py-3 px-6 rounded-xl bg-[#FBF6EA] text-[#163A2C] text-sm font-bold hover:bg-[#F0A93E]/20 transition-all border border-[#163A2C]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]">
            Rester
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 px-6 rounded-xl bg-[#163A2C] text-white text-sm font-bold hover:bg-[#0E241C] transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [showLogout, setShowLogout] = useState(false);
  const [role] = useState<"ADMIN" | "REDACTEUR">("ADMIN");

  const navItems = role === "REDACTEUR" ? REDACTEUR_NAV_ITEMS : ADMIN_NAV_ITEMS;

  const handleLogout = () => {
    setShowLogout(false);
    window.location.href = "/login";
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const getItemClasses = (active: boolean) =>
    active
      ? "bg-[#163A2C] text-white shadow-[0_6px_16px_-4px_rgba(22,58,44,0.45)]"
      : "text-[#163A2C]/65 hover:bg-[#FBF6EA] hover:text-[#163A2C]";

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header logo */}
      <div className="flex items-center justify-between h-[76px] px-4 border-b border-[#163A2C]/[0.06] shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-white border border-[#163A2C]/10 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1.5">
              <Image src="/img/logo.png" alt="Radio Grâce-Espoir" width={40} height={40} className="object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-[#163A2C] text-[15px] tracking-tight leading-none truncate">Radio Grâce-Espoir</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F0A93E] uppercase tracking-widest mt-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A93E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F0A93E]" />
                </span>
                {role}
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-10 h-10 rounded-2xl bg-white border border-[#163A2C]/10 flex items-center justify-center shadow-sm p-1.5">
            <Image src="/img/logo.png" alt="RGE" width={28} height={28} className="object-contain" />
          </div>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex p-1.5 hover:bg-[#FBF6EA] rounded-lg transition text-[#163A2C]/40 hover:text-[#163A2C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]"
            aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 hover:bg-[#FBF6EA] rounded-lg text-[#163A2C]/50" aria-label="Fermer le menu">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {!collapsed && <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-[#163A2C]/30">Menu principal</p>}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          if (item.submenu && item.submenu.length > 0) {
            return <SubMenu key={item.href} label={item.label} href={item.href} icon={<Icon size={18} className="shrink-0" />} items={item.submenu} collapsed={collapsed} />;
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-[13.5px] font-semibold
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]
                ${getItemClasses(active)} ${collapsed ? "justify-center h-11 w-11 mx-auto px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F0A93E]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#163A2C]/[0.06] space-y-1 shrink-0">
        {!collapsed && <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-[#163A2C]/30">Système</p>}
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-[13.5px] font-semibold
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]
                ${getItemClasses(active)} ${collapsed ? "justify-center h-11 w-11 mx-auto px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        <button
          onClick={() => setShowLogout(true)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-[13.5px] font-semibold text-[#163A2C]/55 hover:bg-red-50 hover:text-red-600
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A93E]
            ${collapsed ? "justify-center h-11 w-11 mx-auto px-0" : ""}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Se déconnecter</span>}
        </button>


      </div>
    </div>
  );

  return (
    <>
      <aside
        style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-[#163A2C]/[0.06] z-40 transition-[width] duration-300 ease-in-out"
      >
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-[#0E241C]/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-[#163A2C]/[0.06] z-50 md:hidden flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={handleLogout} />}
    </>
  );
}