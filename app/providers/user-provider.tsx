"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { fireBaseClientAuth } from "@/lib/client/client-config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

//
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(fireBaseClientAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
