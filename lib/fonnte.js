export function getFonnteToken() {
  return process.env.FONNTE_TOKEN?.trim() || "";
}

export async function sendFonnteMessage(target, message) {
  const token = getFonnteToken();
  if (!token) {
    throw new Error("FONNTE_NOT_CONFIGURED");
  }

  const body = new URLSearchParams();
  body.set("target", target);
  body.set("message", message);
  body.set("countryCode", "62");

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: token },
    body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.reason || data.message || `Fonnte HTTP ${res.status}`);
  }

  if (data.status === false || data.detail === "invalid token") {
    throw new Error(data.reason || data.detail || "Fonnte gagal mengirim pesan.");
  }

  return data;
}
