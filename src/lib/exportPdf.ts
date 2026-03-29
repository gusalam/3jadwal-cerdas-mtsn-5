import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportData {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  timeSlots: { id: string; day: string; start_time: string; end_time: string; slot_order: number }[];
  schedules: { class_id: string; subject_id: string; teacher_id: string; time_slot_id: string }[];
  title?: string;
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export function exportSchedulePdf(data: ExportData) {
  const { classes, subjects, teachers, timeSlots, schedules, title } = data;

  const getName = (list: { id: string; name: string }[], id: string) =>
    list.find((i) => i.id === id)?.name ?? "-";

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pdfTitle = title || "JADWAL PELAJARAN";
  doc.setFontSize(14);
  doc.text(pdfTitle, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text("MTsN 5 Jakarta", doc.internal.pageSize.getWidth() / 2, 21, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, doc.internal.pageSize.getWidth() - 15, 15, { align: "right" });

  for (const day of DAYS) {
    const daySlots = timeSlots
      .filter((s) => s.day === day)
      .sort((a, b) => a.slot_order - b.slot_order);

    if (daySlots.length === 0) continue;

    const headers = ["Jam", ...classes.map((c) => c.name)];

    const body = daySlots.map((slot) => {
      const row = [`${slot.start_time}-${slot.end_time}`];
      for (const cls of classes) {
        const entry = schedules.find(
          (s) => s.class_id === cls.id && s.time_slot_id === slot.id
        );
        if (entry) {
          row.push(`${getName(subjects, entry.subject_id)}\n${getName(teachers, entry.teacher_id)}`);
        } else {
          row.push("-");
        }
      }
      return row;
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY
        ? (doc as any).lastAutoTable.finalY + 8
        : 28,
      head: [[{ content: day, colSpan: headers.length, styles: { halign: "center", fillColor: [34, 120, 80], textColor: 255, fontStyle: "bold" } }], headers],
      body,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
      headStyles: { fillColor: [34, 120, 80], textColor: 255, fontSize: 7 },
      columnStyles: { 0: { cellWidth: 22, fontStyle: "bold" } },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 0) {
          data.cell.styles.halign = "center";
        }
      },
    });
  }

  const fileName = title ? title.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf" : "Jadwal_MTsN5_Jakarta.pdf";
  doc.save(fileName);
}
