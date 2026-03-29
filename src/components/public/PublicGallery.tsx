import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";

export const PublicGallery = () => {
  const { data: photos = [] } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  if (photos.length === 0) return null;

  return (
    <section id="galeri" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-secondary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Galeri Foto</h2>
        <ImageIcon className="w-5 h-5 text-secondary" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo: any) => (
          <div key={photo.id} className="group relative overflow-hidden rounded-xl shadow-md aspect-square">
            <img
              src={photo.image_url}
              alt={photo.caption ?? "Galeri MTsN 5 Jakarta"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-medium line-clamp-2">{photo.caption}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
