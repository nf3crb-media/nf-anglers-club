import { createServiceClient } from "@/lib/supabase-server";

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
