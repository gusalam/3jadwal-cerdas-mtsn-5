import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { uploadMedia, deleteMedia } from "@/lib/uploadMedia";

const GaleriPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ image_url: "", caption: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      let imageUrl = form.image_url;

      if (imageFile) {
        imageUrl = await uploadMedia(imageFile, "galeri");
      }

      if (!imageUrl.trim()) throw new Error("Gambar wajib diupload");

      const payload = { image_url: imageUrl, caption: form.caption || null };

      if (editing) {
        if (imageFile && editing.image_url) {
          await deleteMedia(editing.image_url);
        }
        const { error } = await supabase.from("gallery").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      setOpen(false);
      setImageFile(null);
      toast.success("Berhasil disimpan");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (item: any) => {
      if (item.image_url) {
        await deleteMedia(item.image_url);
      }
      const { error } = await supabase.from("gallery").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Berhasil dihapus");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm({ image_url: "", caption: "" }); setImageFile(null); setOpen(true); };
  const openEdit = (g: any) => { setEditing(g); setForm({ image_url: g.image_url, caption: g.caption ?? "" }); setImageFile(null); setOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Kelola Galeri</h1>
            <p className="text-muted-foreground text-sm">Kelola foto dan gambar madrasah</p>
          </div>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Tambah Foto
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-md overflow-hidden">
                <div className="w-full h-48 bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
              <p>Belum ada foto di galeri</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((g: any) => (
              <Card key={g.id} className="border-0 shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={g.image_url}
                    alt={g.caption ?? ""}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-foreground truncate mb-3">
                    {g.caption || "Tanpa caption"}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(g)} className="flex-1">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="w-3 h-3 mr-1" /> Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Yakin ingin menghapus foto ini? Data yang sudah dihapus tidak dapat dikembalikan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove.mutate(g)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
            <DialogTitle>{editing ? "Edit Foto" : "Tambah Foto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              currentUrl={form.image_url}
              onUrlChange={(url) => setForm({ ...form, image_url: url })}
              onFileSelect={setImageFile}
              selectedFile={imageFile}
              label="Foto"
              required
            />
            <div className="space-y-2">
              <Label>Caption</Label>
              <Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Keterangan foto" />
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

export default GaleriPage;
