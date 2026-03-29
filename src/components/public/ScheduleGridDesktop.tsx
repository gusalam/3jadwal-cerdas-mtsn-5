import { cn } from "@/lib/utils";

interface Props {
  timeSlots: any[];
  displayClasses: { id: string; name: string }[];
  getCell: (slotId: string, classId: string) => any;
  getEvent: (slotId: string) => any;
  isCurrentSlot: (start: string, end: string) => boolean;
  isPastSlot: (end: string) => boolean;
}

const eventTypeStyles: Record<string, string> = {
  istirahat: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
  shalat: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  upacara: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  tadarus: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
  other: "bg-muted border-border text-muted-foreground",
};

export const ScheduleGridDesktop = ({ timeSlots, displayClasses, getCell, getEvent, isCurrentSlot, isPastSlot }: Props) => (
  <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-muted/60">
          <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap sticky left-0 bg-muted/60 z-10 min-w-[110px] border-b border-border/40">
            Jam
          </th>
          {displayClasses.map(c => (
            <th key={c.id} className="text-center p-3 font-semibold text-muted-foreground min-w-[120px] border-b border-border/40">
              {c.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(slot => {
          const active = isCurrentSlot(slot.start_time, slot.end_time);
          const past = isPastSlot(slot.end_time);
          const event = getEvent(slot.id);

          if (event) {
            const style = eventTypeStyles[event.event_type] || eventTypeStyles.other;
            return (
              <tr key={slot.id} className={cn(
                "transition-colors",
                active && "bg-green-500/5",
                past && !active && "opacity-50"
              )}>
                <td className={cn(
                  "p-3 whitespace-nowrap sticky left-0 z-10 border-b border-border/30",
                  active ? "bg-green-500/10 font-bold text-green-700 dark:text-green-400" :
                  past ? "bg-muted/30 text-muted-foreground" : "bg-card"
                )}>
                  <div className="text-xs">{slot.start_time} – {slot.end_time}</div>
                  {active && (
                    <span className="inline-flex items-center gap-1 text-[9px] mt-0.5 text-green-600 dark:text-green-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Sekarang
                    </span>
                  )}
                </td>
                <td colSpan={displayClasses.length} className="p-2 text-center border-b border-border/30">
                  <div className={cn("rounded-xl px-3 py-2.5 border font-semibold text-sm", style)}>
                    {event.name}
                    {event.description && <div className="text-[10px] font-normal opacity-60 mt-0.5">{event.description}</div>}
                  </div>
                </td>
              </tr>
            );
          }

          return (
            <tr key={slot.id} className={cn(
              "transition-colors",
              active && "bg-green-500/5",
              past && !active && "opacity-50"
            )}>
              <td className={cn(
                "p-3 whitespace-nowrap sticky left-0 z-10 border-b border-border/30",
                active ? "bg-green-500/10 font-bold text-green-700 dark:text-green-400" :
                past ? "bg-muted/30 text-muted-foreground" : "bg-card"
              )}>
                <div className="text-xs">{slot.start_time} – {slot.end_time}</div>
                {active && (
                  <span className="inline-flex items-center gap-1 text-[9px] mt-0.5 text-green-600 dark:text-green-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Sekarang
                  </span>
                )}
              </td>
              {displayClasses.map(c => {
                const cell = getCell(slot.id, c.id);
                return (
                  <td key={c.id} className="p-1.5 text-center border-b border-border/30">
                    {cell ? (
                      <div className={cn(
                        "rounded-xl px-2 py-2 transition-all",
                        active ? "bg-green-500/15 border border-green-500/30" :
                        past ? "bg-muted/30" : "bg-accent/40 hover:bg-accent/60"
                      )}>
                        <div className={cn("font-semibold text-xs", active && "text-green-700 dark:text-green-300")}>
                          {cell.subjects?.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {cell.teachers?.name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
