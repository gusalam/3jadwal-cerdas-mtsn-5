import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/TablePagination";
import { exportToCSV } from "@/lib/exportCsv";

const GuruPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: teacherSubjects = [] } = useQuery({
    queryKey: ["teacher_subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("teacher_subjects").select("*");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Nama guru wajib diisi");
      if (editId) {
        const { error } = await supabase.from("teachers").update({ name: name.trim() }).eq("id", editId);
        if (error) throw error;
        await supabase.from("teacher_subjects").delete().eq("teacher_id", editId);
        if (selectedSubjects.length > 0) {
          const { error: e2 } = await supabase.from("teacher_subjects").insert(
            selectedSubjects.map(sid => ({ teacher_id: editId, subject_id: sid }))
          );
          if (e2) throw e2;
        }
      } else {
        const { data, error } = await supabase.from("teachers").insert({ name: name.trim() }).select().single();
        if (error) throw error;
        if (data && selectedSubjects.length > 0) {
          const { error: e2 } = await supabase.from("teacher_subjects").insert(
            selectedSubjects.map(sid => ({ teacher_id: data.id, subject_id: sid }))
          );
          if (e2) throw e2;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["teacher_subjects"] });
      qc.invalidateQueries({ queryKey: ["teachers-count"] });
      toast.success(editId ? "Guru berhasil diupdate" : "Guru berhasil ditambahkan");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan data guru"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["teacher_subjects"] });
      qc.invalidateQueries({ queryKey: ["teachers-count"] });
      toast.success("Guru berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus guru"),
  });

  const resetForm = () => { setOpen(false); setEditId(null); setName(""); setSelectedSubjects([]); };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setName(t.name);
    setSelectedSubjects(teacherSubjects.filter(ts => ts.teacher_id === t.id).map(ts => ts.subject_id));
    setOpen(true);
  };

  const getSubjectsForTeacher = (teacherId: string) => {
    const subjectIds = teacherSubjects.filter(ts => ts.teacher_id === teacherId).map(ts => ts.subject_id);
    return subjects.filter(s => subjectIds.includes(s.id));
  };

  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(t => {
      const subjectNames = getSubjectsForTeacher(t.id).map(s => s.name.toLowerCase()).join(" ");
      return t.name.toLowerCase().includes(q) || subjectNames.includes(q);
    });
  }, [teachers, search, teacherSubjects, subjects]);

  const pagination = usePagination(filteredTeachers);
  useEffect(() => { pagination.reset(); }, [search]);

  const handleExport = () => {
    const headers = ["No", "Nama Guru", "Mata Pelajaran"];
    const rows = filteredTeachers.map((t, i) => [
      String(i + 1),
      t.name,
      getSubjectsForTeacher(t.id).map(s => s.name).join(", "),
    ]);
    exportToCSV("data-guru", headers, rows);
    toast.success("Data guru berhasil diekspor");
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Data Guru</h1>
            <p className="text-muted-foreground text-sm">Kelola data guru dan mata pelajaran</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filteredTeachers.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Ekspor CSV
            </Button>
            <Button onClick={() => { resetForm(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Tambah Guru
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari guru atau mata pelajaran..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Guru</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Memuat data...</TableCell></TableRow>
                ) : pagination.items.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">{search ? "Tidak ada hasil pencarian" : "Belum ada data guru"}</TableCell></TableRow>
                ) : pagination.items.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell>{(pagination.page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getSubjectsForTeacher(t.id).map(s => (
                          <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
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
                              <AlertDialogTitle>Hapus Guru?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin ingin menghapus <strong>{t.name}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => del.mutate(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
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
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Guru" : "Tambah Guru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Guru</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap guru" />
                {!name.trim() && <p className="text-xs text-muted-foreground">Nama tidak boleh kosong</p>}
              </div>
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                  {subjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedSubjects.includes(s.id)}
                        onCheckedChange={(checked) => {
                          setSelectedSubjects(prev =>
                            checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                          );
                        }}
                      />
                      {s.name}
                    </label>
                  ))}
                  {subjects.length === 0 && <p className="text-muted-foreground text-xs col-span-2">Tambah mata pelajaran dulu</p>}
                </div>
              </div>
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

export default GuruPage;
