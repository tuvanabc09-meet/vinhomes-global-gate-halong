CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_interest TEXT,
  budget TEXT,
  note TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Basic length guards (server-side validation)
ALTER TABLE public.leads
  ADD CONSTRAINT leads_full_name_len CHECK (char_length(full_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT leads_phone_len CHECK (char_length(phone) BETWEEN 6 AND 20),
  ADD CONSTRAINT leads_email_len CHECK (email IS NULL OR char_length(email) <= 255),
  ADD CONSTRAINT leads_note_len CHECK (note IS NULL OR char_length(note) <= 1000),
  ADD CONSTRAINT leads_product_len CHECK (product_interest IS NULL OR char_length(product_interest) <= 100),
  ADD CONSTRAINT leads_budget_len CHECK (budget IS NULL OR char_length(budget) <= 100);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a new lead
CREATE POLICY "Anyone can submit lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read / update / delete
CREATE POLICY "Admins read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);