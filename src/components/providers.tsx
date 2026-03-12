"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User } from "@/lib/types/database";

type AuthState = {
  authUser: AuthUser | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  authUser: null,
  user: null,
  loading: true,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Providers");
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setAuthUser(session?.user ?? null);
        if (session?.user?.id) {
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          setUser(data ?? null);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user?.id) {
        supabase
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => setUser(data ?? null));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ authUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
