import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarDays, Bell } from "lucide-react";

const PengumumanDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading } = useQuery({
    queryKey: ["announcement-detail", id],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : !item ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Pengumuman tidak ditemukan</p>
          </div>
        ) : (
          <article className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{item.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            {item.description && (
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {item.description}
              </div>
            )}
          </article>
        )}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PengumumanDetailPage;
