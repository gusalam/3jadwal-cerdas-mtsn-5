import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryLightboxProps {
  photos: any[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GalleryLightbox = ({ photos, initialIndex, open, onOpenChange }: GalleryLightboxProps) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => { setIndex(initialIndex); }, [initialIndex]);

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  // Swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black/95 border-0 gap-0 [&>button]:hidden">
        <div
          className="relative flex items-center justify-center min-h-[60vh] max-h-[90vh]"
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart === null) return;
            const diff = e.changedTouches[0].clientX - touchStart;
            if (Math.abs(diff) > 50) diff > 0 ? prev() : next();
            setTouchStart(null);
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full h-10 w-10"
            onClick={prev}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <img
            src={photo.image_url}
            alt={photo.caption ?? ""}
            className="max-h-[80vh] max-w-full object-contain mx-auto"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full h-10 w-10"
            onClick={next}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Caption & counter */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {photo.caption && <p className="text-white text-sm font-medium mb-1">{photo.caption}</p>}
            <p className="text-white/60 text-xs">{index + 1} / {photos.length}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
