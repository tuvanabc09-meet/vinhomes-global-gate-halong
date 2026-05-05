import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type State = { user: User | null; isAdmin: boolean; loading: boolean };
let state: State = { user: null, isAdmin: false, loading: true };
const listeners = new Set<(s: State) => void>();
let initialized = false;

const setState = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
};

const checkRole = async (u: User | null) => {
  if (!u) {
    setState({ user: null, isAdmin: false, loading: false });
    return;
  }
  setState({ user: u });
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", u.id)
    .eq("role", "admin")
    .maybeSingle();
  setState({ user: u, isAdmin: !!data, loading: false });
};

const init = () => {
  if (initialized) return;
  initialized = true;
  supabase.auth.onAuthStateChange((_e, session) => {
    checkRole(session?.user ?? null);
  });
  supabase.auth.getSession().then(({ data }) => checkRole(data.session?.user ?? null));
};

export const refreshAdmin = async () => {
  const { data } = await supabase.auth.getSession();
  await checkRole(data.session?.user ?? null);
};

export function useAdmin() {
  const [, force] = useState(0);
  useEffect(() => {
    init();
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return state;
}
