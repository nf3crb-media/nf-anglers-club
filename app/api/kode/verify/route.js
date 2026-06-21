import { createServiceClient } from "@/lib/supabase-server";

const WELCOME_POIN = 200;

function normalizeWa(wa) {
  return wa.replace(/\D/g, "").replace(/^0/, "62").replace(/^8/, "628");
}

export async function POST(req) {
  try {
    const { kode, wa_number, nama } = await req.json();

    if (!kode?.trim() || !wa_number?.trim() || !nama?.trim()) {
      return Response.json(
        { ok: false, msg: "Kode, nomor WA, dan nama wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const kodeNorm = kode.toUpperCase().trim();
    const waNorm = normalizeWa(wa_number);

    const { data: kodeData, error: kodeErr } = await supabase
      .from("kode_unik")
      .select("*")
      .eq("kode", kodeNorm)
      .eq("status", "belum_dipakai")
      .single();

    if (kodeErr || !kodeData) {
      return Response.json(
        { ok: false, msg: "Kode tidak valid atau sudah dipakai." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("member")
      .select("*")
      .eq("wa_number", waNorm)
      .maybeSingle();

    let member = existing;

    if (member) {
      const { data: updated, error: updateErr } = await supabase
        .from("member")
        .update({ nama: nama.trim(), last_active: new Date().toISOString() })
        .eq("id", member.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      member = updated;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("member")
        .insert({ wa_number: waNorm, nama: nama.trim() })
        .select()
        .single();

      if (createErr) throw createErr;
      member = created;
    }

    await supabase
      .from("kode_unik")
      .update({
        status: "terpakai",
        dipakai_oleh: member.id,
        dipakai_at: new Date().toISOString(),
      })
      .eq("id", kodeData.id);

    const isFirstKode = !existing;
    if (isFirstKode) {
      await supabase.from("poin_log").insert({
        member_id: member.id,
        jenis: "belanja",
        label: `Kode perdana: ${kodeData.produk || kodeNorm}`,
        poin: WELCOME_POIN,
        oleh: "Sistem",
      });

      await supabase
        .from("member")
        .update({ poin_belanja: WELCOME_POIN })
        .eq("id", member.id);

      member = { ...member, poin_belanja: WELCOME_POIN };
    }

    return Response.json({
      ok: true,
      member_id: member.id,
      member: {
        id: member.id,
        nama: member.nama,
        wa_number: member.wa_number,
        tier: member.tier,
        poin_belanja: member.poin_belanja ?? 0,
        poin_aktivitas: member.poin_aktivitas ?? 0,
        total_poin:
          (member.poin_belanja ?? 0) + (member.poin_aktivitas ?? 0),
      },
      welcome_bonus: isFirstKode ? WELCOME_POIN : 0,
    });
  } catch (err) {
    console.error("[kode/verify]", err);
    return Response.json(
      { ok: false, msg: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}
