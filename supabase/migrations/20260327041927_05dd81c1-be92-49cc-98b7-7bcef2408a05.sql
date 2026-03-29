-- Academic years table
CREATE TABLE public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  semester text NOT NULL DEFAULT 'Ganjil',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read academic_years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert academic_years" ON public.academic_years FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update academic_years" ON public.academic_years FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete academic_years" ON public.academic_years FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add academic_year_id to schedules (nullable for backward compat)
ALTER TABLE public.schedules ADD COLUMN academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL;

-- Function to ensure only one active academic year
CREATE OR REPLACE FUNCTION public.ensure_single_active_year()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.academic_years SET is_active = false WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_single_active_year
  BEFORE INSERT OR UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_active_year();