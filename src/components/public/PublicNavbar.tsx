import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "jadwal", label: "Jadwal" },
  { id: "pengumuman", label: "Pengumuman" },
  { id: "berita", label: "Berita" },
  { id: "kontak", label: "Kontak" },
  { id: "lokasi", label: "Lokasi" },
];

export const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-10">
        <div className="hidden sm:flex items-center gap-1">
          {sections.map((s) => (
            <Button key={s.id} variant="ghost" size="sm" className="text-xs h-8" onClick={() => scrollTo(s.id)}>
              {s.label}
            </Button>
          ))}
        </div>
        <div className="sm:hidden">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(!open)}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
        <div className="hidden sm:block" />
      </div>
      {open && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-2 space-y-1">
          {sections.map((s) => (
            <button key={s.id} className="block w-full text-left text-sm py-1.5 text-muted-foreground hover:text-foreground" onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
