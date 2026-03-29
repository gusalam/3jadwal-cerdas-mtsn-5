import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export const PublicHero = () => (
  <section id="beranda" className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="MTsN 5 Jakarta" className="w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
    </div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
      <div className="max-w-2xl space-y-6">
        <div className="inline-block bg-secondary/90 text-secondary-foreground text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full">
          Madrasah Mandiri Berprestasi
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Selamat Datang di
          <br />
          <span className="text-secondary">MTsN 5 Jakarta</span>
        </h2>
        <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
          Membentuk generasi unggul beriman, berilmu, dan berakhlak mulia melalui pendidikan berkualitas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/jadwal-publik">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold gap-2 rounded-xl shadow-lg">
              <CalendarDays className="w-4 h-4" />
              Lihat Jadwal
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold rounded-xl backdrop-blur-sm"
            onClick={() => document.getElementById("tentang")?.scrollIntoView({ behavior: "smooth" })}
          >
            Tentang Kami
          </Button>
        </div>
      </div>
    </div>
  </section>
);
