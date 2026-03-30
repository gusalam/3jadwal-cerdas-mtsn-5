import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, School } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaggerFadeIn } from "@/hooks/useStaggerFadeIn";

export const PublicInfoGrid = () => {
  const stagger = useStaggerFadeIn(3, 150);
  const { data: profile } = useQuery({
    queryKey: ["site-profile-preview"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("title, description, image_url").limit(1).single();
      return data;
    },
  });

  return (
    <section id="tentang" ref={stagger.ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Full-width photo */}
      {profile?.image_url && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={profile.image_url}
            alt="MTsN 5 Jakarta"
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* 3-column card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tentang Kami */}
        <Card style={stagger.getItemStyle(0)} className="border-0 shadow-md overflow-hidden group rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-h-[220px] flex flex-col">
          <div className="h-1.5 bg-primary" />
          <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <School className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Tentang Kami</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {profile?.description || "Madrasah Tsanawiyah Negeri 5 Jakarta adalah lembaga pendidikan Islam yang berkomitmen mencetak generasi unggul."}
            </p>
            <Link to="/profil">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Baca Selengkapnya →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Info Akademik */}
        <Card style={stagger.getItemStyle(1)} className="border-0 shadow-md overflow-hidden bg-primary text-primary-foreground rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-h-[220px] flex flex-col">
          <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Info Akademik</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed flex-1">
              Tahun ajaran baru telah dimulai. Pantau jadwal pelajaran, kegiatan ekstrakurikuler, dan informasi akademik lainnya melalui platform digital kami.
            </p>
            <Link to="/jadwal-publik">
              <Button size="sm" variant="secondary" className="rounded-full text-xs font-semibold">
                Lihat Jadwal →
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </section>
  );
};
