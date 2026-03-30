import { useState } from "react";
import { Menu, X, Instagram, Youtube, Mail, Home, CalendarDays, Bell, Newspaper, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import schoolLogo from "@/assets/logo.png";

const navItems = [
  { id: "beranda", label: "Beranda", href: "#beranda" },
  { id: "tentang", label: "Profil", href: "#tentang" },
  { id: "fitur", label: "Akademik", href: "#fitur" },
  { id: "berita", label: "Berita", href: "#berita" },
  { id: "galeri", label: "Galeri", href: "#galeri" },
  { id: "kontak", label: "Kontak", href: "#kontak" },
];

const sidebarItems = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Jadwal", href: "/jadwal-publik", icon: CalendarDays },
  { label: "Pengumuman", href: "#pengumuman", icon: Bell, scroll: true },
  { label: "Berita", href: "#berita", icon: Newspaper, scroll: true },
];

export const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    if (id === "beranda") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar with socials - desktop only */}
        <div className="hidden lg:flex items-center justify-end gap-3 py-1.5 border-b border-primary-foreground/10">
          <a href="https://www.instagram.com/mtsn5jkt" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <a href="https://youtube.com/@mtsn5jakarta" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <Youtube className="w-3.5 h-3.5" />
          </a>
          <a href="mailto:mtslimajakarta@gmail.com" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Main navbar */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center p-1">
              <img src={schoolLogo} alt="Logo MTsN 5 Jakarta" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-primary-foreground leading-tight tracking-tight">
                MTsN 5 JAKARTA
              </h1>
              <p className="text-[10px] sm:text-xs text-primary-foreground/70 leading-tight">
                Madrasah Tsanawiyah Negeri 5 Jakarta
              </p>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sidebar trigger (hamburger) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-primary border-primary-foreground/10 p-0">
              <div className="flex items-center gap-3 p-5 border-b border-primary-foreground/10">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center p-1">
                  <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-primary-foreground">MTsN 5 Jakarta</h2>
                  <p className="text-[10px] text-primary-foreground/60">Menu Navigasi</p>
                </div>
              </div>

              <div className="py-4 px-3 space-y-1">
                {sidebarItems.map((item) =>
                  item.scroll ? (
                    <button
                      key={item.label}
                      onClick={() => {
                        setOpen(false);
                        setTimeout(() => {
                          document.getElementById(item.href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                )}

                <div className="my-3 border-t border-primary-foreground/10" />

                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  Login Admin
                </Link>
              </div>

              {/* Social links */}
              <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-primary-foreground/10">
                <p className="text-[10px] text-primary-foreground/40 uppercase tracking-wider mb-3">Sosial Media</p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/mtsn5jkt" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://youtube.com/@mtsn5jakarta" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="mailto:mtslimajakarta@gmail.com" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
