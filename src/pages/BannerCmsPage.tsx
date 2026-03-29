import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadMedia, deleteMedia } from "@/lib/uploadMedia";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";

const BannerCmsPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      let imageUrl = form.image_url;
      if (imageFile) {
        imageUrl = await uploadMedia(imageFile, "banners");
      }
      if (!imageUrl.trim()) throw new Error("Gambar wajib diupload");

      const payload = { title: form.title, subtitle: form.subtitle, image_url: imageUrl, is_active: form.is_active };

      if (editing) {
        if (imageFile && editing.image_url) await deleteMedia(editing.image_url);
        const { error } = await supabase.from("banners").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        if (banners.length >= 3) throw new Error("Maksimal 3 banner");
        const { error } = await supabase.from("banners").insert({ ...payload, sort_order: banners.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      setOpen(false);
      setImageFile(null);
      toast.success("Banner berhasil disimpan");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (b: any) => {
      if (b.image_url) await deleteMedia(b.image_url);
      const { error } = await supabase.from("banners").delete().eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner dihapus");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm({ title: "", subtitle: "", image_url: "", is_active: true }); setImageFile(null); setOpen(true); };
  const openEdit = (b: any) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle ?? "", image_url: b.image_url, is_active: b.is_active }); setImageFile(null); setOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Kelola Banner</h1>
            <p className="text-muted-foreground text-sm">Atur banner hero di halaman publik (maks. 3)</p>
          </div>
          <Button onClick={openNew} disabled={banners.length >= 3}>
            <Plus className="w-4 h-4 mr-1" /> Tambah Banner
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => <Card key={i} className="border-0 shadow-md"><CardContent className="p-4"><div className="h-32 bg-muted animate-pulse rounded-lg" /></CardContent></Card>)}
          </div>
        ) : banners.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
              <p>Belum ada banner. Banner default akan digunakan.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {banners.map((b: any) => (
              <Card key={b.id} className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <img src={b.image_url} alt={b.title} className="w-full sm:w-64 h-40 object-cover" loading="lazy" />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">{b.title || "Tanpa judul"}</h3>
                          <Badge variant={b.is_active ? "default" : "outline"} className="text-xs">{b.is_active ? "Aktif" : "Nonaktif"}</Badge>
                        </div>
                        {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => openEdit(b)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10"><Trash2 className="w-3 h-3 mr-1" /> Hapus</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
                              <AlertDialogDescription>Banner akan dihapus permanen.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove.mutate(b)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Tambah Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload currentUrl={form.image_url} onUrlChange={(url) => setForm({ ...form, image_url: url })} onFileSelect={setImageFile} selectedFile={imageFile} label="Gambar Banner" required />
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Selamat Datang di MTsN 5 Jakarta" />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Madrasah Mandiri Berprestasi" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Aktifkan banner</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => save.mutate()} disabled={(!form.image_url.trim() && !imageFile) || save.isPending}>
              {save.isPending ? "Mengupload..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default BannerCmsPage;
