import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async (u: User | null) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => check(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, isAdmin, loading };
}
