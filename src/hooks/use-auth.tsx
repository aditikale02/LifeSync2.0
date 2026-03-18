import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const clearSupabaseAuthStorage = () => {
    const keysToRemove: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error && /invalid refresh token|refresh token not found|jwt/i.test(error.message.toLowerCase())) {
        clearSupabaseAuthStorage();
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
        setLocation("/login");
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    void restoreSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (
        event === "SIGNED_OUT" &&
        !session
      ) {
        clearSupabaseAuthStorage();
      }
      
      const path = window.location.pathname;
      const isAuthPage = ['/', '/login', '/register', '/signup'].includes(path);

      if (!session && !isAuthPage) {
        setLocation("/login");
      } else if (session && isAuthPage && event === 'SIGNED_IN') {
        setLocation("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useSafeSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: s, error: sErr } = await supabase.auth.getSession();
      if (sErr) console.error("SESSION ERROR:", sErr);

      let session = s.session;
      if (!session) {
        const { data: r, error: rErr } = await supabase.auth.refreshSession();
        if (rErr) console.error("REFRESH ERROR:", rErr);
        session = r.session ?? null;
      }

      if (!mounted) return;
      setUser(session?.user ?? null);
      setReady(true);
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, ready };
}
