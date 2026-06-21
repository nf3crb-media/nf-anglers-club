import { calcTierFromPoin, fetchMember } from "@/lib/poin";
import { isRewardVisible, slugifyRewardName } from "@/lib/reward-utils";

export async function listActiveRewards(supabase) {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("aktif", true)
    .order("sort_order")
    .order("cost_poin");

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("reward_catalog")) {
      return [];
    }
    throw error;
  }

  return (data || []).filter((r) => isRewardVisible(r));
}

export async function listAllRewards(supabase) {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .order("sort_order")
    .order("cost_poin");

  if (error) {
    if (error.code === "PGRST205") return [];
    throw error;
  }

  return data || [];
}

export async function getMemberRedemptions(supabase, memberId, limit = 10) {
  const { data, error } = await supabase
    .from("reward_redemption")
    .select("id, cost_poin, status, note, dibuat_at, fulfilled_at, reward:reward_id(slug, nama, icon)")
    .eq("member_id", memberId)
    .order("dibuat_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "PGRST205") return [];
    throw error;
  }

  return data || [];
}

export async function listPendingRedemptions(supabase, limit = 30) {
  const { data, error } = await supabase
    .from("reward_redemption")
    .select(
      "id, cost_poin, status, note, dibuat_at, member:member_id(id, nama, wa_number), reward:reward_id(slug, nama, icon)"
    )
    .eq("status", "pending")
    .order("dibuat_at", { ascending: true })
    .limit(limit);

  if (error) {
    if (error.code === "PGRST205") return [];
    throw error;
  }

  return data || [];
}

function parseOptionalDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseOptionalInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : Math.floor(n);
}

function buildRewardPayload(body, { partial = false } = {}) {
  const payload = {};

  const set = (key, val) => {
    if (!partial || body[key] !== undefined) payload[key] = val;
  };

  set("nama", body.nama?.trim());
  set("deskripsi", body.deskripsi?.trim() || null);
  set("icon", body.icon?.trim() || "🎁");
  set("cost_poin", Number(body.cost_poin));
  set("stock", parseOptionalInt(body.stock));
  set("highlight", body.highlight?.trim() || null);
  set("starts_at", parseOptionalDate(body.starts_at));
  set("ends_at", parseOptionalDate(body.ends_at));
  set("sort_order", parseOptionalInt(body.sort_order) ?? 0);
  set("aktif", body.aktif !== false);

  if (!partial || body.slug !== undefined) {
    const slug = body.slug?.trim() || slugifyRewardName(body.nama);
    if (slug) payload.slug = slug;
  }

  return payload;
}

export async function createReward(supabase, body) {
  const payload = buildRewardPayload(body);
  if (!payload.nama || !payload.slug) {
    return { ok: false, status: 400, msg: "Nama hadiah wajib." };
  }
  if (!payload.cost_poin || payload.cost_poin < 1) {
    return { ok: false, status: 400, msg: "Biaya poin tidak valid." };
  }

  const { data, error } = await supabase
    .from("reward_catalog")
    .insert({ ...payload, updated_at: new Date().toISOString() })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, status: 409, msg: "Slug hadiah sudah dipakai." };
    }
    throw error;
  }

  return { ok: true, reward: data };
}

export async function updateReward(supabase, id, body) {
  if (!id) return { ok: false, status: 400, msg: "ID hadiah wajib." };

  const payload = buildRewardPayload(body, { partial: true });
  if (payload.cost_poin !== undefined && payload.cost_poin < 1) {
    return { ok: false, status: 400, msg: "Biaya poin tidak valid." };
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("reward_catalog")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, status: 409, msg: "Slug hadiah sudah dipakai." };
    }
    throw error;
  }

  if (!data) return { ok: false, status: 404, msg: "Hadiah tidak ditemukan." };
  return { ok: true, reward: data };
}

