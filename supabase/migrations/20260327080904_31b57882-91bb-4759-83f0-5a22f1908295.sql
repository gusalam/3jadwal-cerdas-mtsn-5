
CREATE TABLE public.special_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  day text NOT NULL,
  time_slot_id uuid NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  description text,
  event_type text NOT NULL DEFAULT 'other',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read special_events" ON public.special_events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin insert special_events" ON public.special_events
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update special_events" ON public.special_events
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete special_events" ON public.special_events
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
