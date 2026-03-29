import { cn } from "@/lib/utils";

interface ScheduleCardMobileProps {
  slot: { id: string; start_time: string; end_time: string; slot_order: number };
  entries: any[];
  event: any | null;
  isActive: boolean;
  isPast: boolean;
}

const eventTypeStyles: Record<string, string> = {
  istirahat: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
  shalat: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  upacara: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  tadarus: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
  other: "bg-muted border-border text-muted-foreground",
};

export const ScheduleCardMobile = ({ slot, entries, event, isActive, isPast }: ScheduleCardMobileProps) => {
  if (event) {
    const style = eventTypeStyles[event.event_type] || eventTypeStyles.other;
    return (
      <div className={cn(
        "rounded-2xl border p-4 transition-all duration-300",
        style,
        isActive && "ring-2 ring-green-500/40 shadow-lg shadow-green-500/10"
      )}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium opacity-70">{slot.start_time} – {slot.end_time}</span>
          {isActive && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SEKARANG
            </span>
          )}
        </div>
        <p className="text-base font-bold">{event.name}</p>
        {event.description && <p className="text-xs opacity-60 mt-0.5">{event.description}</p>}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-all duration-300",
      isActive && "bg-green-500/10 border-green-500/30 ring-2 ring-green-500/30 shadow-lg shadow-green-500/10",
      isPast && !isActive && "bg-muted/40 border-border/40 opacity-60",
      !isActive && !isPast && "bg-card border-border/50 hover:shadow-md"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded-lg",
          isActive ? "bg-green-500/20 text-green-700 dark:text-green-300" :
          isPast ? "bg-muted text-muted-foreground" :
          "bg-primary/10 text-primary"
        )}>
          {slot.start_time} – {slot.end_time}
        </span>
        {isActive && (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SEKARANG
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground/40">—</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between gap-2">
              <div>
                <p className={cn("text-sm font-semibold", isActive && "text-green-700 dark:text-green-300")}>
                  {e.subjects?.name}
                </p>
                <p className="text-xs text-muted-foreground">{e.teachers?.name}</p>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                {e.classes?.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
