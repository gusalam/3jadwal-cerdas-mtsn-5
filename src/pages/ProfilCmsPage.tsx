import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadMedia, deleteMedia } from "@/lib/uploadMedia";
import { toast } from "sonner";
import { Save } from "lucide-react";

const ProfilCmsPage = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", history: "", vision: "", mission: "", image_url: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["cms-site-profile"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setProfileId(profile.id);
      setForm({
        title: profile.title ?? "",
        description: profile.description ?? "",
        history: profile.history ?? "",
        vision: profile.vision ?? "",
        mission: profile.mission ?? "",
        image_url: profile.image_url ?? "",
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      let imageUrl = form.image_url;
      if (imageFile) {
        if (profile?.image_url) await deleteMedia(profile.image_url);
        imageUrl = await uploadMedia(imageFile, "profil");
      }
      const payload = { ...form, image_url: imageUrl || "", updated_at: new Date().toISOString() };
      if (profileId) {
        const { error } = await supabase.from("site_profile").update(payload).eq("id", profileId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_profile").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-site-profile"] });
      qc.invalidateQueries({ queryKey: ["site-profile"] });
      setImageFile(null);
      toast.success("Profil berhasil disimpan");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AppLayout>
      <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Profil Madrasah</h1>
          <p className="text-muted-foreground text-sm">Kelola informasi profil yang tampil di website publik</p>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-5">
            {isLoading ? (
              <p className="text-muted-foreground">Memuat...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Nama Sekolah</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Sejarah</Label>
                  <Textarea rows={4} value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Visi</Label>
                  <Textarea rows={3} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Misi</Label>
                  <Textarea rows={3} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
                </div>
                <ImageUpload
                  currentUrl={form.image_url}
                  onUrlChange={(url) => setForm({ ...form, image_url: url })}
                  onFileSelect={setImageFile}
                  selectedFile={imageFile}
                  label="Gambar Profil"
                />
                <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
                  <Save className="w-4 h-4" />
                  {save.isPending ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilCmsPage;
