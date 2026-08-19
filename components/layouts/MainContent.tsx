"use client";

import { useSidebar, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED, NAVBAR_HEIGHT } from "@/components/layouts/sidebar";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const sidebarOffset = collapsed? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div
      style={
        {
          "--sidebar-offset": `${sidebarOffset}px`,
          paddingTop: NAVBAR_HEIGHT,
        } as React.CSSProperties
      }
      className="min-h-screen bg-[#FBF6EA]/40 md:ml-[var(--sidebar-offset)] transition-[margin-left] duration-300 ease-in-out"
    >
      <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w- w-full mx-auto">
        {children}
      </div>
    </div>
  );
}