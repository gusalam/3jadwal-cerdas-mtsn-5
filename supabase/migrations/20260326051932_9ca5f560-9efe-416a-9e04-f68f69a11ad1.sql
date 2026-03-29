
-- Teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow public insert teachers" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teachers" ON public.teachers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete teachers" ON public.teachers FOR DELETE USING (true);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hours_per_week INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete subjects" ON public.subjects FOR DELETE USING (true);

-- Classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public insert classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete classes" ON public.classes FOR DELETE USING (true);

-- Time slots table
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read time_slots" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Allow public insert time_slots" ON public.time_slots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update time_slots" ON public.time_slots FOR UPDATE USING (true);
CREATE POLICY "Allow public delete time_slots" ON public.time_slots FOR DELETE USING (true);

-- Teacher-Subject mapping
CREATE TABLE public.teacher_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, subject_id)
);
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read teacher_subjects" ON public.teacher_subjects FOR SELECT USING (true);
CREATE POLICY "Allow public insert teacher_subjects" ON public.teacher_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teacher_subjects" ON public.teacher_subjects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete teacher_subjects" ON public.teacher_subjects FOR DELETE USING (true);

-- Teacher preferences
CREATE TABLE public.teacher_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(teacher_id, time_slot_id)
);
ALTER TABLE public.teacher_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read teacher_preferences" ON public.teacher_preferences FOR SELECT USING (true);
CREATE POLICY "Allow public insert teacher_preferences" ON public.teacher_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teacher_preferences" ON public.teacher_preferences FOR UPDATE USING (true);
CREATE POLICY "Allow public delete teacher_preferences" ON public.teacher_preferences FOR DELETE USING (true);

-- Schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, time_slot_id)
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update schedules" ON public.schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete schedules" ON public.schedules FOR DELETE USING (true);
