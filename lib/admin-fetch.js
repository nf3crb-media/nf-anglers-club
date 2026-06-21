import { ADMIN_STORAGE_KEY } from "./admin-constants";

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
  const headers = { ...(options.headers || {}) };

  if (key) {
    headers.Authorization = `Bearer ${key}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

export async function trySessionAdmin() {
  const res = await fetch("/api/admin/overview", { credentials: "include" });
  const data = await res.json();
  return data.ok === true;
}
