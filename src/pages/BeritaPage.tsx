import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/TablePagination";

const BeritaPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", image_url: "", category: "berita", is_published: true });
  const [search, setSearch] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Judul wajib diisi");
      if (editing) {
        const { error } = await supabase.from("posts").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["posts-count"] });
      setOpen(false);
      toast.success("Berhasil disimpan");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["posts-count"] });
      toast.success("Berhasil dihapus");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((p: any) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [posts, search]);

  const pagination = usePagination(filteredPosts);
  useEffect(() => { pagination.reset(); }, [search]);

  const openNew = () => { setEditing(null); setForm({ title: "", content: "", image_url: "", category: "berita", is_published: true }); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ title: p.title, content: p.content ?? "", image_url: p.image_url ?? "", category: p.category, is_published: p.is_published }); setOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Kelola Berita</h1>
            <p className="text-muted-foreground text-sm">Buat dan kelola berita madrasah</p>
          </div>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Tambah Berita
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari berita..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Memuat data...</TableCell></TableRow>
                ) : pagination.items.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{search ? "Tidak ada hasil pencarian" : "Belum ada berita"}</TableCell></TableRow>
                ) : pagination.items.map((p: any, i: number) => (
                  <TableRow key={p.id}>
                    <TableCell>{(pagination.page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">{p.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.is_published ? "default" : "outline"} className="text-xs">
                        {p.is_published ? "Publik" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin ingin menghapus <strong>{p.title}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove.mutate(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination {...pagination} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul berita" />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Isi berita..." />
            </div>
            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
              )}
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label className="cursor-pointer">Publikasikan</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => save.mutate()} disabled={!form.title.trim() || save.isPending}>
              {save.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default BeritaPage;
