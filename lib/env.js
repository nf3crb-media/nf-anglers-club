export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

/** Daftar email super admin (is_admin + is_cs saat onboard). Pisah koma. */
export function getSuperAdminEmails() {
  const raw =
    process.env.NF_SUPER_ADMIN_EMAILS ||
    process.env.NF_SUPER_ADMIN_EMAIL ||
    "nf3.crb@gmail.com,sampriatna@gmail.com";

  return [...new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )];
}

export function getSuperAdminEmail() {
  return getSuperAdminEmails()[0] || "nf3.crb@gmail.com";
}

export function isSuperAdminEmail(email) {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.trim().toLowerCase());
}
