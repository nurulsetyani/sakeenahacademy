// Menormalkan input nomor HP Indonesia ke format E.164 tanpa "+" (628xxxxxxxxxx),
// sesuai constraint `profiles_phone_format` di migration 000002.
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

export function isValidIndonesianPhone(normalized: string): boolean {
  return /^62[0-9]{8,13}$/.test(normalized);
}
