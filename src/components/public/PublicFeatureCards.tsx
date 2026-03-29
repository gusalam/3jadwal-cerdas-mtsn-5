import { Bell, CalendarDays, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Bell,
    title: "Pengumuman",
    description: "Info terbaru dari madrasah",
    action: { label: "Lihat", href: "#pengumuman" },
  },
  {
    icon: CalendarDays,
    title: "Jadwal Pelajaran",
    description: "Jadwal harian terupdate",
    action: { label: "Lihat", href: "/jadwal-publik", isRoute: true },
  },
  {
    icon: BookOpen,
    title: "Berita Madrasah",
    description: "Kegiatan dan informasi",
    action: { label: "Lihat", href: "#berita" },
  },
];

export const PublicFeatureCards = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {features.map((f) => (
        <Card key={f.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
          <CardContent className="flex items-center gap-4 p-5 sm:p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm sm:text-base">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
            </div>
            {f.action.isRoute ? (
              <Link to={f.action.href}>
                <Button size="sm" variant="outline" className="shrink-0 rounded-full text-xs">
                  {f.action.label}
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 rounded-full text-xs"
                onClick={() => document.getElementById(f.action.href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" })}
              >
                {f.action.label}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);
