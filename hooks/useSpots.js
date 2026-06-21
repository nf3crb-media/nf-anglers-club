"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

function mapSpot(row) {
  const member = row.member || {};
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    disc: row.disc,
    fish: row.fish,
    user: member.nama || "Angler",
    productive: row.productive,
    best: row.best_bait || "-",
    city: row.kota || row.provinsi || "Indonesia",
    nama: row.nama,
    kota: row.kota,
    provinsi: row.provinsi,
    alamat: row.nama,
  };
}

export function useSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("spot")
        .select("*, member:member_id(nama, username)")
        .order("dibuat_at", { ascending: false });

      if (error) throw error;
      setSpots((data || []).map(mapSpot));
    } catch {
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("spot-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spot" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { spots, loading, refresh: load };
}
