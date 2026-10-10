export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

/** "2026-10-09T06:09:16" -> "9 Okt 2026". Returns "-" when the API has no date. */
export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** UUID -> first 8 characters, upper-cased */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export interface SpecLine {
  label: string;
  value: string;
}

export function parseDescription(description: string | null): {
  specs: SpecLine[];
  notes: string[];
} {
  const specs: SpecLine[] = [];
  const notes: string[] = [];

  for (const rawLine of (description ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9 .\/()-]{0,30}):\s*(.+)$/);
    if (match) {
      specs.push({ label: match[1].trim(), value: match[2].trim() });
    } else {
      notes.push(line);
    }
  }

  return { specs, notes };
}
