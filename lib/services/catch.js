import { randomBytes } from "crypto";
import {
  calcRarityFromRatio,
  CATCH_ACTIVITY_POIN,
  RARITY_XP_MULT,
} from "@/lib/rarity-core";
import { addAktivitasPoin } from "@/lib/poin";
import { applyXpGain } from "@/lib/services/game-progress";
import { processCatchForStory } from "@/lib/services/story";

const BUCKET = "catch-photos";

export async function getFishSpecies(supabase, speciesId) {
  const { data, error } = await supabase
    .from("fish_species")
    .select("*")
    .eq("id", speciesId)
    .eq("aktif", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function buildSerialNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `NFC-${stamp}-${rand}`;
}

export async function uploadCatchPhoto(supabase, memberId, photoBase64) {
  if (!photoBase64?.startsWith("data:")) return null;

  const match = photoBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;

  const contentType = match[1];
  const ext = contentType.includes("png") ? "png" : "jpg";
  const buffer = Buffer.from(match[2], "base64");
  const path = `${memberId}/${randomBytes(8).toString("hex")}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.warn("[catch/upload]", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export function catchNeedsReview(fromComp, rarityKey) {
  return !!fromComp || rarityKey === "legendary";
}

export async function grantCatchRewards(supabase, {
  memberId,
  tangkapanId,
  fishCardId,
  species,
  rarityKey,
  usesNf,
  fishName,
  weightKg,
}) {
  const baseXp = species?.base_xp ?? 10;
  const xpMult = RARITY_XP_MULT[rarityKey] ?? 1;
  const xp = Math.round(baseXp * xpMult);
  const aktivitas =
    (CATCH_ACTIVITY_POIN[rarityKey] ?? 10) + (usesNf ? 10 : 0);

  await supabase.from("xp_log").insert({
    member_id: memberId,
    source: "catch",
    label: `Tangkapan ${fishName} (${rarityKey})`,
    xp,
    ref_type: "tangkapan",
    ref_id: tangkapanId,
    idempotency_key: `catch-xp-${tangkapanId}`,
  }).then(({ error }) => {
    if (error && !error.message?.includes("duplicate")) {
      console.warn("[catch/xp]", error.message);
    }
  });

  const progress = await applyXpGain(supabase, memberId, xp);

  await addAktivitasPoin(supabase, {
    member_id: memberId,
    poin: aktivitas,
    label: `Fish Card ${fishName} · ${rarityKey.toUpperCase()}`,
  });

  await upsertFishdex(supabase, {
    memberId,
    speciesId: species.id,
    tangkapanId,
    weightKg,
    fishCardId,
  });

  const storyCompleted = await processCatchForStory(supabase, memberId, {
    species_slug: species.slug,
    habitat: species.habitat,
    weight_kg: weightKg,
    tangkapan_id: tangkapanId,
  });

  return {
    xp,
    aktivitas_poin: aktivitas,
    angler_level: progress.angler_level,
    angler_rank: progress.angler_rank,
    story_missions: storyCompleted,
  };
}

export async function upsertFishdex(supabase, {
  memberId,
  speciesId,
  tangkapanId,
  weightKg,
  fishCardId,
}) {
  const { data: existing } = await supabase
    .from("member_fishdex")
    .select("*")
    .eq("member_id", memberId)
    .eq("fish_species_id", speciesId)
    .maybeSingle();

  const weight = weightKg != null ? Number(weightKg) : null;

  if (!existing) {
    await supabase.from("member_fishdex").insert({
      member_id: memberId,
      fish_species_id: speciesId,
      first_catch_id: tangkapanId,
      largest_catch_id: tangkapanId,
      highest_weight_kg: weight,
      total_catches: 1,
    });
    return;
  }

  const patch = {
    total_catches: (existing.total_catches ?? 0) + 1,
    updated_at: new Date().toISOString(),
  };

  if (
    weight != null &&
    (existing.highest_weight_kg == null || weight > Number(existing.highest_weight_kg))
  ) {
    patch.highest_weight_kg = weight;
    patch.largest_catch_id = tangkapanId;
  }

  await supabase
    .from("member_fishdex")
    .update(patch)
    .eq("id", existing.id);
}

export async function createCatch(supabase, memberId, body) {
  const {
    fish_species_id,
    weight,
    disc,
    gear,
    bait,
    uses_nf,
    nf_product,
    from_comp,
    custom_spot_name,
    photo_base64,
    caption,
  } = body;

  const species = await getFishSpecies(supabase, fish_species_id);
  if (!species) {
    throw new Error("SPECIES_INVALID");
  }

  const weightNum = parseFloat(weight);
  if (!weightNum || weightNum <= 0) {
    throw new Error("WEIGHT_INVALID");
  }

  if (!disc) {
    throw new Error("DISC_REQUIRED");
  }

  const rarity = calcRarityFromRatio(
    weightNum,
    species.average_weight_kg,
    !!from_comp
  );
  const needsReview = catchNeedsReview(!!from_comp, rarity.key);
  const usesNf = !!uses_nf;
  const now = new Date().toISOString();
  const photoUrl = await uploadCatchPhoto(supabase, memberId, photo_base64);

  const { data: tangkapan, error: tangErr } = await supabase
    .from("tangkapan")
    .insert({
      member_id: memberId,
      fish: species.nama,
      fish_species_id: species.id,
      weight: weightNum,
      disc,
      gear: gear || bait || null,
      bait: bait || gear || null,
      nf_product: nf_product || (usesNf ? bait || gear : null),
      uses_nf: usesNf,
      custom_spot_name: custom_spot_name || null,
      photo_url: photoUrl,
      caption: caption || null,
      caught_at: now,
      verification_status: needsReview ? "pending" : "verified",
      verified_at: needsReview ? null : now,
      status: needsReview ? "pending" : "tayang",
    })
    .select()
    .single();

  if (tangErr) throw tangErr;

  const serial = buildSerialNumber();
  const { data: fishCard, error: cardErr } = await supabase
    .from("fish_card")
    .insert({
      member_id: memberId,
      tangkapan_id: tangkapan.id,
      fish: species.nama,
      fish_species_id: species.id,
      fish_name_snapshot: species.nama,
      weight: weightNum,
      disc,
      gear: gear || bait || null,
      uses_nf: usesNf,
      nf_boosted: usesNf,
      rarity: rarity.key,
      rarity_ratio: parseFloat(rarity.ratio),
      from_comp: !!from_comp,
      photo_url: photoUrl,
      serial_number: serial,
      status: needsReview ? "pending" : "tayang",
    })
    .select()
    .single();

  if (cardErr) throw cardErr;

  let rewards = null;
  if (!needsReview) {
    rewards = await grantCatchRewards(supabase, {
      memberId,
      tangkapanId: tangkapan.id,
      fishCardId: fishCard.id,
      species,
      rarityKey: rarity.key,
      usesNf,
      fishName: species.nama,
      weightKg: weightNum,
    });
  }

  return {
    tangkapan,
    fish_card: fishCard,
    rarity,
    needs_review: needsReview,
    rewards,
  };
}

export async function finalizeCatchApproval(supabase, tangkapanId, csMemberId) {
  const { data: tangkapan, error } = await supabase
    .from("tangkapan")
    .select("*")
    .eq("id", tangkapanId)
    .maybeSingle();

  if (error) throw error;
  if (!tangkapan) throw new Error("NOT_FOUND");
  if (tangkapan.verification_status === "verified") {
    throw new Error("ALREADY_VERIFIED");
  }
  if (tangkapan.verification_status === "rejected") {
    throw new Error("ALREADY_REJECTED");
  }

  const { data: card } = await supabase
    .from("fish_card")
    .select("*")
    .eq("tangkapan_id", tangkapanId)
    .maybeSingle();

  const now = new Date().toISOString();
  await supabase
    .from("tangkapan")
    .update({
      verification_status: "verified",
      verified_by: csMemberId || null,
      verified_at: now,
      status: "tayang",
      updated_at: now,
    })
    .eq("id", tangkapanId);

  if (card?.id) {
    await supabase
      .from("fish_card")
      .update({ status: "tayang" })
      .eq("id", card.id);
  }

  const species = tangkapan.fish_species_id
    ? await getFishSpecies(supabase, tangkapan.fish_species_id)
    : null;

  const rewards = await grantCatchRewards(supabase, {
    memberId: tangkapan.member_id,
    tangkapanId: tangkapan.id,
    fishCardId: card?.id,
    species: species || {
      id: tangkapan.fish_species_id,
      nama: tangkapan.fish,
      base_xp: 10,
    },
    rarityKey: card?.rarity || "common",
    usesNf: tangkapan.uses_nf,
    fishName: tangkapan.fish,
    weightKg: tangkapan.weight,
  });

  return { tangkapan_id: tangkapanId, rewards };
}

export async function rejectCatch(supabase, tangkapanId, reason, csMemberId) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("tangkapan")
    .update({
      verification_status: "rejected",
      verified_by: csMemberId || null,
      verified_at: now,
      rejection_reason: reason || "Ditolak CS",
      status: "ditolak",
      updated_at: now,
    })
    .eq("id", tangkapanId)
    .eq("verification_status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("NOT_FOUND");

  await supabase
    .from("fish_card")
    .update({ status: "ditolak" })
    .eq("tangkapan_id", tangkapanId);

  return { tangkapan_id: tangkapanId };
}
