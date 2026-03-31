import { AlertCircle } from "lucide-react";

export const SectionError = ({ message = "Data tidak tersedia" }: { message?: string }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
    <AlertCircle className="w-5 h-5" />
    <p className="text-sm">{message}</p>
  </div>
);
