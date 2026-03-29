import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CalendarDays, Wand2, AlertTriangle, Download } from "lucide-react";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSchedule, validateSchedule, type Conflict } from "@/lib/scheduler";
import { exportSchedulePdf } from "@/lib/exportPdf";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

function DraggableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

function DroppableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`transition-colors ${isOver ? "bg-primary/20 rounded" : ""}`}>
      {children}
    </div>
  );
}

const JadwalPage = () => {
  const qc = useQueryClient();
  const { years, activeYear } = useAcademicYears();
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<{ classId: string; slotId: string } | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Default to active year
  const currentYearId = selectedYearId || activeYear?.id || "";

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").order("name");
      return data ?? [];
    },
  });
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"], queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*").order("name");
      return data ?? [];
    },
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"], queryFn: async () => {
      const { data } = await supabase.from("teachers").select("*").order("name");
      return data ?? [];
    },
  });
  const { data: timeSlots = [] } = useQuery({
    queryKey: ["time_slots"], queryFn: async () => {
      const { data } = await supabase.from("time_slots").select("*").order("slot_order");
      return data ?? [];
    },
  });
  const { data: teacherSubjects = [] } = useQuery({
    queryKey: ["teacher_subjects"], queryFn: async () => {
      const { data } = await supabase.from("teacher_subjects").select("*");
      return data ?? [];
    },
  });
  const { data: teacherPrefs = [] } = useQuery({
    queryKey: ["teacher_preferences_all"], queryFn: async () => {
      const { data } = await supabase.from("teacher_preferences").select("*");
      return data ?? [];
    },
  });
  const { data: allSchedules = [] } = useQuery({
    queryKey: ["schedules"], queryFn: async () => {
      const { data } = await supabase.from("schedules").select("*");
      return data ?? [];
    },
  });

  const { data: specialEvents = [] } = useQuery({
    queryKey: ["special_events"], queryFn: async () => {
      const { data } = await supabase.from("special_events").select("*");
      return data ?? [];
    },
  });

  // Filter schedules by selected academic year (include null academic_year_id when a year is selected)
  const schedules = currentYearId
    ? allSchedules.filter(s => s.academic_year_id === currentYearId || !s.academic_year_id)
    : allSchedules;

  const generate = useMutation({
    mutationFn: async () => {
      const locked = schedules.filter(s => s.is_locked).map(s => ({
        class_id: s.class_id, subject_id: s.subject_id, teacher_id: s.teacher_id, time_slot_id: s.time_slot_id,
      }));
      const { schedule, conflicts: genConflicts } = generateSchedule(
        classes, subjects, teachers, timeSlots, teacherSubjects, teacherPrefs, locked
      );
      const nonLockedIds = schedules.filter(s => !s.is_locked).map(s => s.id);
      if (nonLockedIds.length > 0) {
        for (const id of nonLockedIds) await supabase.from("schedules").delete().eq("id", id);
      }
      const newEntries = schedule.filter(e =>
        !locked.some(l => l.class_id === e.class_id && l.time_slot_id === e.time_slot_id)
      );
      if (newEntries.length > 0) {
        for (let i = 0; i < newEntries.length; i += 50) {
          const entryWithYear = newEntries.slice(i, i + 50).map(e => ({ ...e, academic_year_id: currentYearId || null }));
          await supabase.from("schedules").insert(entryWithYear);
        }
      }
      setConflicts(genConflicts);
      return genConflicts;
    },
    onSuccess: (genConflicts) => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      qc.invalidateQueries({ queryKey: ["schedules-count"] });
      toast[genConflicts.length > 0 ? "warning" : "success"](
        genConflicts.length > 0 ? `Jadwal digenerate dengan ${genConflicts.length} peringatan` : "Jadwal berhasil digenerate tanpa konflik!"
      );
    },
    onError: () => toast.error("Gagal generate jadwal"),
  });

  const updateEntry = useMutation({
    mutationFn: async () => {
      if (!editSlot) return;
      const existing = schedules.find(s => s.class_id === editSlot.classId && s.time_slot_id === editSlot.slotId);
      if (existing) {
        await supabase.from("schedules").update({ subject_id: editSubject, teacher_id: editTeacher }).eq("id", existing.id);
      } else {
        await supabase.from("schedules").insert({
          class_id: editSlot.classId, time_slot_id: editSlot.slotId, subject_id: editSubject, teacher_id: editTeacher,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Jadwal diperbarui");
      setEditOpen(false);
    },
  });

  const swapEntries = useMutation({
    mutationFn: async ({ fromId, toClassId, toSlotId }: { fromId: string; toClassId: string; toSlotId: string }) => {
      const from = schedules.find(s => s.id === fromId);
      if (!from) return;
      const to = schedules.find(s => s.class_id === toClassId && s.time_slot_id === toSlotId);

      if (to) {
        // Swap
        await supabase.from("schedules").update({ class_id: toClassId, time_slot_id: toSlotId }).eq("id", from.id);
        await supabase.from("schedules").update({ class_id: from.class_id, time_slot_id: from.time_slot_id }).eq("id", to.id);
      } else {
        // Move
        await supabase.from("schedules").update({ class_id: toClassId, time_slot_id: toSlotId }).eq("id", from.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Jadwal dipindahkan");
    },
  });

  const getName = (list: any[], id: string) => list.find(i => i.id === id)?.name ?? "-";
  const getEntry = (classId: string, slotId: string) => schedules.find(s => s.class_id === classId && s.time_slot_id === slotId);
  const getEvent = (day: string, slotId: string) => specialEvents.find((e: any) => e.day === day && e.time_slot_id === slotId);

  const eventTypeColors: Record<string, string> = {
    istirahat: "bg-yellow-500/15 border-yellow-500/30 text-yellow-700",
    shalat: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700",
    upacara: "bg-blue-500/15 border-blue-500/30 text-blue-700",
    tadarus: "bg-purple-500/15 border-purple-500/30 text-purple-700",
    other: "bg-muted border-border text-muted-foreground",
  };

  const isConflict = (entry: any) => {
    if (!entry) return false;
    return schedules.filter(s => s.teacher_id === entry.teacher_id && s.time_slot_id === entry.time_slot_id).length > 1;
  };

  const filteredClasses = filterClass === "all" ? classes : classes.filter(c => c.id === filterClass);

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromEntry = schedules.find(s => s.id === active.id);
    if (!fromEntry) return;

    // over.id format: "classId::slotId"
    const [toClassId, toSlotId] = (over.id as string).split("::");
    if (!toClassId || !toSlotId) return;
    if (fromEntry.class_id === toClassId && fromEntry.time_slot_id === toSlotId) return;

    swapEntries.mutate({ fromId: fromEntry.id, toClassId, toSlotId });
  }, [schedules, swapEntries]);

  const activeEntry = activeId ? schedules.find(s => s.id === activeId) : null;

  const handleExportPdf = (mode: "all" | "class" | "teacher" = "all") => {
    if (mode === "class" && filterClass !== "all") {
      const cls = classes.find(c => c.id === filterClass);
      const filtered = schedules.filter(s => s.class_id === filterClass);
      exportSchedulePdf({ classes: cls ? [cls] : classes, subjects, teachers, timeSlots, schedules: filtered, title: cls ? `Jadwal Kelas ${cls.name}` : undefined });
    } else if (mode === "teacher" && filterTeacher !== "all") {
      const teacher = teachers.find(t => t.id === filterTeacher);
      const filtered = schedules.filter(s => s.teacher_id === filterTeacher);
      exportSchedulePdf({ classes, subjects, teachers, timeSlots, schedules: filtered, title: teacher ? `Jadwal Guru: ${teacher.name}` : undefined });
    } else {
      exportSchedulePdf({ classes, subjects, teachers, timeSlots, schedules });
    }
    toast.success("PDF berhasil diunduh!");
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Jadwal Pelajaran</h1>
            <p className="text-muted-foreground text-sm">Generate dan kelola jadwal</p>
          </div>
          <div className="flex gap-2">
            <Select onValueChange={(v) => handleExportPdf(v as "all" | "class" | "teacher")} value="">
              <SelectTrigger className="w-auto gap-1" disabled={schedules.length === 0}>
                <Download className="w-4 h-4" />
                <SelectValue placeholder="Export PDF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jadwal</SelectItem>
                <SelectItem value="class" disabled={filterClass === "all"}>Kelas Terpilih</SelectItem>
                <SelectItem value="teacher" disabled={filterTeacher === "all"}>Guru Terpilih</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              <Wand2 className="w-4 h-4 mr-1" />
              {generate.isPending ? "Generating..." : "Generate Jadwal"}
            </Button>
          </div>
        </div>

        {conflicts.length > 0 && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold text-sm">Peringatan Konflik</span>
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="text-sm text-destructive/80">{c.message}</p>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 flex-wrap">
          <div className="w-52">
            <Select value={currentYearId} onValueChange={setSelectedYearId}>
              <SelectTrigger><SelectValue placeholder="Tahun Ajaran" /></SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name} - {y.semester} {y.is_active ? "(Aktif)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger><SelectValue placeholder="Filter kelas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger><SelectValue placeholder="Filter guru" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Guru</SelectItem>
                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status info */}
        <Card className={schedules.length > 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/30"}>
          <CardContent className="p-3 flex items-center gap-2 text-sm">
            {schedules.length > 0 ? (
              <>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">Aktif</Badge>
                <span>Jadwal mengikuti preferensi guru ({teacherPrefs.length} preferensi diterapkan)</span>
              </>
            ) : (
              <>
                <Badge variant="outline">Belum ada</Badge>
                <span className="text-muted-foreground">Jadwal belum dibuat. Klik "Generate Jadwal" untuk membuat jadwal otomatis berdasarkan preferensi guru.</span>
              </>
            )}
          </CardContent>
        </Card>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {DAYS.map(day => {
            const daySlots = timeSlots.filter(s => s.day === day).sort((a, b) => a.slot_order - b.slot_order);
            if (daySlots.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader className="py-3 px-4 bg-primary/5">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> {day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-2 text-left whitespace-nowrap sticky left-0 bg-muted/30">Jam</th>
                        {filteredClasses.map(c => (
                          <th key={c.id} className="p-2 text-center min-w-[120px]">{c.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {daySlots.map(slot => {
                        const event = getEvent(day, slot.id);
                        if (event) {
                          const style = eventTypeColors[event.event_type] || eventTypeColors.other;
                          return (
                            <tr key={slot.id} className="border-b">
                              <td className="p-2 whitespace-nowrap sticky left-0 bg-card font-medium">
                                <div className="text-[10px] text-muted-foreground">Jam {slot.slot_order}</div>
                                <div>{slot.start_time}-{slot.end_time}</div>
                              </td>
                              <td colSpan={filteredClasses.length} className="p-1 text-center">
                                <div className={`p-2 rounded border font-semibold text-xs ${style}`}>
                                  {event.name}
                                  {event.description && <div className="text-[10px] font-normal opacity-70 mt-0.5">{event.description}</div>}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                        return (
                        <tr key={slot.id} className="border-b hover:bg-muted/20">
                          <td className="p-2 whitespace-nowrap sticky left-0 bg-card font-medium">
                            <div className="text-[10px] text-muted-foreground">Jam {slot.slot_order}</div>
                            <div>{slot.start_time}-{slot.end_time}</div>
                          </td>
                          {filteredClasses.map(cls => {
                            const entry = getEntry(cls.id, slot.id);
                            const conflict = isConflict(entry);
                            const isFiltered = filterTeacher !== "all" && entry && entry.teacher_id !== filterTeacher;
                            const dropId = `${cls.id}::${slot.id}`;

                            if (isFiltered) {
                              return (
                                <td key={cls.id} className="p-1 text-center">
                                  <div className="p-1.5 rounded bg-muted/30 text-muted-foreground">-</div>
                                </td>
                              );
                            }

                            return (
                              <td key={cls.id} className="p-1 text-center">
                                <DroppableCell id={dropId}>
                                  {entry ? (
                                    <DraggableCell id={entry.id}>
                                      <button
                                        onClick={() => {
                                          setEditSlot({ classId: cls.id, slotId: slot.id });
                                          setEditSubject(entry.subject_id);
                                          setEditTeacher(entry.teacher_id);
                                          setEditOpen(true);
                                        }}
                                        className={`w-full p-1.5 rounded text-left transition-colors ${
                                          conflict
                                            ? "bg-destructive/10 border border-destructive/30 text-destructive"
                                            : "bg-primary/5 hover:bg-primary/10"
                                        }`}
                                      >
                                        <div className="font-semibold text-[11px] truncate">
                                          {getName(subjects, entry.subject_id)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate">
                                          {getName(teachers, entry.teacher_id)}
                                        </div>
                                        {conflict && (
                                          <Badge variant="destructive" className="text-[8px] px-1 mt-0.5">BENTROK</Badge>
                                        )}
                                      </button>
                                    </DraggableCell>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditSlot({ classId: cls.id, slotId: slot.id });
                                        setEditSubject("");
                                        setEditTeacher("");
                                        setEditOpen(true);
                                      }}
                                      className="w-full p-1.5 rounded border border-dashed border-border hover:bg-muted/50 text-muted-foreground text-[10px]"
                                    >
                                      + Isi
                                    </button>
                                  )}
                                </DroppableCell>
                              </td>
                            );
                          })}
                        </tr>
                      );})}

                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })}

          <DragOverlay>
            {activeEntry && (
              <div className="p-2 rounded bg-card border shadow-lg text-xs">
                <div className="font-semibold">{getName(subjects, activeEntry.subject_id)}</div>
                <div className="text-muted-foreground">{getName(teachers, activeEntry.teacher_id)}</div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Jadwal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Select value={editSubject} onValueChange={setEditSubject}>
                  <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Guru</Label>
                <Select value={editTeacher} onValueChange={setEditTeacher}>
                  <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button onClick={() => updateEntry.mutate()} disabled={!editSubject || !editTeacher}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default JadwalPage;
