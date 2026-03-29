import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, School, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const COLORS = ["hsl(158, 64%, 32%)", "hsl(45, 93%, 47%)", "hsl(200, 70%, 50%)", "hsl(340, 70%, 50%)"];

const Index = () => {
  const { data: teacherCount = 0 } = useQuery({
    queryKey: ["teachers-count"],
    queryFn: async () => {
      const { count } = await supabase.from("teachers").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: subjectCount = 0 } = useQuery({
    queryKey: ["subjects-count"],
    queryFn: async () => {
      const { count } = await supabase.from("subjects").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: classCount = 0 } = useQuery({
    queryKey: ["classes-count"],
    queryFn: async () => {
      const { count } = await supabase.from("classes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: scheduleCount = 0 } = useQuery({
    queryKey: ["schedules-count"],
    queryFn: async () => {
      const { count } = await supabase.from("schedules").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: schedulesByDay = [] } = useQuery({
    queryKey: ["schedules-by-day"],
    queryFn: async () => {
      const { data: slots } = await supabase.from("time_slots").select("id, day");
      const { data: scheds } = await supabase.from("schedules").select("time_slot_id");
      if (!slots || !scheds) return [];
      const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
      return days.map(day => {
        const daySlotIds = slots.filter(s => s.day === day).map(s => s.id);
        return { day, jumlah: scheds.filter(s => daySlotIds.includes(s.time_slot_id)).length };
      });
    },
  });

  const pieData = [
    { name: "Guru", value: teacherCount },
    { name: "Mapel", value: subjectCount },
    { name: "Kelas", value: classCount },
    { name: "Jadwal", value: scheduleCount },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Selamat datang di e-Jadwal MTsN 5 Jakarta</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Guru" value={teacherCount} icon={Users} color="bg-primary/10 text-primary" />
          <StatCard title="Mata Pelajaran" value={subjectCount} icon={BookOpen} color="bg-secondary/20 text-secondary-foreground" />
          <StatCard title="Kelas" value={classCount} icon={School} color="bg-accent text-accent-foreground" />
          <StatCard title="Jadwal" value={scheduleCount} icon={CalendarDays} color="bg-destructive/10 text-destructive" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Distribusi Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--card-foreground))" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Jadwal Per Hari</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schedulesByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--card-foreground))" }} />
                    <Bar dataKey="jumlah" name="Jadwal" fill="hsl(158, 64%, 32%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
