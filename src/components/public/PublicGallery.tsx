import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";
import { GalleryLightbox } from "./GalleryLightbox";
import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";

export const PublicGallery = () => {
  const fade = useScrollFadeIn();
  const { data: photos = [] } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Mobile auto-slider
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    intervalRef.current = setInterval(() => {
      setSlideIndex((i) => (i + 1) % photos.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [photos.length, paused]);

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }, []);

  if (photos.length === 0) return null;

  return (
    <section id="galeri" ref={fade.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-700 ${fade.className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-secondary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Galeri Foto</h2>
        <ImageIcon className="w-5 h-5 text-secondary" />
      </div>

      {/* Mobile slider */}
      <div
        className="sm:hidden relative overflow-hidden rounded-xl"
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {photos.map((photo: any, i: number) => (
            <div key={photo.id} className="min-w-full aspect-square relative cursor-pointer" onClick={() => openLightbox(i)}>
              <img
                src={photo.image_url}
                alt={photo.caption ?? "Galeri"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs font-medium line-clamp-1">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {photos.map((_: any, i: number) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === slideIndex ? "bg-primary" : "bg-muted-foreground/30"}`}
              onClick={() => setSlideIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo: any, i: number) => (
          <div
            key={photo.id}
            className="group relative overflow-hidden rounded-xl shadow-md aspect-square cursor-pointer"
            onClick={() => openLightbox(i)}
          >
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

      <GalleryLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </section>
  );
};
