import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { mapAuthError } from "@/lib/auth-errors";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, mode, kode, wa_number, nama } = await req.json();

    if (!email?.trim()) {
      return Response.json({ ok: false, msg: "Email wajib diisi." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[api/auth/send-magic-link] Supabase env missing");
      return Response.json(
        { ok: false, msg: "Konfigurasi Supabase belum lengkap di server." },
        { status: 500 }
      );
    }

    const supabase = createClient();
    const siteUrl = getSiteUrl();

    const options = {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    };

    if (mode === "signup") {
      options.data = {
        kode: kode?.toUpperCase?.()?.trim(),
        wa_number,
        nama: nama?.trim(),
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options,
    });

    if (error) {
      return Response.json({ ok: false, msg: mapAuthError(error) }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/auth/send-magic-link]", err);
    return Response.json({ ok: false, msg: mapAuthError(err) }, { status: 500 });
  }
}
