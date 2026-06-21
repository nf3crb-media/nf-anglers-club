const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function segment(len) {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

export function generateKode() {
  return `NF-${segment(4)}-${segment(4)}`;
}

export function generateKodeBatch(count, existing = new Set()) {
  const codes = [];
  let attempts = 0;
  const maxAttempts = count * 20;

  while (codes.length < count && attempts < maxAttempts) {
    attempts += 1;
    const kode = generateKode();
    if (existing.has(kode) || codes.includes(kode)) continue;
    codes.push(kode);
    existing.add(kode);
  }

  return codes;
}
