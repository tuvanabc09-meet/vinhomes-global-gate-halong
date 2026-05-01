-- Bảng tài liệu dự án
CREATE TABLE public.site_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' | 'image' | 'other'
  mime_type TEXT,
  file_size BIGINT,
  thumbnail_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active documents"
ON public.site_documents FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins read all documents"
ON public.site_documents FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert documents"
ON public.site_documents FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update documents"
ON public.site_documents FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete documents"
ON public.site_documents FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_site_documents_updated_at
BEFORE UPDATE ON public.site_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_site_documents_active_order ON public.site_documents (is_active, sort_order);

-- Cho phép upload các loại file vào bucket site-media (đã public sẵn)
-- Policy upload đã có cho admin trên storage.objects? Kiểm tra & thêm nếu thiếu.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins upload site-media'
  ) THEN
    CREATE POLICY "Admins upload site-media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-media' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins update site-media'
  ) THEN
    CREATE POLICY "Admins update site-media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-media' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins delete site-media'
  ) THEN
    CREATE POLICY "Admins delete site-media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-media' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read site-media'
  ) THEN
    CREATE POLICY "Public read site-media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-media');
  END IF;
END $$;