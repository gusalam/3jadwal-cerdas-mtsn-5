import { CalendarDays } from "lucide-react";

interface ScheduleEmptyProps {
  todayLabel: string;
}

export const ScheduleEmpty = ({ todayLabel }: ScheduleEmptyProps) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
    <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
      <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
      Belum ada jadwal untuk hari ini
    </h2>
    <p className="text-base text-muted-foreground mb-1">
      Hari ini: <span className="font-semibold text-foreground">{todayLabel}</span>
    </p>
    <p className="text-sm text-muted-foreground/70 max-w-sm">
      Silakan hubungi admin atau cek kembali nanti.
    </p>
  </div>
);
