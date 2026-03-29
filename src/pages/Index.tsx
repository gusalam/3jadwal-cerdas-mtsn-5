import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, School, CalendarDays, Newspaper, Bell, Image, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  isLoading?: boolean;
}) => (
  <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardContent className="p-0">
      <div className="flex items-center gap-4 p-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const COLORS = ["hsl(158, 64%, 32%)", "hsl(45, 93%, 47%)", "hsl(200, 70%, 50%)", "hsl(340, 70%, 50%)"];

const Index = () => {
  const { data: teacherCount = 0, isLoading: loadingT } = useQuery({
    queryKey: ["teachers-count"],
    queryFn: async () => {
      const { count } = await supabase.from("teachers").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: subjectCount = 0, isLoading: loadingS } = useQuery({
    queryKey: ["subjects-count"],
    queryFn: async () => {
      const { count } = await supabase.from("subjects").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: classCount = 0, isLoading: loadingC } = useQuery({
    queryKey: ["classes-count"],
    queryFn: async () => {
      const { count } = await supabase.from("classes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: scheduleCount = 0, isLoading: loadingSch } = useQuery({
    queryKey: ["schedules-count"],
    queryFn: async () => {
      const { count } = await supabase.from("schedules").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: postCount = 0, isLoading: loadingP } = useQuery({
    queryKey: ["posts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("posts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: announcementCount = 0, isLoading: loadingA } = useQuery({
    queryKey: ["announcements-count"],
    queryFn: async () => {
      const { count } = await supabase.from("announcements").select("*", { count: "exact", head: true });
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
      return days.map((day) => {
        const daySlotIds = slots.filter((s) => s.day === day).map((s) => s.id);
        return { day, jumlah: scheds.filter((s) => daySlotIds.includes(s.time_slot_id)).length };
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Selamat datang di panel admin e-Jadwal MTsN 5 Jakarta
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Guru" value={teacherCount} icon={Users} color="bg-primary/10 text-primary" isLoading={loadingT} />
          <StatCard title="Mata Pelajaran" value={subjectCount} icon={BookOpen} color="bg-secondary/20 text-secondary-foreground" isLoading={loadingS} />
          <StatCard title="Kelas" value={classCount} icon={School} color="bg-accent text-accent-foreground" isLoading={loadingC} />
          <StatCard title="Jadwal" value={scheduleCount} icon={CalendarDays} color="bg-blue-100 text-blue-700" isLoading={loadingSch} />
          <StatCard title="Berita" value={postCount} icon={Newspaper} color="bg-orange-100 text-orange-700" isLoading={loadingP} />
          <StatCard title="Pengumuman" value={announcementCount} icon={Bell} color="bg-purple-100 text-purple-700" isLoading={loadingA} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Distribusi Data</h3>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--card-foreground))",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Jadwal Per Hari</h3>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schedulesByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--card-foreground))",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="jumlah" name="Jadwal" fill="hsl(158, 64%, 32%)" radius={[6, 6, 0, 0]} />
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
