
-- Banners table
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read banners" ON public.banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update banners" ON public.banners FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete banners" ON public.banners FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Site profile table (single row)
CREATE TABLE public.site_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'MTsN 5 Jakarta',
  description text DEFAULT '',
  history text DEFAULT '',
  vision text DEFAULT '',
  mission text DEFAULT '',
  image_url text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_profile" ON public.site_profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin update site_profile" ON public.site_profile FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert site_profile" ON public.site_profile FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default profile
INSERT INTO public.site_profile (title, description, vision, mission)
VALUES (
  'MTsN 5 Jakarta',
  'Madrasah Tsanawiyah Negeri 5 Jakarta adalah lembaga pendidikan Islam di bawah Kementerian Agama yang berkomitmen mencetak generasi unggul, beriman, berilmu, dan berakhlak mulia.',
  'Terwujudnya peserta didik yang beriman, berilmu, berakhlak mulia, dan berprestasi.',
  'Menyelenggarakan pendidikan berkualitas berbasis nilai-nilai Islam. Mengembangkan potensi peserta didik secara optimal. Membangun lingkungan belajar yang kondusif dan inovatif.'
);
