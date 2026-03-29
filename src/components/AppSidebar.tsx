import {
  LayoutDashboard,
  Users,
  BookOpen,
  School,
  Clock,
  Settings,
  CalendarDays,
  BarChart3,
  LogOut,
  ShieldCheck,
  GraduationCap,
  PartyPopper,
  Newspaper,
  Bell,
  Image,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import schoolLogo from "@/assets/logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { Separator } from "@/components/ui/separator";

const mainMenu = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Jadwal", url: "/jadwal", icon: CalendarDays, adminOnly: false },
  { title: "Statistik", url: "/statistik", icon: BarChart3, adminOnly: false },
];

const dataMenu = [
  { title: "Guru", url: "/guru", icon: Users, adminOnly: true },
  { title: "Mata Pelajaran", url: "/mapel", icon: BookOpen, adminOnly: true },
  { title: "Kelas", url: "/kelas", icon: School, adminOnly: true },
  { title: "Jam Pelajaran", url: "/jam", icon: Clock, adminOnly: true },
  { title: "Preferensi", url: "/preferensi", icon: Settings, adminOnly: false },
  { title: "Kegiatan", url: "/kegiatan", icon: PartyPopper, adminOnly: true },
];

const cmsMenu = [
  { title: "Berita", url: "/cms-berita", icon: Newspaper, adminOnly: true },
  { title: "Pengumuman", url: "/cms-pengumuman", icon: Bell, adminOnly: true },
  { title: "Galeri", url: "/cms-galeri", icon: Image, adminOnly: true },
  { title: "Profil", url: "/cms-profil", icon: School, adminOnly: true },
  { title: "Banner", url: "/cms-banner", icon: ImageIcon, adminOnly: true },
];

const settingsMenu = [
  { title: "Tahun Ajaran", url: "/tahun-ajaran", icon: GraduationCap, adminOnly: true },
  { title: "Manajemen Role", url: "/admin", icon: ShieldCheck, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    navigate("/login");
  };

  const filterItems = (items: typeof mainMenu) =>
    items.filter((item) => !item.adminOnly || isAdmin);

  const renderMenu = (items: typeof mainMenu) =>
    filterItems(items).map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
          <NavLink
            to={item.url}
            end
            className="hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="mr-2 h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1">
                <img src={schoolLogo} alt="Logo MTsN 5 Jakarta" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-sidebar-foreground leading-tight">e-Jadwal</h1>
                <p className="text-[10px] text-sidebar-foreground/60">MTsN 5 Jakarta</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto p-0.5">
              <img src={schoolLogo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
              Utama
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenu(mainMenu)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {filterItems(dataMenu).length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                Data Master
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenu(dataMenu)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {filterItems(cmsMenu).length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                Konten
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenu(cmsMenu)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {filterItems(settingsMenu).length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                Pengaturan
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenu(settingsMenu)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogout(true)}
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin keluar dari sistem?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
