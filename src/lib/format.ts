export function shortHash(hash?: string | null, head = 6, tail = 4): string {
  if (!hash) return "—";
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function formatBytes(bytes?: number | null): string {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

export function formatCount(value?: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString();
}

/** Confidence may arrive as 0–1 or 0–100. Normalise to whole percent. */
export function toPercent(confidence?: number | null): number | null {
  if (confidence == null || Number.isNaN(confidence)) return null;
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function evidenceTypeLabel(type?: string | null): string {
  switch ((type ?? "").toLowerCase()) {
    case "cdr":
      return "CDR";
    case "whatsapp":
    case "chat":
      return "WhatsApp";
    case "statement":
    case "stmt":
      return "Statement";
    default:
      return type ? type.toUpperCase() : "—";
  }
}

export function titleCase(value?: string | null): string {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
