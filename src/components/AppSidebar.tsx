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

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Guru", url: "/guru", icon: Users, adminOnly: true },
  { title: "Mata Pelajaran", url: "/mapel", icon: BookOpen, adminOnly: true },
  { title: "Kelas", url: "/kelas", icon: School, adminOnly: true },
  { title: "Jam Pelajaran", url: "/jam", icon: Clock, adminOnly: true },
  { title: "Preferensi", url: "/preferensi", icon: Settings, adminOnly: false },
  { title: "Jadwal", url: "/jadwal", icon: CalendarDays, adminOnly: false },
  { title: "Kegiatan", url: "/kegiatan", icon: PartyPopper, adminOnly: true },
  { title: "Berita", url: "/berita", icon: Newspaper, adminOnly: true },
  { title: "Pengumuman", url: "/pengumuman", icon: Bell, adminOnly: true },
  { title: "Galeri", url: "/galeri", icon: Image, adminOnly: true },
  { title: "Statistik", url: "/statistik", icon: BarChart3, adminOnly: false },
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

  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img src={schoolLogo} alt="Logo MTsN 5 Jakarta" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-bold text-sm text-sidebar-foreground leading-tight">e-Jadwal</h1>
                <p className="text-[10px] text-sidebar-foreground/70">MTsN 5 Jakarta</p>
              </div>
            </div>
          ) : (
            <img src={schoolLogo} alt="Logo MTsN 5 Jakarta" className="w-8 h-8 object-contain mx-auto" />
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" onClick={() => setShowLogout(true)} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin logout?</AlertDialogDescription>
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
