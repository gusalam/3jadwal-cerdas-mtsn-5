import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  label?: string;
  required?: boolean;
}

export const ImageUpload = ({
  currentUrl,
  onUrlChange,
  onFileSelect,
  selectedFile,
  label = "Gambar",
  required = false,
}: ImageUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    onFileSelect(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    onFileSelect(null);
    setPreview(null);
    onUrlChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {displayUrl ? (
        <div className="relative group">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-40 object-cover rounded-xl border border-border"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              className="text-xs"
            >
              <Upload className="w-3 h-3 mr-1" /> Ganti
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={clearFile}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Hapus
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <ImageIcon className="w-8 h-8 opacity-50" />
          <span className="text-xs font-medium">Klik untuk upload gambar</span>
          <span className="text-[10px] opacity-60">JPG, PNG, WebP (maks 5MB)</span>
        </button>
      )}
    </div>
  );
};
