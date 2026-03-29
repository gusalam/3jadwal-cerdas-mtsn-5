import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAcademicYears } from "@/hooks/useAcademicYears";
const StatistikPage = () => {
  const { years, activeYear } = useAcademicYears();
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const currentYearId = selectedYearId || activeYear?.id || "";

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: allSchedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data } = await supabase.from("schedules").select("*");
      return data ?? [];
    },
  });

  const schedules = currentYearId
    ? allSchedules.filter(s => s.academic_year_id === currentYearId)
    : allSchedules.filter(s => !s.academic_year_id);

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*");
      return data ?? [];
    },
  });

  const { data: timeSlots = [] } = useQuery({
    queryKey: ["time_slots"],
    queryFn: async () => {
      const { data } = await supabase.from("time_slots").select("*");
      return data ?? [];
    },
  });

  const chartData = teachers.map((t) => {
    const teacherSchedules = schedules.filter((s) => s.teacher_id === t.id);
    const totalHours = teacherSchedules.length;

    const dayBreakdown: Record<string, number> = {};
    for (const s of teacherSchedules) {
      const slot = timeSlots.find((ts) => ts.id === s.time_slot_id);
      if (slot) {
        dayBreakdown[slot.day] = (dayBreakdown[slot.day] || 0) + 1;
      }
    }

    const subjectBreakdown: Record<string, number> = {};
    for (const s of teacherSchedules) {
      const subj = subjects.find((sb) => sb.id === s.subject_id);
      if (subj) {
        subjectBreakdown[subj.name] = (subjectBreakdown[subj.name] || 0) + 1;
      }
    }

    return {
      name: t.name,
      totalHours,
      dayBreakdown,
      subjectBreakdown,
    };
  }).sort((a, b) => b.totalHours - a.totalHours);

  const avgHours = chartData.length > 0
    ? (chartData.reduce((sum, d) => sum + d.totalHours, 0) / chartData.length).toFixed(1)
    : "0";

  const maxTeacher = chartData[0];
  const minTeacher = chartData[chartData.length - 1];

  const COLORS = [
    "hsl(158, 64%, 32%)",
    "hsl(45, 93%, 47%)",
    "hsl(200, 70%, 50%)",
    "hsl(340, 70%, 50%)",
    "hsl(270, 60%, 55%)",
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Statistik Beban Mengajar</h1>
            <p className="text-muted-foreground text-sm">Jumlah jam mengajar per guru per minggu</p>
          </div>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Jam/Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgHours} <span className="text-sm font-normal text-muted-foreground">jam</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Beban Tertinggi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maxTeacher?.totalHours ?? 0} <span className="text-sm font-normal text-muted-foreground">jam</span></div>
              <p className="text-xs text-muted-foreground truncate">{maxTeacher?.name ?? "-"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Beban Terendah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minTeacher?.totalHours ?? 0} <span className="text-sm font-normal text-muted-foreground">jam</span></div>
              <p className="text-xs text-muted-foreground truncate">{minTeacher?.name ?? "-"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Grafik Beban Mengajar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Bar dataKey="totalHours" name="Jam/Minggu" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detail Per Guru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left">Guru</th>
                    <th className="p-3 text-center">Total Jam</th>
                    <th className="p-3 text-left">Senin</th>
                    <th className="p-3 text-left">Selasa</th>
                    <th className="p-3 text-left">Rabu</th>
                    <th className="p-3 text-left">Kamis</th>
                    <th className="p-3 text-left">Jumat</th>
                    <th className="p-3 text-left">Mapel</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.name} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">{row.name}</td>
                      <td className="p-3 text-center font-bold">{row.totalHours}</td>
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((day) => (
                        <td key={day} className="p-3 text-muted-foreground">{row.dayBreakdown[day] || 0}</td>
                      ))}
                      <td className="p-3 text-xs text-muted-foreground">
                        {Object.entries(row.subjectBreakdown).map(([name, count]) => (
                          <span key={name} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {name}: {count}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StatistikPage;
