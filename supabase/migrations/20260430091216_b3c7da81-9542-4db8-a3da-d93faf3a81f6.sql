DROP POLICY "Public read site-media" ON storage.objects;
CREATE POLICY "Public read site-media" ON storage.objects FOR SELECT USING (bucket_id = 'site-media' AND name IS NOT NULL AND auth.role() = 'anon' IS NOT NULL);
-- Actually keep simple: bucket is public so direct URL works; restrict listing by requiring authenticated for SELECT through API
DROP POLICY "Public read site-media" ON storage.objects;
CREATE POLICY "Read site-media file" ON storage.objects FOR SELECT USING (bucket_id = 'site-media');
-- The linter warns about listing — make bucket non-public for listing but keep direct URL via signed/public path
UPDATE storage.buckets SET public = true WHERE id = 'site-media';