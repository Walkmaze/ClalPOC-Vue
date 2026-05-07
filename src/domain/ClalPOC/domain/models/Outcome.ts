import type { Validation, ValidationResult } from "./Validation";

export type OutcomeType =
  | "approved"
  | "blocked"
  | "approval"
  | "customer_action"
  | "tax_consent";

export interface OutcomeBreakdown {
  gross: number;
  tax: number;
  taxRate: number;
  fee: number;
  feeRate: number;
  net: number;
}

export interface OutcomeFailure {
  validation: Validation;
  result: ValidationResult;
}

export interface Outcome {
  type: OutcomeType;
  subtype?: string;
  message: string;
  messageHe?: string;
  failures?: OutcomeFailure[];
  useCase?: string;
  breakdown?: OutcomeBreakdown;
  eligibleDate?: string | null;
}
