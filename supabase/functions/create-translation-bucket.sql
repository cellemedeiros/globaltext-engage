-- Create a storage bucket for translations
INSERT INTO storage.buckets (id, name)
VALUES ('translations', 'translations')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload translations"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'translations'
);

-- Allow authenticated users to read translations
CREATE POLICY "Allow authenticated users to read translations"
ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'translations'
);