
-- Create a public storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to delete media
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Allow public read access to media
CREATE POLICY "Public read access to media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');
