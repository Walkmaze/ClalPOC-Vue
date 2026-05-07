export type FundType = "investment" | "compensation" | "study";

export type UseCase =
  | "withdrawal"
  | "fund_transfer"
  | "beneficiary_update"
  | "employer_change"
  | "early_redemption";

export type Severity = "blocking" | "warning" | "info";

export type ValidationCategory =
  | "identity"
  | "eligibility"
  | "financial"
  | "regulatory"
  | "contract"
  | "processing"
  | "withdrawal"
  | "sla"
  | "penalties"
  | "system"
  | "ai"
  | "hitl"
  | "integration";

export type Priority = "High" | "Medium" | "Low";

export type ExecutionStatus =
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "REJECTED"
  | "ERROR"
  | "PENDING_APPROVAL"
  | "AWAITING_CUSTOMER"
  | "AWAITING_DOCUMENTS"
  | "AWAITING_CONSENT"
  | "CANCELLED";

export interface FundTypeOption {
  id: FundType;
  label: string;
  labelHe: string;
}

export interface UseCaseOption {
  id: UseCase;
  label: string;
  labelHe: string;
  icon: string;
}
