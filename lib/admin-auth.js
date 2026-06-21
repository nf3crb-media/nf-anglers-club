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

  return { ok: true };
}

export const ADMIN_STORAGE_KEY = "nf_admin_key";
