import type { AnalysisMessage, AuditEntry } from "./Audit";
import type { ExecutionStatus, FundType, Priority, UseCase } from "./common";
import type { Contract } from "./Contract";
import type { Member } from "./Member";
import type { Outcome } from "./Outcome";
import type { Regulation } from "./Regulation";
import type { Validation, ValidationResult, ValidationStatus } from "./Validation";

export interface ClaudeLog {
  model: string;
  maxTokens: number;
  requestedAt: string;
  respondedAt: string;
  system: string;
  userMessage: string;
  rawResponse: string;
  usage?: { input_tokens?: number; output_tokens?: number } | null;
  stopReason?: string | null;
  error?: boolean;
  status?: number;
}

export interface Execution {
  id: string;
  processId: string;
  timestamp: string;
  timestampDisplay: string;
  memberName: string;
  fundType: FundType | string;
  fundTypeLabel: string;
  useCase: UseCase | string;
  useCaseLabel: string;
  priority: Priority;
  slaDeadline: string;
  status: ExecutionStatus;
  memberData: Member;
  contract: Contract;
  regulations: Regulation[];
  analysisMessages: AnalysisMessage[] | null;
  validations: Validation[] | null;
  validationStatuses: ValidationStatus[];
  validationResults: (ValidationResult | null)[];
  outcome: Outcome | null;
  auditEntries: AuditEntry[];
  claudeLog?: ClaudeLog;
  error: string | null;
}
