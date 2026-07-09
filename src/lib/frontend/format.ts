export function decisionStyles(decision?: string) {
  if (decision === "INVEST") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (decision === "WATCHLIST") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (decision === "PASS") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

export function formatNumber(value?: number) {
  if (value === undefined || value === null) return "—";

  if (Math.abs(value) >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  return String(value);
}

export function formatMetric(value?: number, suffix = "") {
  if (value === undefined || value === null) return "—";
  return `${value}${suffix}`;
}