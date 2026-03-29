import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Trash2, CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TahunAjaranPage = () => {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [sourceYearId, setSourceYearId] = useState("");
  const [targetYearId, setTargetYearId] = useState("");

  const { data: years = [] } = useQuery({
    queryKey: ["academic_years"],
    queryFn: async () => {
      const { data } = await supabase.from("academic_years").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const addYear = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("academic_years").insert({ name, semester });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      toast.success("Tahun ajaran ditambahkan");
      setAddOpen(false);
      setName("");
      setSemester("Ganjil");
    },
    onError: () => toast.error("Gagal menambah tahun ajaran"),
  });

  const setActive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("academic_years").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      toast.success("Tahun ajaran aktif diperbarui");
    },
  });

  const deleteYear = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("academic_years").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      toast.success("Tahun ajaran dihapus");
    },
  });

  const duplicateSchedule = useMutation({
    mutationFn: async () => {
      // Fetch all schedules from source year
      const { data: sourceSchedules, error: fetchErr } = await supabase
        .from("schedules")
        .select("class_id, subject_id, teacher_id, time_slot_id, is_locked")
        .eq("academic_year_id", sourceYearId);
      if (fetchErr) throw fetchErr;
      if (!sourceSchedules || sourceSchedules.length === 0) {
        throw new Error("Tidak ada jadwal di tahun ajaran sumber");
      }

      // Delete existing schedules in target year first
      await supabase.from("schedules").delete().eq("academic_year_id", targetYearId);

      // Insert duplicated schedules with new academic_year_id
      const newSchedules = sourceSchedules.map((s) => ({
        class_id: s.class_id,
        subject_id: s.subject_id,
        teacher_id: s.teacher_id,
        time_slot_id: s.time_slot_id,
        is_locked: s.is_locked,
        academic_year_id: targetYearId,
      }));

      // Insert in batches of 500
      for (let i = 0; i < newSchedules.length; i += 500) {
        const batch = newSchedules.slice(i, i + 500);
        const { error: insertErr } = await supabase.from("schedules").insert(batch);
        if (insertErr) throw insertErr;
      }

      return sourceSchedules.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success(`${count} jadwal berhasil diduplikasi`);
      setDupOpen(false);
      setSourceYearId("");
      setTargetYearId("");
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menduplikasi jadwal"),
  });

  const getYearLabel = (y: typeof years[0]) => `${y.name} - ${y.semester}`;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Tahun Ajaran</h1>
            <p className="text-muted-foreground text-sm">Kelola tahun ajaran dan semester</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDupOpen(true)} disabled={years.length < 2}>
              <Copy className="w-4 h-4 mr-1" /> Duplikasi Jadwal
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {years.map((y) => (
            <Card key={y.id} className={y.is_active ? "border-primary" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold text-sm">{y.name}</div>
                    <div className="text-xs text-muted-foreground">Semester {y.semester}</div>
                  </div>
                  {y.is_active && (
                    <Badge className="bg-primary/10 text-primary border-primary/30" variant="outline">Aktif</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {!y.is_active && (
                    <Button variant="outline" size="sm" onClick={() => setActive.mutate(y.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Set Aktif
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteYear.mutate(y.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {years.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Belum ada tahun ajaran. Tambahkan untuk mulai mengelola jadwal per semester.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Year Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Tahun Ajaran</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="2025/2026" />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                    <SelectItem value="Genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
              <Button onClick={() => addYear.mutate()} disabled={!name}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Schedule Dialog */}
        <Dialog open={dupOpen} onOpenChange={setDupOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplikasi Jadwal</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Salin seluruh jadwal dari satu tahun ajaran ke tahun ajaran lain. Jadwal yang sudah ada di tujuan akan diganti.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dari (Sumber)</Label>
                <Select value={sourceYearId} onValueChange={setSourceYearId}>
                  <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran sumber" /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{getYearLabel(y)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ke (Tujuan)</Label>
                <Select value={targetYearId} onValueChange={setTargetYearId}>
                  <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran tujuan" /></SelectTrigger>
                  <SelectContent>
                    {years.filter((y) => y.id !== sourceYearId).map((y) => (
                      <SelectItem key={y.id} value={y.id}>{getYearLabel(y)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDupOpen(false)}>Batal</Button>
              <Button
                onClick={() => duplicateSchedule.mutate()}
                disabled={!sourceYearId || !targetYearId || duplicateSchedule.isPending}
              >
                {duplicateSchedule.isPending ? "Menduplikasi..." : "Duplikasi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default TahunAjaranPage;
