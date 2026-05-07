import type { Contract } from "../models/Contract";
import type { Member } from "../models/Member";
import type { Priority } from "../models/common";

export function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDateTime(): string {
  const now = new Date();
  return now.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function calculateSlaDeadline(contract: Contract | null, isComplex: boolean): string {
  const clauses = contract?.clauses || [];
  const slaClause = clauses.find((c) => c.clause_id === "SLA-1");
  const days = slaClause
    ? isComplex
      ? (slaClause.sla_complex_business_days as number)
      : (slaClause.sla_business_days as number)
    : 5;
  const deadline = new Date();
  let added = 0;
  while (added < days) {
    deadline.setDate(deadline.getDate() + 1);
    const day = deadline.getDay();
    if (day !== 5 && day !== 6) added++;
  }
  return deadline.toISOString();
}

export function determinePriority(memberData: Member): Priority {
  const amount = memberData.withdrawal_amount || memberData.transfer_amount || memberData.redemption_amount || 0;
  if (amount > 100000) return "High";
  if (amount > 50000) return "Medium";
  return "Low";
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
