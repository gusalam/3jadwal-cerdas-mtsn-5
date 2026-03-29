import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const PreferensiPage = () => {
  const qc = useQueryClient();
  const [teacherId, setTeacherId] = useState<string>("");

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: slots = [] } = useQuery({
    queryKey: ["time_slots"],
    queryFn: async () => {
      const { data } = await supabase.from("time_slots").select("*").order("slot_order");
      return data ?? [];
    },
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ["teacher_preferences", teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data } = await supabase.from("teacher_preferences").select("*").eq("teacher_id", teacherId);
      return data ?? [];
    },
  });

  const togglePref = useMutation({
    mutationFn: async ({ slotId, available }: { slotId: string; available: boolean }) => {
      const existing = prefs.find(p => p.time_slot_id === slotId);
      if (existing) {
        await supabase.from("teacher_preferences").update({ is_available: available }).eq("id", existing.id);
      } else {
        await supabase.from("teacher_preferences").insert({
          teacher_id: teacherId,
          time_slot_id: slotId,
          is_available: available,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher_preferences", teacherId] });
    },
  });

  const setAllDay = useMutation({
    mutationFn: async ({ day, available }: { day: string; available: boolean }) => {
      const daySlots = slots.filter(s => s.day === day);
      for (const slot of daySlots) {
        const existing = prefs.find(p => p.time_slot_id === slot.id);
        if (existing) {
          await supabase.from("teacher_preferences").update({ is_available: available }).eq("id", existing.id);
        } else {
          await supabase.from("teacher_preferences").insert({
            teacher_id: teacherId,
            time_slot_id: slot.id,
            is_available: available,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher_preferences", teacherId] });
      toast.success("Preferensi diperbarui");
    },
  });

  const isAvailable = (slotId: string) => {
    const pref = prefs.find(p => p.time_slot_id === slotId);
    return pref ? pref.is_available : true;
  };

  const uniqueSlots = slots
    .filter(s => s.day === "Senin")
    .sort((a, b) => a.slot_order - b.slot_order);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Preferensi Guru</h1>
          <p className="text-muted-foreground text-sm">Atur ketersediaan guru per jam pelajaran</p>
        </div>

        <div className="w-full max-w-sm">
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger><SelectValue placeholder="Pilih guru..." /></SelectTrigger>
            <SelectContent>
              {teachers.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {teacherId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Ketersediaan: {teachers.find(t => t.id === teacherId)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b">Jam</th>
                      {DAYS.map(d => (
                        <th key={d} className="p-2 border-b text-center">
                          <div>{d}</div>
                          <div className="flex gap-1 mt-1 justify-center">
                            <Button size="sm" variant="ghost" className="text-[10px] h-5 px-1" onClick={() => setAllDay.mutate({ day: d, available: true })}>
                              ✓ All
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[10px] h-5 px-1" onClick={() => setAllDay.mutate({ day: d, available: false })}>
                              ✗ All
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueSlots.map(us => (
                      <tr key={us.slot_order}>
                        <td className="p-2 border-b whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            Jam {us.slot_order}: {us.start_time}-{us.end_time}
                          </Badge>
                        </td>
                        {DAYS.map(d => {
                          const slot = slots.find(s => s.day === d && s.slot_order === us.slot_order);
                          if (!slot) return <td key={d} className="p-2 border-b text-center">-</td>;
                          const avail = isAvailable(slot.id);
                          return (
                            <td key={d} className={`p-2 border-b text-center ${avail ? "bg-primary/5" : "bg-destructive/5"}`}>
                              <Checkbox
                                checked={avail}
                                onCheckedChange={(checked) =>
                                  togglePref.mutate({ slotId: slot.id, available: !!checked })
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/10" /> Tersedia</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/10" /> Tidak tersedia</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default PreferensiPage;
