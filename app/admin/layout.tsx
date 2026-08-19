// app/admin/layout.tsx
import { SidebarProvider } from "@/components/layouts/sidebar";
import Sidebar from "@/components/layouts/sidebar";
import Navbar from "@/components/layouts/navbar";
import MainContent from "@/components/layouts/MainContent";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <Sidebar />
        <Navbar />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </LanguageProvider>
  );
}