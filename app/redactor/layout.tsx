// app/admin/layout.tsx
import { SidebarProvider } from "@/components/layouts/sidebar";
import Sidebar from "@/components/layouts/sidebar";
import Navbar from "@/components/layouts/navbar";
import MainContent from "@/components/layouts/MainContent";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <Navbar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}