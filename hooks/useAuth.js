"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { mapAuthError } from "@/lib/auth-errors";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMember = useCallback(async () => {
    try {
      const res = await fetch("/api/member/me");
      const data = await res.json();
      if (data.ok && data.member) {
        setMember(data.member);
        setGame(data.game ?? null);
        return data.member;
      }
      if (data.code === "SIGNUP_INCOMPLETE" || res.status === 403) {
        setMember(null);
        setGame(null);
      }
      return null;
    } catch {
      setMember(null);
      setGame(null);
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await loadMember();
    } else {
      setMember(null);
      setGame(null);
    }
  }, [loadMember]);

  useEffect(() => {
    const supabase = createClient();

    refresh().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadMember();
      } else {
        setMember(null);
        setGame(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadMember, refresh]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMember(null);
    setGame(null);
    router.push("/login");
  }, [router]);

  /** @deprecated gunakan session Supabase — compat sementara */
  const login = useCallback((_memberData) => {
    loadMember();
  }, [loadMember]);

  return { user, member, game, loading, logout, refresh, login };
}

export function useWelcome() {
  const [welcomed, setWelcomed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setWelcomed(localStorage.getItem("nf_welcomed") === "1");
    setLoading(false);
  }, []);

  const markWelcomed = useCallback(() => {
    localStorage.setItem("nf_welcomed", "1");
    setWelcomed(true);
  }, []);

  return { welcomed, markWelcomed, loading };
}

export async function sendMagicLink({ email, mode, kode, wa_number, nama }) {
  const res = await fetch("/api/auth/send-magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, mode, kode, wa_number, nama }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.msg || mapAuthError({ message: "Gagal mengirim magic link." }));
  }
}
