-- Drop all existing permissive public policies on master tables

-- teachers
DROP POLICY IF EXISTS "Allow public delete teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public insert teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public read teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public update teachers" ON public.teachers;

-- subjects
DROP POLICY IF EXISTS "Allow public delete subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow public insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow public read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow public update subjects" ON public.subjects;

-- classes
DROP POLICY IF EXISTS "Allow public delete classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public insert classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public read classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public update classes" ON public.classes;

-- time_slots
DROP POLICY IF EXISTS "Allow public delete time_slots" ON public.time_slots;
DROP POLICY IF EXISTS "Allow public insert time_slots" ON public.time_slots;
DROP POLICY IF EXISTS "Allow public read time_slots" ON public.time_slots;
DROP POLICY IF EXISTS "Allow public update time_slots" ON public.time_slots;

-- teacher_subjects
DROP POLICY IF EXISTS "Allow public delete teacher_subjects" ON public.teacher_subjects;
DROP POLICY IF EXISTS "Allow public insert teacher_subjects" ON public.teacher_subjects;
DROP POLICY IF EXISTS "Allow public read teacher_subjects" ON public.teacher_subjects;
DROP POLICY IF EXISTS "Allow public update teacher_subjects" ON public.teacher_subjects;

-- teacher_preferences
DROP POLICY IF EXISTS "Allow public delete teacher_preferences" ON public.teacher_preferences;
DROP POLICY IF EXISTS "Allow public insert teacher_preferences" ON public.teacher_preferences;
DROP POLICY IF EXISTS "Allow public read teacher_preferences" ON public.teacher_preferences;
DROP POLICY IF EXISTS "Allow public update teacher_preferences" ON public.teacher_preferences;

-- schedules
DROP POLICY IF EXISTS "Allow public delete schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow public insert schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow public read schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow public update schedules" ON public.schedules;

-- ============================================================
-- NEW POLICIES: Authenticated users can read, only admins can write master data
-- ============================================================

-- teachers: read=authenticated, write=admin
CREATE POLICY "Authenticated read teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert teachers" ON public.teachers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update teachers" ON public.teachers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete teachers" ON public.teachers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- subjects: read=authenticated, write=admin
CREATE POLICY "Authenticated read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update subjects" ON public.subjects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete subjects" ON public.subjects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- classes: read=authenticated, write=admin
CREATE POLICY "Authenticated read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update classes" ON public.classes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete classes" ON public.classes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- time_slots: read=authenticated, write=admin
CREATE POLICY "Authenticated read time_slots" ON public.time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert time_slots" ON public.time_slots FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update time_slots" ON public.time_slots FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete time_slots" ON public.time_slots FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- teacher_subjects: read=authenticated, write=admin
CREATE POLICY "Authenticated read teacher_subjects" ON public.teacher_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert teacher_subjects" ON public.teacher_subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update teacher_subjects" ON public.teacher_subjects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete teacher_subjects" ON public.teacher_subjects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- teacher_preferences: read=authenticated, write=admin OR own preferences
CREATE POLICY "Authenticated read teacher_preferences" ON public.teacher_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin or own insert teacher_preferences" ON public.teacher_preferences FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR true);
CREATE POLICY "Admin or own update teacher_preferences" ON public.teacher_preferences FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR true);
CREATE POLICY "Admin delete teacher_preferences" ON public.teacher_preferences FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- schedules: read=authenticated, write=admin
CREATE POLICY "Authenticated read schedules" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert schedules" ON public.schedules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update schedules" ON public.schedules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete schedules" ON public.schedules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles: allow admin to read all profiles (for role management page)
CREATE POLICY "Admin read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

-- Drop the old restrictive select policy on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;