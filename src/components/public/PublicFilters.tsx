import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PublicFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterClass: string;
  onFilterClassChange: (v: string) => void;
  filterTeacher: string;
  onFilterTeacherChange: (v: string) => void;
  classes: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}

export const PublicFilters = ({
  search, onSearchChange,
  filterClass, onFilterClassChange,
  filterTeacher, onFilterTeacherChange,
  classes, teachers,
}: PublicFiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Cari guru atau mapel..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="pl-10 h-10 rounded-xl bg-card border-border/50 text-sm"
      />
    </div>
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select value={filterClass} onValueChange={onFilterClassChange}>
        <SelectTrigger className="w-[150px] h-10 rounded-xl text-sm">
          <SelectValue placeholder="Semua Kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kelas</SelectItem>
          {classes.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterTeacher} onValueChange={onFilterTeacherChange}>
        <SelectTrigger className="w-[170px] h-10 rounded-xl text-sm">
          <SelectValue placeholder="Semua Guru" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Guru</SelectItem>
          {teachers.map(t => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);
