import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const videos = [
  {
    id: "dQw4w9WgXcQ",
    title: "Profil MTsN 5 Jakarta",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Kegiatan Belajar Mengajar",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Ekstrakurikuler & Prestasi",
  },
];

export const PublicVideoSlider = () => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef(0);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % videos.length);
    }, 5000);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing) startAutoplay();
    return () => stopAutoplay();
  }, [playing, startAutoplay, stopAutoplay]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    if (!playing) {
      stopAutoplay();
      startAutoplay();
    }
  };

  const prev = () => goTo(current > 0 ? current - 1 : videos.length - 1);
  const next = () => goTo((current + 1) % videos.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  // Listen for YouTube postMessage events
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data.event === "onStateChange") {
          if (data.info === 1) {
            setPlaying(true);
            stopAutoplay();
          } else if (data.info === 2 || data.info === 0) {
            setPlaying(false);
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [stopAutoplay]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
          <Play className="w-3.5 h-3.5" />
          Video Sekolah
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Video & Kegiatan</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Lihat berbagai kegiatan dan aktivitas di MTsN 5 Jakarta
        </p>
      </div>

      <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Video card */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-card">
          <div className="aspect-video w-full">
            <iframe
              key={current}
              src={`https://www.youtube.com/embed/${videos[current].id}?enablejsapi=1&rel=0`}
              title={videos[current].title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              loading="lazy"
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="font-semibold text-foreground">{videos[current].title}</h3>
          </div>
        </Card>

        {/* Desktop nav buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden md:flex h-10 w-10 rounded-full bg-card shadow-lg border-0 hover:bg-muted"
          onClick={prev}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:flex h-10 w-10 rounded-full bg-card shadow-lg border-0 hover:bg-muted"
          onClick={next}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
