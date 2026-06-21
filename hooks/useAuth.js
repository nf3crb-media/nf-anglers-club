"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/constants";

function readMember() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.member);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readWelcomed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.welcomed) === "1";
}

export function useAuth() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMember(readMember());
    setLoading(false);
  }, []);

  const login = useCallback((memberData) => {
    localStorage.setItem(STORAGE_KEYS.member, JSON.stringify(memberData));
    setMember(memberData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.member);
    setMember(null);
    router.push("/login");
  }, [router]);

  const refresh = useCallback(() => {
    setMember(readMember());
  }, []);

  return { member, loading, login, logout, refresh };
}

export function useWelcome() {
  const [welcomed, setWelcomed] = useState(readWelcomed);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWelcomed(readWelcomed());
    setLoading(false);
  }, []);

  const markWelcomed = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.welcomed, "1");
    setWelcomed(true);
  }, []);

  return { welcomed, markWelcomed, loading };
}