export async function deleteReward(supabase, id, { hard = false } = {}) {
  if (!id) return { ok: false, status: 400, msg: "ID hadiah wajib." };

  if (hard) {
    const { count } = await supabase
      .from("reward_redemption")
      .select("id", { count: "exact", head: true })
      .eq("reward_id", id);

    if ((count ?? 0) > 0) {
      return {
        ok: false,
        status: 409,
        msg: "Hadiah sudah pernah ditukar — nonaktifkan saja.",
      };
    }

    const { error } = await supabase.from("reward_catalog").delete().eq("id", id);
    if (error) throw error;
    return { ok: true, deleted: true };
  }

  const { data, error } = await supabase
    .from("reward_catalog")
    .update({ aktif: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  if (!data) return { ok: false, status: 404, msg: "Hadiah tidak ditemukan." };
  return { ok: true, deactivated: true };
}

export async function fulfillRedemption(supabase, redemptionId, csId = null) {
  const { data, error } = await supabase
    .from("reward_redemption")
    .update({
      status: "fulfilled",
      cs_id: csId,
      fulfilled_at: new Date().toISOString(),
      note: "Hadiah dikirim / diambil",
    })
    .eq("id", redemptionId)
    .eq("status", "pending")
    .select("id")
    .single();

  if (error) throw error;
  if (!data) return { ok: false, status: 404, msg: "Penukaran tidak ditemukan." };
  return { ok: true };
}

function deductPoin(member, cost) {
  const belanja = member.poin_belanja ?? 0;
  const aktivitas = member.poin_aktivitas ?? 0;
  const total = belanja + aktivitas;

  if (total < cost) {
    return { ok: false, msg: "Poin tidak cukup." };
  }

  let remaining = cost;
  let newAktivitas = aktivitas;
  let newBelanja = belanja;

  if (newAktivitas >= remaining) {
    newAktivitas -= remaining;
    remaining = 0;
  } else {
    remaining -= newAktivitas;
    newAktivitas = 0;
    newBelanja -= remaining;
  }

  return {
    ok: true,
    newBelanja,
    newAktivitas,
    total_poin: newBelanja + newAktivitas,
  };
}

export async function redeemReward(supabase, memberId, rewardSlug) {
  const { data: reward, error: rewardErr } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("slug", rewardSlug)
    .eq("aktif", true)
    .maybeSingle();

  if (rewardErr) throw rewardErr;
  if (!reward || !isRewardVisible(reward)) {
    return { ok: false, status: 404, msg: "Hadiah tidak tersedia." };
  }

  if (reward.stock != null && reward.stock <= 0) {
    return { ok: false, status: 409, msg: "Stok hadiah habis." };
  }

  const member = await fetchMember(supabase, memberId);
  const deduction = deductPoin(member, reward.cost_poin);
  if (!deduction.ok) {
    return { ok: false, status: 400, msg: deduction.msg };
  }

  const tier = calcTierFromPoin(deduction.total_poin);

  const { data: redemption, error: redeemErr } = await supabase
    .from("reward_redemption")
    .insert({
      member_id: memberId,
      reward_id: reward.id,
      cost_poin: reward.cost_poin,
      status: "pending",
      note: "Menunggu konfirmasi CS NF",
    })
    .select("id, status, dibuat_at")
    .single();

  if (redeemErr) throw redeemErr;

  const { error: logErr } = await supabase.from("poin_log").insert({
    member_id: memberId,
    jenis: "aktivitas",
    label: `Tukar: ${reward.nama}`,
    poin: -reward.cost_poin,
    oleh: "Sistem",
  });
  if (logErr) throw logErr;

  const { error: updErr } = await supabase
    .from("member")
    .update({
      poin_belanja: deduction.newBelanja,
      poin_aktivitas: deduction.newAktivitas,
      tier,
    })
    .eq("id", memberId);
  if (updErr) throw updErr;

  if (reward.stock != null) {
    await supabase
      .from("reward_catalog")
      .update({ stock: reward.stock - 1 })
      .eq("id", reward.id)
      .gt("stock", 0);
  }

  return {
    ok: true,
    redemption,
    reward: {
      slug: reward.slug,
      nama: reward.nama,
      icon: reward.icon,
      cost_poin: reward.cost_poin,
    },
    tier,
    total_poin: deduction.total_poin,
  };
}
