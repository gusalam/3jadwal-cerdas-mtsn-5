import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PublicVideoSlider = () => {
  const fade = useScrollFadeIn();

  const { data: videos = [] } = useQuery({
    queryKey: ["public-videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return (data ?? []) as { id: string; title: string; youtube_id: string }[];
    },
  });

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const len = videos.length;

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (len <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % len);
    }, 5000);
  }, [len, stopAutoplay]);

  // Auto-start autoplay only when not playing and user hasn't interacted
  useEffect(() => {
    if (!playing && !userInteracted && len > 1) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [playing, userInteracted, startAutoplay, stopAutoplay, len]);

  // Reset user interaction after 10s of inactivity
  useEffect(() => {
    if (!userInteracted || playing) return;
    const timer = setTimeout(() => {
      setUserInteracted(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [userInteracted, playing]);

  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    setUserInteracted(false);
  }, [len]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setPlaying(false);
    setUserInteracted(true);
    stopAutoplay();
  };

  const prev = () => goTo(current > 0 ? current - 1 : len - 1);
  const next = () => goTo((current + 1) % len);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  // Listen for YouTube postMessage events for play state detection
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        // YouTube sends state changes as {event: "onStateChange", info: N}
        // or nested in {event: "infoDelivery", info: {playerState: N}}
        const state = data?.event === "onStateChange"
          ? data.info
          : data?.info?.playerState;

        if (state !== undefined) {
          if (state === 1 || state === 3) {
            // Playing or buffering
            setPlaying(true);
            setUserInteracted(true);
            stopAutoplay();
          } else if (state === 2 || state === 0 || state === -1) {
            // Paused, ended, or unstarted
            setPlaying(false);
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [stopAutoplay]);

  // Enable YouTube iframe API event listening
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const enableApi = () => {
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: "listening", id: "yt-player" }),
          "*"
        );
      } catch {
        // cross-origin, ignore
      }
    };
    iframe.addEventListener("load", enableApi);
    return () => iframe.removeEventListener("load", enableApi);
  }, [current]);

  if (videos.length === 0) return null;
  const video = videos[current];

  return (
    <section ref={fade.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-700 ${fade.className}`}>
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
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-card">
          <div className="aspect-video w-full">
            <iframe
              ref={iframeRef}
              key={video.youtube_id + current}
              src={`https://www.youtube.com/embed/${video.youtube_id}?enablejsapi=1&rel=0&origin=${window.location.origin}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              loading="lazy"
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="font-semibold text-foreground">{video.title}</h3>
          </div>
        </Card>

        {len > 1 && (
          <>
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
          </>
        )}
      </div>

      {len > 1 && (
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
      )}
    </section>
  );
};
