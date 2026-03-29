import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const JamPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [day, setDay] = useState("Senin");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("07:40");
  const [slotOrder, setSlotOrder] = useState(1);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["time_slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("time_slots").select("*").order("day").order("slot_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { day, start_time: startTime, end_time: endTime, slot_order: slotOrder };
      if (editId) {
        const { error } = await supabase.from("time_slots").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("time_slots").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_slots"] });
      toast.success("Jam pelajaran berhasil disimpan");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan data"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_slots"] });
      toast.success("Jam pelajaran berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });

  const generateDefault = useMutation({
    mutationFn: async () => {
      if (slots.length > 0) {
        await supabase.from("time_slots").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }
      const times = [
        { start: "07:00", end: "07:40" }, { start: "07:40", end: "08:20" },
        { start: "08:20", end: "09:00" }, { start: "09:00", end: "09:40" },
        { start: "09:55", end: "10:35" }, { start: "10:35", end: "11:15" },
        { start: "11:15", end: "11:55" }, { start: "12:30", end: "13:10" },
        { start: "13:10", end: "13:50" }, { start: "13:50", end: "14:30" },
      ];
      const rows = DAYS.flatMap(d =>
        times.map((t, i) => ({ day: d, start_time: t.start, end_time: t.end, slot_order: i + 1 }))
      );
      const { error } = await supabase.from("time_slots").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_slots"] });
      toast.success("Jam pelajaran default berhasil digenerate");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal generate jam pelajaran"),
  });

  const resetForm = () => {
    setOpen(false); setEditId(null); setDay("Senin");
    setStartTime("07:00"); setEndTime("07:40"); setSlotOrder(1);
  };

  const groupedByDay = DAYS.map(d => ({ day: d, slots: slots.filter(s => s.day === d) }));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Jam Pelajaran</h1>
            <p className="text-muted-foreground text-sm">Atur time slot per hari</p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={generateDefault.isPending}>
                  {generateDefault.isPending ? "Generating..." : "Generate Default"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate Jam Default?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {slots.length > 0
                      ? "Semua jam pelajaran yang ada akan dihapus dan diganti dengan data default. Lanjutkan?"
                      : "Akan membuat 10 slot jam pelajaran untuk setiap hari (Senin-Jumat). Lanjutkan?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => generateDefault.mutate()}>Generate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => { resetForm(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Memuat data...</CardContent></Card>
        ) : groupedByDay.map(g => (
          <Card key={g.day}>
            <CardContent className="p-0">
              <div className="px-4 py-2 border-b bg-muted/50">
                <Badge variant="outline">{g.day}</Badge>
              </div>
              {g.slots.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jam ke-</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead>Selesai</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {g.slots.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{s.slot_order}</TableCell>
                        <TableCell>{s.start_time}</TableCell>
                        <TableCell>{s.end_time}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => {
                              setEditId(s.id); setDay(s.day); setStartTime(s.start_time);
                              setEndTime(s.end_time); setSlotOrder(s.slot_order); setOpen(true);
                            }}>
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
                                  <AlertDialogTitle>Hapus Jam Pelajaran?</AlertDialogTitle>
                                  <AlertDialogDescription>Yakin ingin menghapus jam ke-{s.slot_order} hari {s.day}?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => del.mutate(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">Belum ada slot</p>
              )}
            </CardContent>
          </Card>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Tambah"} Jam Pelajaran</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hari</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Mulai</Label>
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Jam Selesai</Label>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jam ke-</Label>
                <Input type="number" min={1} value={slotOrder} onChange={e => setSlotOrder(Number(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Batal</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default JamPage;
