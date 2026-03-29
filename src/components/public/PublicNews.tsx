import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export const PublicNews = () => {
  const { data: posts = [] } = useQuery({
    queryKey: ["public-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  if (posts.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primary" /> Berita Terbaru
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {posts.map((p: any) => (
          <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow">
            {p.image_url && (
              <img src={p.image_url} alt={p.title} className="w-full h-36 object-cover" loading="lazy" />
            )}
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">{p.title}</h3>
              {p.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{p.content}</p>}
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
