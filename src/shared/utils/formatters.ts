import type { Contract } from "@/domain/ClalPOC/domain/models/Contract";

type T = (key: string, params?: Record<string, any>) => string;

export interface SlaDisplay {
  text: string;
  color: string;
  warn?: boolean;
  breached?: boolean;
}

export function formatRelativeTime(isoString: string | undefined, t: T): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return t("time.justNow");
  if (diffMin < 60) return `${diffMin} ${t("time.minAgo")}`;
  if (diffHrs < 24) {
    const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${t("time.today")} ${timeStr}`;
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatSlaRemaining(slaDeadline: string | undefined, contract: Contract | null | undefined, t: T): SlaDisplay {
  if (!slaDeadline) return { text: "—", color: "text-text-muted" };
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHrs = diffMs / 3600000;
  const diffDays = diffMs / 86400000;

  let totalSlaDays = 5;
  if (contract?.clauses) {
    const slaClause = contract.clauses.find((c) => c.clause_id === "SLA-1");
    if (slaClause?.sla_business_days) totalSlaDays = slaClause.sla_business_days as number;
  }
  const totalSlaMs = totalSlaDays * 24 * 3600000;
  const pctRemaining = diffMs / totalSlaMs;

  if (diffMs < 0) return { text: t("time.breached"), color: "text-error", warn: true, breached: true };
  if (pctRemaining < 0.2) {
    const label = diffHrs < 24 ? `${Math.ceil(diffHrs)} ${t("time.hLeft")}` : `${Math.ceil(diffDays)} ${t("time.dLeft")}`;
    return { text: label, color: "text-warning", warn: true };
  }
  if (diffDays < 1) return { text: `${Math.ceil(diffHrs)} ${t("time.hLeft")}`, color: "text-text-primary" };
  return { text: `${Math.ceil(diffDays)} ${t("time.dLeft")}`, color: "text-text-primary" };
}

export function formatSlaDeadline(deadline: string | undefined): { text: string; color: string } {
  if (!deadline) return { text: "—", color: "text-text-muted" };
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const hoursLeft = Math.round(diff / (1000 * 60 * 60));

  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (hoursLeft < 0) return { text: `${dateStr} ${timeStr} (OVERDUE)`, color: "text-error" };
  if (hoursLeft < 24) return { text: `${dateStr} ${timeStr} (${hoursLeft}h left)`, color: "text-warning" };
  return { text: `${dateStr} ${timeStr}`, color: "text-text-primary" };
}

export function formatTimestamp(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", { hour12: false });
  } catch {
    return iso;
  }
}
