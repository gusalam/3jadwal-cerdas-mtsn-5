import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAcademicYears() {
  const { data: years = [] } = useQuery({
    queryKey: ["academic_years"],
    queryFn: async () => {
      const { data } = await supabase.from("academic_years").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const activeYear = years.find((y) => y.is_active) ?? null;

  return { years, activeYear };
}
