import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export const PublicHero = () => {
  const { data: banners = [] } = useQuery({
    queryKey: ["public-banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(3);
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  const [current, setCurrent] = useState(0);
  const slides = banners.length > 0 ? banners : [{ title: "Selamat Datang di MTsN 5 Jakarta", subtitle: "Madrasah Mandiri Berprestasi", image_url: heroBg }];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section id="beranda" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={slide.image_url || heroBg}
          alt={slide.title}
          className="w-full h-full object-cover transition-opacity duration-700"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl space-y-6">
          <div className="inline-block bg-secondary/90 text-secondary-foreground text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full">
            {slide.subtitle || "Madrasah Mandiri Berprestasi"}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {slide.title || "Selamat Datang di"}
            {!banners.length && (
              <>
                <br />
                <span className="text-secondary">MTsN 5 Jakarta</span>
              </>
            )}
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
            <Link to="/profil">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold rounded-xl backdrop-blur-sm"
              >
                Tentang Kami
              </Button>
            </Link>
          </div>
        </div>

        {/* Slide controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full" onClick={() => setCurrent((c) => (c > 0 ? c - 1 : slides.length - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1.5">
              {slides.map((_: any, i: number) => (
                <button key={i} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`} onClick={() => setCurrent(i)} />
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full" onClick={() => setCurrent((c) => (c + 1) % slides.length)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
