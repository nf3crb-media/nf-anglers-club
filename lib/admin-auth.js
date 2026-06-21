import { requireMember } from "@/lib/session";
import { ADMIN_STORAGE_KEY } from "@/lib/admin-constants";

export { ADMIN_STORAGE_KEY };

export function getAdminSecret() {
  return process.env.NF_ADMIN_SECRET || "";
}

export function verifyAdminRequest(req) {
  const secret = getAdminSecret();
  if (!secret) {
    return { ok: false, status: 503, msg: "NF_ADMIN_SECRET belum dikonfigurasi." };
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token || token !== secret) {
    return { ok: false, status: 401, msg: "Akses admin ditolak." };
  }

  return { ok: true, mode: "secret" };
}

/** CS via login Supabase (is_admin / is_cs) atau fallback kunci NF_ADMIN_SECRET */
export async function verifyAdminAccess(req) {
  const session = await requireMember();
  if (session.ok && (session.member.is_admin || session.member.is_cs)) {
    return {
      ok: true,
      mode: "session",
      member: session.member,
      member_id: session.member.id,
    };
  }

  const secretAuth = verifyAdminRequest(req);
  if (secretAuth.ok) {
    return secretAuth;
  }

  if (!session.ok && secretAuth.status === 401) {
    return {
      ok: false,
      status: 401,
      msg: "Login sebagai admin NF atau masukkan kunci CS.",
    };
  }

  return secretAuth;
}
