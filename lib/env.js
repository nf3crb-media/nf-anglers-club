export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getSuperAdminEmail() {
  return (process.env.NF_SUPER_ADMIN_EMAIL || "nf3.crb@gmail.com")
    .trim()
    .toLowerCase();
}

export function isSuperAdminEmail(email) {
  return !!email && email.trim().toLowerCase() === getSuperAdminEmail();
}
