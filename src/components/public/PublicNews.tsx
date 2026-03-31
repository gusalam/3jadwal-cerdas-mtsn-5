import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { useStaggerFadeIn } from "@/hooks/useStaggerFadeIn";
import { usePublicPosts } from "@/hooks/usePublicData";
import { NewsSkeleton } from "./SectionSkeleton";
import { SectionError } from "./SectionError";

export const PublicNews = () => {
  const stagger = useStaggerFadeIn(4, 120);
  const { data: posts = [], isLoading, isError } = usePublicPosts();

  if (isLoading) return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <NewsSkeleton />
    </section>
  );
  if (isError) return <SectionError message="Berita tidak tersedia" />;
  if (posts.length === 0) return null;

  return (
    <section id="berita" ref={stagger.ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-primary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Berita Terbaru</h2>
        <Newspaper className="w-5 h-5 text-primary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {posts.map((p, i) => (
          <Card key={p.id} style={stagger.getItemStyle(i)} className="border-0 shadow-md overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
            {p.image_url ? (
              <div className="overflow-hidden">
                <img src={p.image_url} alt={p.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
            ) : (
              <div className="w-full h-44 bg-muted flex items-center justify-center">
                <Newspaper className="w-10 h-10 text-muted-foreground/30" />
              </div>
            )}
            <CardContent className="p-4 space-y-2">
              <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{p.title}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              {p.content && <p className="text-xs text-muted-foreground line-clamp-2">{p.content}</p>}
              <Link to={`/berita/${p.id}`}>
                <Button variant="outline" size="sm" className="rounded-full text-xs w-full mt-2">
                  Selengkapnya →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
