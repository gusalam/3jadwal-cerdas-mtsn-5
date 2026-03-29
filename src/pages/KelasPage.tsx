import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/TablePagination";
import { exportToCSV } from "@/lib/exportCsv";

const KelasPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Nama kelas wajib diisi");
      if (editId) {
        const { error } = await supabase.from("classes").update({ name: name.trim() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("classes").insert({ name: name.trim() });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["classes-count"] });
      toast.success(editId ? "Kelas berhasil diupdate" : "Kelas berhasil ditambahkan");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan data"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["classes-count"] });
      toast.success("Kelas berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    return classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [classes, search]);

  const resetForm = () => { setOpen(false); setEditId(null); setName(""); };

  const pagination = usePagination(filteredClasses);
  useEffect(() => { pagination.reset(); }, [search]);

  const handleExport = () => {
    const headers = ["No", "Nama Kelas"];
    const rows = filteredClasses.map((c, i) => [String(i + 1), c.name]);
    exportToCSV("data-kelas", headers, rows);
    toast.success("Data kelas berhasil diekspor");
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Data Kelas</h1>
            <p className="text-muted-foreground text-sm">Kelola data kelas / rombongan belajar</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filteredClasses.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Ekspor CSV
            </Button>
            <Button onClick={() => { resetForm(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari kelas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Memuat data...</TableCell></TableRow>
                ) : pagination.items.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{search ? "Tidak ada hasil pencarian" : "Belum ada data"}</TableCell></TableRow>
                ) : pagination.items.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell>{(pagination.page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditId(c.id); setName(c.name); setOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
                              <AlertDialogDescription>Yakin ingin menghapus <strong>{c.name}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => del.mutate(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Tambah"} Kelas</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label>Nama Kelas</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: VII-A, VIII-B" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Batal</Button>
              <Button onClick={() => save.mutate()} disabled={!name.trim() || save.isPending}>
                {save.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default KelasPage;
