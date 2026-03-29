// Greedy schedule generator with constraint validation

export interface Teacher { id: string; name: string; }
export interface Subject { id: string; name: string; hours_per_week: number; }
export interface ClassRoom { id: string; name: string; }
export interface TimeSlot { id: string; day: string; start_time: string; end_time: string; slot_order: number; }
export interface TeacherSubject { teacher_id: string; subject_id: string; }
export interface TeacherPreference { teacher_id: string; time_slot_id: string; is_available: boolean; }
export interface ScheduleEntry {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  time_slot_id: string;
}

export interface Conflict {
  type: "teacher" | "class";
  message: string;
  entries: ScheduleEntry[];
}

export function generateSchedule(
  classes: ClassRoom[],
  subjects: Subject[],
  teachers: Teacher[],
  timeSlots: TimeSlot[],
  teacherSubjects: TeacherSubject[],
  teacherPreferences: TeacherPreference[],
  lockedEntries: ScheduleEntry[] = []
): { schedule: ScheduleEntry[]; conflicts: Conflict[] } {
  const schedule: ScheduleEntry[] = [...lockedEntries];
  const conflicts: Conflict[] = [];

  // Maps for quick lookup
  const teacherSlotMap = new Map<string, string>(); // "teacherId-slotId" -> classId
  const classSlotMap = new Map<string, string>();   // "classId-slotId" -> subjectId

  // Register locked entries
  for (const entry of lockedEntries) {
    teacherSlotMap.set(`${entry.teacher_id}-${entry.time_slot_id}`, entry.class_id);
    classSlotMap.set(`${entry.class_id}-${entry.time_slot_id}`, entry.subject_id);
  }

  // Sort days for even distribution
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const slotsByDay = new Map<string, TimeSlot[]>();
  for (const day of days) {
    slotsByDay.set(day, timeSlots.filter(s => s.day === day).sort((a, b) => a.slot_order - b.slot_order));
  }

  // Preference lookup
  const prefMap = new Map<string, boolean>();
  for (const p of teacherPreferences) {
    prefMap.set(`${p.teacher_id}-${p.time_slot_id}`, p.is_available);
  }

  const isTeacherAvailable = (teacherId: string, slotId: string) => {
    const key = `${teacherId}-${slotId}`;
    return prefMap.get(key) !== false; // default available
  };

  // Count teacher load for balancing
  const teacherLoad = new Map<string, number>();
  for (const entry of lockedEntries) {
    teacherLoad.set(entry.teacher_id, (teacherLoad.get(entry.teacher_id) ?? 0) + 1);
  }

  // For each class, assign subjects across the week
  for (const cls of classes) {
    // Build a list of (subject, candidate teachers) pairs needed
    const assignments: { subjectId: string; teacherIds: string[]; hoursNeeded: number }[] = [];

    for (const subj of subjects) {
      // Find all teachers for this subject
      const ts = teacherSubjects.filter(t => t.subject_id === subj.id);
      if (ts.length === 0) continue;

      // Sort teachers by current load (least loaded first)
      const sortedTeachers = ts
        .map(t => t.teacher_id)
        .sort((a, b) => (teacherLoad.get(a) ?? 0) - (teacherLoad.get(b) ?? 0));

      assignments.push({ subjectId: subj.id, teacherIds: sortedTeachers, hoursNeeded: subj.hours_per_week });
    }

    // Distribute evenly across days using round-robin
    let dayIndex = 0;

    for (const assignment of assignments) {
      let placed = 0;
      let attempts = 0;
      const maxAttempts = days.length * 15;

      while (placed < assignment.hoursNeeded && attempts < maxAttempts) {
        const day = days[dayIndex % days.length];
        const daySlots = slotsByDay.get(day) ?? [];
        
        let found = false;
        // Try each candidate teacher in order of least load
        for (const slot of daySlots) {
          const classKey = `${cls.id}-${slot.id}`;
          if (classSlotMap.has(classKey)) continue;

          for (const teacherId of assignment.teacherIds) {
            const teacherKey = `${teacherId}-${slot.id}`;
            if (teacherSlotMap.has(teacherKey)) continue;
            if (!isTeacherAvailable(teacherId, slot.id)) continue;

            // Place it
            const entry: ScheduleEntry = {
              class_id: cls.id,
              subject_id: assignment.subjectId,
              teacher_id: teacherId,
              time_slot_id: slot.id,
            };
            schedule.push(entry);
            teacherSlotMap.set(teacherKey, cls.id);
            classSlotMap.set(classKey, assignment.subjectId);
            teacherLoad.set(teacherId, (teacherLoad.get(teacherId) ?? 0) + 1);
            placed++;
            found = true;
            break;
          }
          if (found) break;
        }

        dayIndex++;
        attempts++;
      }

      if (placed < assignment.hoursNeeded) {
        const teacherNames = assignment.teacherIds.map(id => {
          const t = teachers.find(te => te.id === id);
          return t?.name ?? id;
        }).join(", ");
        conflicts.push({
          type: "teacher",
          message: `Tidak bisa menempatkan semua jam untuk mapel di kelas ${cls.name} (kurang ${assignment.hoursNeeded - placed} jam). Guru: ${teacherNames} — kemungkinan konflik preferensi ketersediaan.`,
          entries: [],
        });
      }
    }
  }

  return { schedule, conflicts };
}

export function validateSchedule(entries: ScheduleEntry[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const teacherSlots = new Map<string, ScheduleEntry[]>();
  const classSlots = new Map<string, ScheduleEntry[]>();

  for (const entry of entries) {
    const tk = `${entry.teacher_id}-${entry.time_slot_id}`;
    const ck = `${entry.class_id}-${entry.time_slot_id}`;

    if (!teacherSlots.has(tk)) teacherSlots.set(tk, []);
    teacherSlots.get(tk)!.push(entry);

    if (!classSlots.has(ck)) classSlots.set(ck, []);
    classSlots.get(ck)!.push(entry);
  }

  teacherSlots.forEach((entries, key) => {
    if (entries.length > 1) {
      conflicts.push({
        type: "teacher",
        message: `Guru bentrok pada slot yang sama`,
        entries,
      });
    }
  });

  classSlots.forEach((entries, key) => {
    if (entries.length > 1) {
      conflicts.push({
        type: "class",
        message: `Kelas bentrok pada slot yang sama`,
        entries,
      });
    }
  });

  return conflicts;
}
