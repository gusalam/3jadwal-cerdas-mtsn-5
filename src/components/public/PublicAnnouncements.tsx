import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { usePublicAnnouncements } from "@/hooks/usePublicData";
import { AnnouncementsSkeleton } from "./SectionSkeleton";
import { SectionError } from "./SectionError";

export const PublicAnnouncements = () => {
  const fade = useScrollFadeIn();
  const { data: announcements = [], isLoading, isError } = usePublicAnnouncements();

  if (isLoading) return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <AnnouncementsSkeleton />
    </section>
  );
  if (isError) return <SectionError message="Pengumuman tidak tersedia" />;
  if (announcements.length === 0) return null;

  return (
    <section id="pengumuman" ref={fade.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-700 ${fade.className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-secondary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pengumuman</h2>
        <Bell className="w-5 h-5 text-secondary" />
      </div>
      <div className="space-y-3">
        {announcements.map((a) => (
          <Link key={a.id} to={`/pengumuman/${a.id}`}>
            <Card className="border-0 shadow-sm border-l-4 border-l-secondary hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-foreground">{a.title}</h3>
                    {a.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
