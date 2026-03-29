import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Image, Pencil } from "lucide-react";

const GaleriPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ image_url: "", caption: "" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("gallery").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-gallery"] }); setOpen(false); toast.success("Berhasil disimpan"); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-gallery"] }); toast.success("Berhasil dihapus"); },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm({ image_url: "", caption: "" }); setOpen(true); };
  const openEdit = (g: any) => { setEditing(g); setForm({ image_url: g.image_url, caption: g.caption ?? "" }); setOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Image className="w-6 h-6" /> Kelola Galeri</h1>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Tambah</Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Memuat...</p>
        ) : items.length === 0 ? (
          <Card><CardContent className="text-center py-8 text-muted-foreground">Belum ada foto di galeri</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((g: any) => (
              <Card key={g.id} className="overflow-hidden group">
                <img src={g.image_url} alt={g.caption ?? ""} className="w-full h-48 object-cover" loading="lazy" />
                <CardContent className="p-3">
                  <p className="text-sm text-foreground truncate">{g.caption || "Tanpa caption"}</p>
                  <div className="flex gap-1 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(g)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove.mutate(g.id)} className="text-destructive"><Trash2 className="w-3 h-3 mr-1" /> Hapus</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Foto" : "Tambah Foto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>URL Gambar</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Caption</Label><Input value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} /></div>
            {form.image_url && <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-md" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => save.mutate()} disabled={!form.image_url.trim() || save.isPending}>{save.isPending ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GaleriPage;
