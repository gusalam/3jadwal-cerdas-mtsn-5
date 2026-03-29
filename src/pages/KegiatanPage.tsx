import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, PartyPopper } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const EVENT_TYPES = [
  { value: "istirahat", label: "Istirahat", color: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30" },
  { value: "shalat", label: "Shalat", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  { value: "upacara", label: "Upacara", color: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  { value: "tadarus", label: "Tadarus / Mengaji", color: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  { value: "other", label: "Lainnya", color: "bg-muted text-muted-foreground border-border" },
];

const getEventTypeStyle = (type: string) => EVENT_TYPES.find(e => e.value === type)?.color ?? EVENT_TYPES[4].color;

const KegiatanPage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [day, setDay] = useState("Senin");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [eventType, setEventType] = useState("other");
  const [description, setDescription] = useState("");

  const { data: events = [] } = useQuery({
    queryKey: ["special_events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("special_events")
        .select("*, time_slots(day, start_time, end_time, slot_order)")
        .order("created_at");
      return data ?? [];
    },
  });

  const { data: timeSlots = [] } = useQuery({
    queryKey: ["time_slots"],
    queryFn: async () => {
      const { data } = await supabase.from("time_slots").select("*").order("slot_order");
      return data ?? [];
    },
  });

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDay("Senin");
    setTimeSlotId("");
    setEventType("other");
    setDescription("");
  };

  const openAdd = () => { resetForm(); setOpen(true); };
  const openEdit = (ev: any) => {
    setEditId(ev.id);
    setName(ev.name);
    setDay(ev.day);
    setTimeSlotId(ev.time_slot_id);
    setEventType(ev.event_type);
    setDescription(ev.description ?? "");
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name, day, time_slot_id: timeSlotId, event_type: eventType, description: description || null };
      if (editId) {
        const { error } = await supabase.from("special_events").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("special_events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["special_events"] });
      toast.success(editId ? "Kegiatan diperbarui" : "Kegiatan ditambahkan");
      setOpen(false);
    },
    onError: () => toast.error("Gagal menyimpan kegiatan"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("special_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["special_events"] });
      toast.success("Kegiatan dihapus");
    },
  });

  const daySlots = timeSlots.filter(s => s.day === day);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Kegiatan Sekolah</h1>
            <p className="text-muted-foreground text-sm">Kelola kegiatan non-pelajaran (upacara, istirahat, shalat, dll)</p>
          </div>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Tambah Kegiatan</Button>
        </div>

        {DAYS.map(d => {
          const dayEvents = events.filter((e: any) => e.day === d);
          if (dayEvents.length === 0) return null;
          return (
            <Card key={d}>
              <CardHeader className="py-3 px-4 bg-primary/5">
                <CardTitle className="text-sm">{d}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {dayEvents
                    .sort((a: any, b: any) => (a.time_slots?.slot_order ?? 0) - (b.time_slots?.slot_order ?? 0))
                    .map((ev: any) => (
                      <div key={ev.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`text-xs ${getEventTypeStyle(ev.event_type)}`}>
                            {EVENT_TYPES.find(e => e.value === ev.event_type)?.label ?? ev.event_type}
                          </Badge>
                          <div>
                            <div className="font-medium text-sm">{ev.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ev.time_slots?.start_time} - {ev.time_slots?.end_time}
                              {ev.description && ` • ${ev.description}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ev)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove.mutate(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {events.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <PartyPopper className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada kegiatan. Tambahkan kegiatan sekolah seperti upacara, istirahat, atau shalat.</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Kegiatan" : "Tambah Kegiatan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Kegiatan</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Istirahat, Shalat Dzuhur" />
              </div>
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hari</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jam</Label>
                <Select value={timeSlotId} onValueChange={setTimeSlotId}>
                  <SelectTrigger><SelectValue placeholder="Pilih jam" /></SelectTrigger>
                  <SelectContent>
                    {daySlots.map(s => (
                      <SelectItem key={s.id} value={s.id}>Jam {s.slot_order}: {s.start_time} - {s.end_time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi (opsional)</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Keterangan tambahan" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => save.mutate()} disabled={!name.trim() || !timeSlotId}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default KegiatanPage;
