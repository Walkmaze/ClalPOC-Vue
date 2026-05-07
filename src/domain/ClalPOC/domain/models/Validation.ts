import type { Severity, ValidationCategory } from "./common";

export type HitlFieldType = "text" | "textarea" | "select" | "number" | "date" | "checkbox";

export interface HitlField {
  name: string;
  type: HitlFieldType;
  label: string;
  labelHe?: string;
  options?: string[];
}

export interface HitlStep {
  step_id: string;
  title: string;
  titleHe?: string;
  description?: string;
  descriptionHe?: string;
  fields: HitlField[];
}

export interface Validation {
  id: string;
  name: string;
  nameHe?: string;
  description: string;
  descriptionHe?: string;
  category: ValidationCategory;
  rule: string;
  field: string;
  expected: string;
  severity: Severity;
  source?: string;
  requires_hitl?: boolean;
  hitl_reason?: string;
  hitl_reasonHe?: string;
  hitl_steps?: HitlStep[];
}

export interface ValidationResult {
  passed: boolean;
  actual_value: string | number | null;
  message: string;
  messageHe?: string;
}

export type ValidationStatus =
  | "pending"
  | "executing"
  | "pass"
  | "fail"
  | "warning"
  | "hitl_waiting";

export type HitlDecision = "approve" | "reject" | "escalate";
