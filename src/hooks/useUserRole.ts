import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuru, setIsGuru] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = (roles ?? []).map(r => r.role);
      setIsAdmin(roleList.includes("admin"));
      setIsGuru(roleList.includes("guru"));
      setLoading(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, isGuru, loading };
}
