import { requireMember } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase-server";
import { getStoryForMember } from "@/lib/services/story";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const supabase = createServiceClient();
    const story = await getStoryForMember(supabase, auth.member.id);

    return Response.json({
      ok: true,
      ...story,
    });
  } catch (err) {
    console.error("[api/story]", err);
    return Response.json({ ok: false, msg: "Gagal memuat story." }, { status: 500 });
  }
}
