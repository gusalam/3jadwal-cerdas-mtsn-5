import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Realtime subscription helper
function useRealtimeInvalidation(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`public-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [table, queryClient, queryKey]);
}

export function usePublicBanners() {
  const key = ["public-banners"];
  useRealtimeInvalidation("banners", key);
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, title, subtitle, image_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60000,
  });
}

export function usePublicSiteProfile() {
  const key = ["public-site-profile"];
  useRealtimeInvalidation("site_profile", key);
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_profile")
        .select("title, description, image_url")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 120000,
  });
}

export function usePublicGallery() {
  const key = ["public-gallery"];
  useRealtimeInvalidation("gallery", key);
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id, image_url, caption")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60000,
  });
}

export function usePublicVideos() {
  const key = ["public-videos"];
  useRealtimeInvalidation("videos", key);
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, youtube_id")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60000,
  });
}

export function usePublicAnnouncements() {
  const key = ["public-announcements"];
  useRealtimeInvalidation("announcements", key);
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, description, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30000,
  });
}

export function usePublicPosts() {
  const key = ["public-posts"];
  useRealtimeInvalidation("posts", key);
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, image_url, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30000,
  });
}
