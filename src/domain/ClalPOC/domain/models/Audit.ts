import type { ValidationCategory } from "./common";

export type AuditResult =
  | "SUCCESS"
  | "COMPLETED"
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "REJECTED"
  | "WARNING"
  | "RUNNING"
  | "INFO"
  | "PENDING"
  | "PAUSED"
  | "RESOLVED"
  | "ESCALATED"
  | "AWAITING_DOCUMENTS"
  | "AWAITING_CONSENT"
  | "CANCELLED";

export interface AuditEntry {
  action: string;
  actionHe?: string;
  category: ValidationCategory | string;
  source: string;
  result: AuditResult;
  details?: string;
  detailsHe?: string;
  timestamp?: string;
}

export interface AnalysisMessage {
  icon: string;
  text: string;
  textHe?: string;
  done?: boolean;
}
