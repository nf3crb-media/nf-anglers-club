import { createServiceClient } from "@/lib/supabase-server";

/** @deprecated Gunakan magic link + /auth/callback */
export async function POST() {
  return Response.json(
    {
      ok: false,
      msg: "Login sudah pakai magic link email. Buka /login untuk daftar atau masuk.",
    },
    { status: 410 }
  );
}
