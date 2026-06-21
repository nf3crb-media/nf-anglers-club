import { ADMIN_STORAGE_KEY } from "./admin-auth";

export function getAdminKey() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_STORAGE_KEY) || "";
}

export function setAdminKey(key) {
  sessionStorage.setItem(ADMIN_STORAGE_KEY, key);
}

export function clearAdminKey() {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
}

export async function adminFetch(url, options = {}) {
  const key = getAdminKey();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${key}`,
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, { ...options, headers });
}
