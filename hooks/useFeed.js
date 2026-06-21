"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { mapTangkapanRow } from "@/lib/feed-utils";
import { MOCK_CAUGHT } from "@/lib/mock-feed";

export function useFeed(discFilter = "all") {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("mock");

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

      if (data?.length) {
        setPosts(
          data.map((row) => {
            const spotLabel = row.spot?.nama || row.spot?.kota;
            return mapTangkapanRow(row, spotLabel);
          })
        );
        setSource("supabase");
      } else {
        const mock =
          discFilter === "all"
            ? MOCK_CAUGHT
            : MOCK_CAUGHT.filter((c) => c.disc === discFilter);
        setPosts(mock);
        setSource("mock");
      }
    } catch {
      const mock =
        discFilter === "all"
          ? MOCK_CAUGHT
          : MOCK_CAUGHT.filter((c) => c.disc === discFilter);
      setPosts(mock);
      setSource("mock");
    } finally {
      setLoading(false);
    }
  }, [discFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return { posts, loading, source, refresh: load };
}
