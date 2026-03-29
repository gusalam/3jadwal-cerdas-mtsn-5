import { CalendarDays, Clock } from "lucide-react";
import schoolLogo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PublicHeaderProps {
  now: Date;
  todayLabel: string;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export const PublicHeader = ({ now, todayLabel }: PublicHeaderProps) => (
  <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl rounded-b-3xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center p-1.5">
            <img src={schoolLogo} alt="Logo MTsN 5 Jakarta" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold leading-tight tracking-tight">e-Jadwal MTsN 5 Jakarta</h1>
            <p className="text-xs sm:text-sm opacity-80">Papan Jadwal Digital</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90">
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">{formatDate(now)}</span>
            <span className="sm:hidden">{todayLabel}</span>
          </div>
          <div className="bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-xl font-mono text-lg sm:text-xl font-bold flex items-center gap-2 tabular-nums">
            <Clock className="w-4 h-4 opacity-70" />
            {formatTime(now)}
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Link to="/login">
          <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs">
            Login Admin
          </Button>
        </Link>
      </div>
    </div>
  </header>
);
