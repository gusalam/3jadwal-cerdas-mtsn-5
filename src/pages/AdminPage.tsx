import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPage = () => {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("full_name");
      return data ?? [];
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data ?? [];
    },
  });

  const addRole = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: selectedUser,
        role: selectedRole as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role berhasil ditambahkan");
      setAddOpen(false);
      setSelectedUser("");
      setSelectedRole("");
    },
    onError: (e: any) => {
      if (e.message?.includes("duplicate")) {
        toast.error("User sudah memiliki role ini");
      } else {
        toast.error("Gagal menambah role");
      }
    },
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus role"),
  });

  const getProfileLabel = (profile: { full_name: string | null; email?: string | null; id: string }) => {
    const name = profile.full_name || "Tanpa Nama";
    const email = (profile as any).email;
    return email ? `${name} (${email})` : name;
  };

  const getRoleBadgeColor = (role: string) =>
    role === "admin" ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30";

  const usersWithRoles = profiles.map((p) => ({
    ...p,
    roles: userRoles.filter((r) => r.user_id === p.id),
  }));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Role</h1>
            <p className="text-muted-foreground text-sm">Kelola role admin dan guru</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Tambah Role
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Daftar User & Role
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left">Nama</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithRoles.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">{getProfileLabel(user)}</td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.length === 0 && (
                            <span className="text-muted-foreground text-xs">Belum ada role</span>
                          )}
                          {user.roles.map((r) => (
                            <Badge key={r.id} variant="outline" className={getRoleBadgeColor(r.role)}>
                              {r.role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1 justify-end">
                          {user.roles.map((r) => (
                            <AlertDialog key={r.id}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Yakin ingin menghapus role <strong>{r.role}</strong> dari <strong>{getProfileLabel(user)}</strong>?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeRole.mutate(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersWithRoles.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-muted-foreground">
                        Belum ada user terdaftar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Role User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                   <SelectTrigger><SelectValue placeholder="Pilih Guru / User" /></SelectTrigger>
                   <SelectContent>
                     {profiles.map((p) => (
                       <SelectItem key={p.id} value={p.id}>
                         {getProfileLabel(p)}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guru">Guru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
              <Button onClick={() => addRole.mutate()} disabled={!selectedUser || !selectedRole}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
