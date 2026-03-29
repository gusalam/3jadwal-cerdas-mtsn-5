import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, School } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PublicInfoGrid = () => {
  const { data: profile } = useQuery({
    queryKey: ["site-profile-preview"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("title, description, image_url").limit(1).single();
      return data;
    },
  });

  return (
    <section id="tentang" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tentang Kami */}
        <Card className="border-0 shadow-md overflow-hidden group">
          <div className="h-2 bg-primary" />
          {profile?.image_url && (
            <img src={profile.image_url} alt="Tentang Kami" className="w-full h-40 object-cover" loading="lazy" />
          )}
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Tentang Kami</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
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
        <Card className="border-0 shadow-md overflow-hidden bg-primary text-primary-foreground">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h3 className="text-lg font-bold">Info Akademik</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Tahun ajaran baru telah dimulai. Pantau jadwal pelajaran, kegiatan ekstrakurikuler, dan informasi akademik lainnya melalui platform digital kami.
            </p>
            <Link to="/jadwal-publik">
              <Button size="sm" variant="secondary" className="rounded-full text-xs font-semibold">
                Lihat Jadwal →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Lokasi */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 bg-secondary" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-foreground">Lokasi</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                Jl. Mardani Raya No. 25, Cempaka Putih, Jakarta Pusat, DKI Jakarta 10520
              </p>
              <p>📞 (021) 4401833</p>
              <p>✉️ mtslimajakarta@gmail.com</p>
            </div>
            <a href="https://maps.app.goo.gl/4fKTCkq4xWcBSwQMA" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Lihat di Maps →
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};