import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const PublicAnnouncements = () => {
  const { data: announcements = [] } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  if (announcements.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Bell className="w-5 h-5 text-amber-500" /> Pengumuman
      </h2>
      <div className="space-y-2">
        {announcements.map((a: any) => (
          <Card key={a.id} className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-foreground">{a.title}</h3>
              {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                {new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
