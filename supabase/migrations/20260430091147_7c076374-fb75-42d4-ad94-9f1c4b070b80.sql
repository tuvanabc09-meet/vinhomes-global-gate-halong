-- Table for admin-managed media (images per slot + intro video)
CREATE TABLE public.site_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('image','video')),
  url TEXT NOT NULL,
  video_type TEXT CHECK (video_type IN ('youtube','upload')),
  title TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads site media" ON public.site_media FOR SELECT USING (true);
CREATE POLICY "Admins insert site media" ON public.site_media FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site media" ON public.site_media FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete site media" ON public.site_media FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER site_media_updated_at BEFORE UPDATE ON public.site_media FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('site-media','site-media', true);

CREATE POLICY "Public read site-media" ON storage.objects FOR SELECT USING (bucket_id = 'site-media');
CREATE POLICY "Admins upload site-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete site-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin'));