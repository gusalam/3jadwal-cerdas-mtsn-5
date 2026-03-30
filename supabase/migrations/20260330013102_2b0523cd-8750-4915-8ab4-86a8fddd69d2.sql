CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_id text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active videos" ON public.videos FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin read all videos" ON public.videos FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin insert videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update videos" ON public.videos FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete videos" ON public.videos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.videos (title, youtube_id, sort_order) VALUES
  ('Profil MTsN 5 Jakarta', 'dQw4w9WgXcQ', 1),
  ('Kegiatan Belajar Mengajar', 'dQw4w9WgXcQ', 2),
  ('Ekstrakurikuler & Prestasi', 'dQw4w9WgXcQ', 3);