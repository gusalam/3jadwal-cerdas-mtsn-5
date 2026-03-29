import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Target } from "lucide-react";

const ProfilPage = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").limit(1).single();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : !profile ? (
          <p className="text-center text-muted-foreground py-16">Profil belum tersedia</p>
        ) : (
          <div className="space-y-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.title}</h1>

            {profile.image_url && (
              <img src={profile.image_url} alt={profile.title} className="w-full rounded-xl object-cover max-h-[400px]" />
            )}

            {profile.description && (
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {profile.description}
              </div>
            )}

            {profile.history && (
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Sejarah</h2>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {profile.history}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.vision && (
                <Card className="border-0 shadow-md border-t-4 border-t-primary">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Visi</h3>
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{profile.vision}</p>
                  </CardContent>
                </Card>
              )}
              {profile.mission && (
                <Card className="border-0 shadow-md border-t-4 border-t-secondary">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-secondary" />
                      <h3 className="text-lg font-bold text-foreground">Misi</h3>
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{profile.mission}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
};

export default ProfilPage;
