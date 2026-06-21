import { createServiceClient } from "@/lib/supabase-server";

/**
 * Ambil email login dari member row atau auth.users (dan backfill ke member).
 */
export async function resolveMemberAuthEmail(member) {
  const service = createServiceClient();
  const fromRow = member.email?.trim()?.toLowerCase();
  if (fromRow) return fromRow;

  const { data, error } = await service.auth.admin.getUserById(member.id);
  if (error || !data?.user) {
    throw new Error("AUTH_USER_MISSING");
  }

  const fromAuth = data.user.email?.trim()?.toLowerCase();
  if (!fromAuth) {
    throw new Error("MEMBER_NO_EMAIL");
  }

  await service
    .from("member")
    .update({ email: fromAuth })
    .eq("id", member.id);

  return fromAuth;
}

/**
 * Buat sesi Supabase untuk member tanpa mengirim email —
 * generateLink (admin) + verifyOtp di server.
 */
export async function createSessionForEmail(authClient, email) {
  const service = createServiceClient();
  const normalized = email.trim().toLowerCase();

  const { data: linkData, error: linkErr } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: normalized,
  });

  if (linkErr) {
    throw new Error(linkErr.message || "SESSION_LINK_FAILED");
  }

  const tokenHash = linkData?.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("SESSION_TOKEN_FAILED");
  }

  const { data, error } = await authClient.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (error) {
    throw new Error(error.message || "SESSION_VERIFY_FAILED");
  }

  return data;
}
