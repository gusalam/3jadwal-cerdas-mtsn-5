import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFilters } from "@/components/public/PublicFilters";
import { ScheduleCardMobile } from "@/components/public/ScheduleCardMobile";
import { ScheduleGridDesktop } from "@/components/public/ScheduleGridDesktop";
import { ScheduleEmpty } from "@/components/public/ScheduleEmpty";
import { ScheduleSkeleton } from "@/components/public/ScheduleSkeleton";
import { PublicAnnouncements } from "@/components/public/PublicAnnouncements";
import { PublicNews } from "@/components/public/PublicNews";
import { PublicContact } from "@/components/public/PublicContact";
import { PublicMaps } from "@/components/public/PublicMaps";

const DAY_MAP: Record<string, string> = {
  senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis", jumat: "Jumat",
};

function getTodayKey(): string {
  const day = new Date().toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase();
  return DAY_MAP[day] ? day : "senin";
}

function isCurrentSlot(startTime: string, endTime: string, now: Date): boolean {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= sh * 60 + sm && mins < eh * 60 + em;
}

function isPastSlot(endTime: string, now: Date): boolean {
  const [eh, em] = endTime.split(":").map(Number);
  return now.getHours() * 60 + now.getMinutes() >= eh * 60 + em;
}

const PublicSchedulePage = () => {
  const [now, setNow] = useState(new Date());
  const [filterClass, setFilterClass] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [search, setSearch] = useState("");

  const todayKey = getTodayKey();
  const today = DAY_MAP[todayKey] ?? "Senin";
  const todayLabel = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["public-schedules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("schedules")
        .select("id, class_id, subject_id, teacher_id, time_slot_id, subjects(name), teachers(name), classes(name), time_slots(day, start_time, end_time, slot_order)");
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const { data: specialEvents = [] } = useQuery({
    queryKey: ["public-special-events"],
    queryFn: async () => {
      const { data } = await supabase.from("special_events").select("*");
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const { data: allClasses = [] } = useQuery({
    queryKey: ["public-classes"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name").order("name");
      return data ?? [];
    },
  });

  const { data: allTeachers = [] } = useQuery({
    queryKey: ["public-teachers"],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("id, name").order("name");
      return data ?? [];
    },
  });

  const { data: allTimeSlots = [] } = useQuery({
    queryKey: ["public-time-slots"],
    queryFn: async () => {
      const { data } = await supabase.from("time_slots").select("*").order("slot_order");
      return data ?? [];
    },
  });

  const todaySchedules = useMemo(() => {
    let filtered = schedules.filter((s: any) => s.time_slots?.day === today);
    if (filterClass !== "all") filtered = filtered.filter((s: any) => s.class_id === filterClass);
    if (filterTeacher !== "all") filtered = filtered.filter((s: any) => s.teacher_id === filterTeacher);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((s: any) =>
        (s.subjects?.name ?? "").toLowerCase().includes(q) ||
        (s.teachers?.name ?? "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [schedules, today, filterClass, filterTeacher, search]);

  const todayEvents = useMemo(() => specialEvents.filter((e: any) => e.day === today), [specialEvents, today]);

  const timeSlots = useMemo(() => {
    const map = new Map<string, any>();
    todaySchedules.forEach((s: any) => {
      if (s.time_slots && !map.has(s.time_slot_id)) {
        map.set(s.time_slot_id, { id: s.time_slot_id, ...s.time_slots });
      }
    });
    todayEvents.forEach((e: any) => {
      if (!map.has(e.time_slot_id)) {
        const slotInfo = allTimeSlots.find((ts: any) => ts.id === e.time_slot_id);
        if (slotInfo) map.set(e.time_slot_id, slotInfo);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.slot_order - b.slot_order);
  }, [todaySchedules, todayEvents, allTimeSlots]);

  const displayClasses = useMemo(() => {
    if (filterClass !== "all") return allClasses.filter(c => c.id === filterClass);
    const ids = new Set(todaySchedules.map((s: any) => s.class_id));
    return allClasses.filter(c => ids.has(c.id));
  }, [allClasses, todaySchedules, filterClass]);

  const getCell = (slotId: string, classId: string) =>
    todaySchedules.find((s: any) => s.time_slot_id === slotId && s.class_id === classId);
  const getEvent = (slotId: string) =>
    todayEvents.find((e: any) => e.time_slot_id === slotId);
  const getSlotEntries = (slotId: string) =>
    todaySchedules.filter((s: any) => s.time_slot_id === slotId);

  const isEmpty = timeSlots.length === 0 && !loadingSchedules;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader now={now} todayLabel={todayLabel} />
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-8">
        {/* Jadwal Section */}
        <div id="jadwal" className="space-y-5">
          <PublicFilters
            search={search} onSearchChange={setSearch}
            filterClass={filterClass} onFilterClassChange={setFilterClass}
            filterTeacher={filterTeacher} onFilterTeacherChange={setFilterTeacher}
            classes={allClasses} teachers={allTeachers}
          />

          <div className="flex flex-wrap gap-3 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-green-500/20 border border-green-500/40" /> Sedang berlangsung</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-muted border border-border" /> Sudah lewat</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-card border border-border" /> Belum dimulai</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-yellow-500/10 border border-yellow-500/30" /> Istirahat</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-emerald-500/10 border border-emerald-500/30" /> Shalat</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-blue-500/10 border border-blue-500/30" /> Upacara</div>
          </div>

          {loadingSchedules ? (
            <ScheduleSkeleton />
          ) : isEmpty ? (
            <ScheduleEmpty todayLabel={todayLabel} />
          ) : (
            <>
              <div className="block lg:hidden space-y-3">
                <h2 className="text-lg font-bold text-foreground">Jadwal Hari {today}</h2>
                {timeSlots.map(slot => (
                  <ScheduleCardMobile key={slot.id} slot={slot} entries={getSlotEntries(slot.id)} event={getEvent(slot.id)} isActive={isCurrentSlot(slot.start_time, slot.end_time, now)} isPast={isPastSlot(slot.end_time, now)} />
                ))}
              </div>
              <div className="hidden lg:block">
                <h2 className="text-lg font-bold text-foreground mb-3">Jadwal Hari {today}</h2>
                <ScheduleGridDesktop timeSlots={timeSlots} displayClasses={displayClasses} getCell={getCell} getEvent={getEvent} isCurrentSlot={(s, e) => isCurrentSlot(s, e, now)} isPastSlot={(e) => isPastSlot(e, now)} />
              </div>
            </>
          )}
        </div>

        {/* Pengumuman */}
        <div id="pengumuman"><PublicAnnouncements /></div>

        {/* Berita */}
        <div id="berita"><PublicNews /></div>

        {/* Kontak */}
        <div id="kontak"><PublicContact /></div>

        {/* Lokasi */}
        <div id="lokasi"><PublicMaps /></div>

        <p className="text-center text-[11px] text-muted-foreground/60 pt-4">
          Data diperbarui otomatis setiap 10 detik • © {new Date().getFullYear()} MTsN 5 Jakarta
        </p>
      </main>
    </div>
  );
};

export default PublicSchedulePage;
