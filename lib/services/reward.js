import { calcTierFromPoin, fetchMember } from "@/lib/poin";

export async function listActiveRewards(supabase) {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("aktif", true)
    .order("cost_poin");

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("reward_catalog")) {
      return [];
    }
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
  if (!reward) {
    return { ok: false, status: 404, msg: "Hadiah tidak ditemukan." };
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
