import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/env";
import { onboardMember } from "@/lib/services/onboard";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/beranda";
  const siteUrl = getSiteUrl();

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent("Link login gagal atau kadaluarsa.")}`
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const service = createServiceClient();
      try {
        const result = await onboardMember(service, user);
        const bonus = result.welcome_bonus || 0;
        if (result.is_new && bonus > 0) {
          return NextResponse.redirect(`${siteUrl}/verify?bonus=${bonus}`);
        }
      } catch (err) {
        const msg = err.message || "";
        if (msg === "SIGNUP_INCOMPLETE") {
          return NextResponse.redirect(
            `${siteUrl}/login?error=${encodeURIComponent("Daftar belum lengkap. Isi kode NF + profil.")}`
          );
        }
        if (msg === "KODE_INVALID") {
          return NextResponse.redirect(
            `${siteUrl}/login?error=${encodeURIComponent("Kode sudah dipakai atau tidak valid.")}`
          );
        }
        if (msg === "WA_TAKEN") {
          return NextResponse.redirect(
            `${siteUrl}/login?error=${encodeURIComponent("Nomor WA sudah terdaftar.")}`
          );
        }
        if (msg === "WA_NOT_VERIFIED") {
          return NextResponse.redirect(
            `${siteUrl}/login?error=${encodeURIComponent("Verifikasi WhatsApp dulu sebelum klik magic link.")}`
          );
        }
        console.error("[auth/callback onboard]", err);
        return NextResponse.redirect(
          `${siteUrl}/login?error=${encodeURIComponent("Gagal menyelesaikan pendaftaran.")}`
        );
      }
    }

    return NextResponse.redirect(`${siteUrl}${next.startsWith("/") ? next : `/${next}`}`);
  }

  return NextResponse.redirect(`${siteUrl}/login?error=auth`);
}
