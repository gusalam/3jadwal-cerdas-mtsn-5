import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Video, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface VideoItem {
  id: string;
  title: string;
  youtube_id: string;
  sort_order: number;
  is_active: boolean;
}

const VideoCmsPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["cms-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as VideoItem[];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = { title, youtube_id: youtubeId, sort_order: sortOrder, is_active: true };
      if (editing) {
        const { error } = await supabase.from("videos").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-videos"] });
      toast.success(editing ? "Video diperbarui" : "Video ditambahkan");
      closeDialog();
    },
    onError: () => toast.error("Gagal menyimpan video"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("videos").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-videos"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-videos"] });
      toast.success("Video dihapus");
      setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const openAdd = () => {
    setEditing(null);
    setTitle("");
    setYoutubeId("");
    setSortOrder(videos.length + 1);
    setDialogOpen(true);
  };

  const openEdit = (v: VideoItem) => {
    setEditing(v);
    setTitle(v.title);
    setYoutubeId(v.youtube_id);
    setSortOrder(v.sort_order);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const extractYoutubeId = (input: string) => {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input.trim();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Video Sekolah</h1>
            <p className="text-sm text-muted-foreground">Kelola video YouTube yang ditampilkan di slider halaman utama</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Video
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Video className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Belum ada video. Tambahkan video pertama.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {videos.map((v) => (
              <Card key={v.id} className={`transition-all ${!v.is_active ? "opacity-50" : ""}`}>
                <CardContent className="flex items-center gap-4 p-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground/40 shrink-0" />

                  <div className="w-32 sm:w-44 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                      alt={v.title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{v.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {v.youtube_id}</p>
                    <p className="text-xs text-muted-foreground">Urutan: {v.sort_order}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={v.is_active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: v.id, is_active: checked })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(v.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Video" : "Tambah Video"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Video</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Profil MTsN 5 Jakarta" />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL atau ID</Label>
              <Input
                value={youtubeId}
                onChange={(e) => setYoutubeId(extractYoutubeId(e.target.value))}
                placeholder="https://youtube.com/watch?v=... atau ID video"
              />
              {youtubeId && (
                <div className="rounded-lg overflow-hidden mt-2">
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Urutan</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Batal</Button>
            <Button onClick={() => upsert.mutate()} disabled={!title || !youtubeId || upsert.isPending}>
              {upsert.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Video?</AlertDialogTitle>
            <AlertDialogDescription>Video akan dihapus dari daftar slider.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default VideoCmsPage;
