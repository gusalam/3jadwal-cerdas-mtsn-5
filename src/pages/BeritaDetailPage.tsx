import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarDays, Newspaper } from "lucide-react";

const BeritaDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", id!).single();
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
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !post ? (
          <div className="text-center py-16 text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Berita tidak ditemukan</p>
          </div>
        ) : (
          <article className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-xl object-cover max-h-[400px]"
              />
            )}
            {post.content && (
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            )}
          </article>
        )}
      </main>
      <PublicFooter />
    </div>
  );
};

export default BeritaDetailPage;
