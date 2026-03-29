import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/guru": "Data Guru",
  "/mapel": "Mata Pelajaran",
  "/kelas": "Data Kelas",
  "/jam": "Jam Pelajaran",
  "/preferensi": "Preferensi Guru",
  "/jadwal": "Jadwal Pelajaran",
  "/kegiatan": "Kegiatan Khusus",
  "/berita": "Kelola Berita",
  "/pengumuman": "Kelola Pengumuman",
  "/galeri": "Kelola Galeri",
  "/statistik": "Statistik",
  "/tahun-ajaran": "Tahun Ajaran",
  "/admin": "Manajemen Role",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin");
      }
    });
  }, []);

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  const pageTitle = pageTitles[location.pathname] || "e-Jadwal";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 md:px-6 shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h2 className="font-semibold text-foreground text-base leading-tight">
                  {pageTitle}
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  e-Jadwal MTsN 5 Jakarta
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
