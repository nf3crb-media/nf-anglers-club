"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { mapTangkapanRow } from "@/lib/feed-utils";

export function useFeed(discFilter = "all") {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("tangkapan")
        .select(
          "id, fish, weight, disc, gear, likes, dibuat_at, photo_url, member:member_id(nama, username), spot:spot_id(nama, kota)"
        )
        .eq("status", "tayang")
        .eq("verification_status", "verified")
        .order("dibuat_at", { ascending: false })
        .limit(30);

      if (discFilter !== "all") {
        query = query.eq("disc", discFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(
        (data || []).map((row) => {
          const spotLabel = row.spot?.nama || row.spot?.kota;
          return mapTangkapanRow(row, spotLabel);
        })
      );
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [discFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return { posts, loading, refresh: load };
}
