
-- CMS Tables: posts, announcements, gallery

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  image_url text,
  category text NOT NULL DEFAULT 'berita',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read posts" ON public.posts FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update posts" ON public.posts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete posts" ON public.posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin read all posts" ON public.posts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update announcements" ON public.announcements FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete announcements" ON public.announcements FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin read all announcements" ON public.announcements FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update gallery" ON public.gallery FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete gallery" ON public.gallery FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add public read policies for schedules, classes, teachers, subjects, time_slots (for public dashboard)
CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT TO anon USING (true);
CREATE POLICY "Public read classes" ON public.classes FOR SELECT TO anon USING (true);
CREATE POLICY "Public read teachers" ON public.teachers FOR SELECT TO anon USING (true);
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT TO anon USING (true);
CREATE POLICY "Public read time_slots" ON public.time_slots FOR SELECT TO anon USING (true);
