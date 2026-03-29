import { useState } from "react";
import { Menu, X, Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import schoolLogo from "@/assets/logo.png";

const navItems = [
  { id: "beranda", label: "Beranda", href: "#beranda" },
  { id: "tentang", label: "Profil", href: "#tentang" },
  { id: "fitur", label: "Akademik", href: "#fitur" },
  { id: "berita", label: "Berita", href: "#berita" },
  { id: "galeri", label: "Galeri", href: "#galeri" },
  { id: "kontak", label: "Kontak", href: "#kontak" },
];

export const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    if (id === "beranda") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar with socials */}
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
          <Link to="/login">
            <Button size="sm" variant="outline" className="h-6 text-[10px] border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
              Login Admin
            </Button>
          </Link>
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

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <Link to="/login" className="lg:hidden">
              <Button size="sm" variant="outline" className="h-7 text-[10px] border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                Login
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden border-t border-primary-foreground/10 bg-primary/95 backdrop-blur-sm px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              className="block w-full text-left text-sm py-2.5 px-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg transition-colors"
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
