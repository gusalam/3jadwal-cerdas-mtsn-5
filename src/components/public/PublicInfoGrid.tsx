import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, School } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicSiteProfile } from "@/hooks/usePublicData";
import { useStaggerFadeIn } from "@/hooks/useStaggerFadeIn";
import { Skeleton } from "@/components/ui/skeleton";

export const PublicInfoGrid = () => {
  const stagger = useStaggerFadeIn(3, 150);
  const { data: profile, isLoading, isError } = usePublicSiteProfile();

  return (
    <section id="tentang" ref={stagger.ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tentang Kami */}
        <div style={stagger.getItemStyle(0)} className="rounded-2xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-card flex flex-col">
          {isLoading ? (
            <>
              <Skeleton className="w-full aspect-video" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </>
          ) : isError ? (
            <div className="p-6 text-sm text-muted-foreground">Data profil tidak tersedia</div>
          ) : (
            <>
              {profile?.image_url && (
                <img
                  src={profile.image_url}
                  alt="MTsN 5 Jakarta"
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
              )}
              <div className="h-1.5 bg-primary" />
              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <School className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Tentang Kami</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 flex-1">
                  {profile?.description || "Informasi profil belum tersedia."}
                </p>
                <Link to="/profil">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    Baca Selengkapnya →
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Info Akademik */}
        <Card style={stagger.getItemStyle(1)} className="border-0 shadow-md overflow-hidden bg-primary text-primary-foreground rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col">
          <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Info Akademik</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed flex-1">
              Pantau jadwal pelajaran, kegiatan ekstrakurikuler, dan informasi akademik lainnya melalui platform digital kami.
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
