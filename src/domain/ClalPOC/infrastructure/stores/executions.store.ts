import { defineStore } from "pinia";

import type { AuditEntry } from "@/domain/ClalPOC/domain/models/Audit";
import type { Contract } from "@/domain/ClalPOC/domain/models/Contract";
import type { Execution } from "@/domain/ClalPOC/domain/models/Execution";
import type { Member } from "@/domain/ClalPOC/domain/models/Member";
import type { Outcome } from "@/domain/ClalPOC/domain/models/Outcome";
import type { Regulation } from "@/domain/ClalPOC/domain/models/Regulation";
import type { HitlDecision, ValidationResult } from "@/domain/ClalPOC/domain/models/Validation";
import { FUND_TYPES, getUseCaseLabel } from "@/domain/ClalPOC/domain/services/dataGenerators";
import { calculateSlaDeadline, delay, determinePriority, formatDateTime, formatTime, randInt } from "@/domain/ClalPOC/domain/services/executionHelpers";
import { generateBulkScenarios } from "@/domain/ClalPOC/domain/services/bulkGenerator";
import { determineOutcome, executeValidation } from "@/domain/ClalPOC/domain/services/validationEngine";
import { callClaude, ClaudeApiError } from "@/domain/ClalPOC/infrastructure/services/claudeApi";

const USE_CASE_LABELS: Record<string, string> = {
  withdrawal: "withdrawal request",
  fund_transfer: "fund transfer request",
  beneficiary_update: "beneficiary update request",
  employer_change: "employer change request",
  early_redemption: "early redemption request",
};

const USE_CASE_ICONS: Record<string, string> = {
  withdrawal: "💰",
  fund_transfer: "🔄",
  beneficiary_update: "👤",
  employer_change: "🏢",
  early_redemption: "⏰",
};

const UC_LABELS_HE: Record<string, string> = {
  withdrawal: "בקשת משיכה",
  fund_transfer: "בקשת העברה בין מסלולים",
  beneficiary_update: "בקשת עדכון מוטבים",
  employer_change: "בקשת החלפת מעסיק",
  early_redemption: "בקשת פדיון מוקדם",
};

interface HitlResolver {
  resolve: (value: { decision: HitlDecision; stepData?: any }) => void;
  validationIndex: number;
}

// Module-level non-reactive maps for control state. These cannot live in
// reactive Pinia state because we need raw refs (Pinia would deeply proxy
// them and changes to abort flags would trigger spurious reactivity).
const abortRefs: Record<string, boolean> = {};
const hitlResolvers: Record<string, HitlResolver> = {};

interface ExecutionsState {
  executions: Execution[];
  floodProgress: { total: number; launched: number } | null;
}

export const useExecutionsStore = defineStore("executions", {
  state: (): ExecutionsState => ({
    executions: [],
    floodProgress: null,
  }),

  getters: {
    byId: (state) => (id: string) => state.executions.find((e) => e.id === id),
  },

  actions: {
    /** Patch an execution by id. */
    update(id: string, patch: Partial<Execution>) {
      const idx = this.executions.findIndex((e) => e.id === id);
      if (idx === -1) return;
      this.executions[idx] = { ...this.executions[idx], ...patch };
    },

    addAudit(id: string, entry: Omit<AuditEntry, "timestamp">) {
      const idx = this.executions.findIndex((e) => e.id === id);
      if (idx === -1) return;
      const ex = this.executions[idx];
      this.executions[idx] = {
        ...ex,
        auditEntries: [...ex.auditEntries, { ...entry, timestamp: formatTime() }],
      };
    },

    /**
     * Create a new execution from the current scenario and start running it.
     * Mirrors handleLaunch + runFlowForExecution from React App.jsx.
     */
    launch(opts: {
      memberData: Member;
      contract: Contract;
      regulations: Regulation[];
      fundType: string;
      apiKey: string;
    }) {
      const { memberData, contract, regulations, fundType, apiKey } = opts;
      const currentUseCase = memberData.use_case || "withdrawal";
      const procId = `PROC-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
      const fundLabel = FUND_TYPES.find((f) => f.id === fundType);
      const priority = determinePriority(memberData);
      const slaDeadline = calculateSlaDeadline(contract, false);

      const execContract: Contract = { ...contract, clauses: [...contract.clauses] };

      const newExecution: Execution = {
        id: procId,
        processId: procId,
        timestamp: new Date().toISOString(),
        timestampDisplay: formatDateTime(),
        memberName: memberData.member_name || "",
        fundType,
        fundTypeLabel: fundLabel ? `${fundLabel.labelHe} — ${fundLabel.label}` : fundType,
        useCase: currentUseCase,
        useCaseLabel: getUseCaseLabel(fundType, currentUseCase),
        priority,
        slaDeadline,
        status: "RUNNING",
        memberData: { ...memberData },
        contract: execContract,
        regulations: [...regulations],
        analysisMessages: null,
        validations: null,
        validationStatuses: [],
        validationResults: [],
        outcome: null,
        auditEntries: [],
        error: null,
      };

      this.executions = [newExecution, ...this.executions];
      abortRefs[procId] = false;
      this.runFlow(procId, { ...memberData }, execContract, [...regulations], apiKey);
      return procId;
    },

    abort(id: string) {
      abortRefs[id] = true;
      delete hitlResolvers[id];
    },

    async runFlow(
      execId: string,
      execMemberData: Member,
      execContract: Contract,
      execRegulations: Regulation[],
      apiKey: string
    ): Promise<void> {
      const currentUseCase = execMemberData.use_case || "withdrawal";
      const ucLabel = USE_CASE_LABELS[currentUseCase] || "request";
      const ucIcon = USE_CASE_ICONS[currentUseCase] || "📋";
      const ucLabelHe = UC_LABELS_HE[currentUseCase] || "בקשה";
      const memberNameHe = execMemberData.member_name_he || execMemberData.member_name || "";

      const messages = [
        { icon: "⏳", text: `Receiving ${ucLabel} for ${execMemberData.member_name}...`, textHe: `מקבל ${ucLabelHe} עבור ${memberNameHe}...` },
        { icon: "📋", text: `Analyzing member profile and fund data...`, textHe: `מנתח פרופיל מבוטח ונתוני ביטוח...` },
        { icon: "📜", text: `Reading ${execContract.clauses.length} customer contract clauses...`, textHe: `קורא ${execContract.clauses.length} סעיפי פוליסה לקוח...` },
        { icon: "⚖️", text: `Checking ${execRegulations.length} regulatory requirements...`, textHe: `בודק ${execRegulations.length} דרישות רגולטוריות...` },
        { icon: "🧠", text: `Determining required validation steps for ${ucLabel}...`, textHe: `מתכנן שלבי בדיקה נדרשים עבור ${ucLabelHe}...` },
      ];

      this.update(execId, { analysisMessages: [] });
      this.addAudit(execId, {
        action: "Request intake",
        actionHe: "קליטת בקשה",
        category: "system",
        source: "—",
        result: "SUCCESS",
        details: `${ucIcon} ${ucLabel} — Process initiated`,
        detailsHe: `${ucIcon} ${ucLabelHe} — התהליך החל`,
      });

      for (const msg of messages) {
        if (abortRefs[execId]) return;
        await delay(800);
        const idx = this.executions.findIndex((e) => e.id === execId);
        if (idx === -1) return;
        this.executions[idx] = {
          ...this.executions[idx],
          analysisMessages: [...(this.executions[idx].analysisMessages || []), { ...msg, done: true }],
        };
      }

      this.addAudit(execId, {
        action: "Contract analysis",
        actionHe: "ניתוח פוליסה",
        category: "ai",
        source: "—",
        result: "SUCCESS",
        details: `${execContract.clauses.length} contract clauses analyzed`,
        detailsHe: `${execContract.clauses.length} סעיפי פוליסה נותחו`,
      });
      this.addAudit(execId, {
        action: "Regulation check",
        actionHe: "בדיקת רגולציה",
        category: "ai",
        source: "—",
        result: "SUCCESS",
        details: `${execRegulations.length} regulations checked`,
        detailsHe: `${execRegulations.length} תקנות נבדקו`,
      });

      let validationArray: any[];
      try {
        const { validations, log } = await callClaude(execMemberData, execContract, execRegulations, apiKey);
        validationArray = validations;
        this.update(execId, { claudeLog: log });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const patch: Partial<Execution> = { error: `API Error: ${message}`, status: "ERROR" };
        if (err instanceof ClaudeApiError) patch.claudeLog = err.log;
        this.update(execId, patch);
        return;
      }

      if (!Array.isArray(validationArray) || validationArray.length === 0) {
        this.update(execId, { error: "Claude returned an invalid response.", status: "ERROR" });
        return;
      }

      await delay(500);
      const idx = this.executions.findIndex((e) => e.id === execId);
      if (idx !== -1) {
        this.executions[idx] = {
          ...this.executions[idx],
          analysisMessages: [
            ...(this.executions[idx].analysisMessages || []),
            {
              icon: "✅",
              text: `Flow generated: ${validationArray.length} validation steps identified`,
              textHe: `זרימה נוצרה: ${validationArray.length} שלבי בדיקה זוהו`,
              done: true,
            },
          ],
        };
      }
      this.addAudit(execId, {
        action: "Flow generation",
        actionHe: "יצירת זרימה",
        category: "ai",
        source: "—",
        result: "SUCCESS",
        details: `${validationArray.length} validations generated`,
        detailsHe: `${validationArray.length} בדיקות נוצרו`,
      });

      this.update(execId, {
        validations: validationArray,
        validationStatuses: validationArray.map(() => "pending"),
        validationResults: validationArray.map(() => null),
      });

      await delay(600);

      // Phase 1: run all non-HITL validations; HITL marked as waiting.
      const results: (ValidationResult | null)[] = new Array(validationArray.length).fill(null);
      const hitlIndices: number[] = [];

      for (let i = 0; i < validationArray.length; i++) {
        if (abortRefs[execId]) return;
        const v = validationArray[i];

        if (v.requires_hitl) {
          hitlIndices.push(i);
          this.patchStatus(execId, i, "hitl_waiting");
          this.addAudit(execId, {
            action: v.name,
            actionHe: v.nameHe || v.name,
            category: "hitl",
            source: v.source || "—",
            result: "PAUSED",
            details: `Waiting for human review: ${v.hitl_reason || "Manual review required"}`,
            detailsHe: `ממתין לבדיקה אנושית: ${v.hitl_reasonHe || v.hitl_reason || "נדרשת בדיקה ידנית"}`,
          });
          await delay(300);
          continue;
        }

        this.patchStatus(execId, i, "executing");
        await delay(600);

        const result = executeValidation(v, execMemberData);
        results[i] = result;
        const status = result.passed ? "pass" : v.severity === "warning" ? "warning" : "fail";
        this.patchStatusAndResult(execId, i, status, result);

        this.addAudit(execId, {
          action: v.name,
          actionHe: v.nameHe || v.name,
          category: v.category,
          source: v.source || "—",
          result: status.toUpperCase() as any,
          details: result.message,
          detailsHe: result.messageHe || result.message,
        });
      }

      // Phase 2: wait on each HITL resolution.
      if (hitlIndices.length > 0) {
        this.update(execId, { status: "PENDING_APPROVAL" });

        for (const hitlIdx of hitlIndices) {
          if (abortRefs[execId]) return;

          const hitlResult = await new Promise<{ decision: HitlDecision; stepData?: any }>((resolve) => {
            hitlResolvers[execId] = { resolve, validationIndex: hitlIdx };
          });
          delete hitlResolvers[execId];
          if (abortRefs[execId]) return;

          const v = validationArray[hitlIdx];
          if (hitlResult.stepData) {
            const steps = v.hitl_steps || [];
            for (let s = 0; s < steps.length; s++) {
              const data = hitlResult.stepData[s];
              if (data) {
                const summary = Object.entries(data)
                  .map(([k, value]) => `${k}: ${value}`)
                  .join(", ");
                this.addAudit(execId, {
                  action: `HITL Step ${s + 1}: ${steps[s].title}`,
                  category: "hitl",
                  source: v.source || "—",
                  result: "COMPLETED",
                  details: summary,
                });
              }
            }
          }

          if (hitlResult.decision === "approve") {
            const result: ValidationResult = {
              passed: true,
              actual_value: "Human approved",
              message: "Approved by human reviewer",
              messageHe: "אושר על ידי בודק אנושי",
            };
            results[hitlIdx] = result;
            this.patchStatusAndResult(execId, hitlIdx, "pass", result);
            this.addAudit(execId, {
              action: v.name,
              actionHe: v.nameHe || v.name,
              category: "hitl",
              source: v.source || "—",
              result: "RESOLVED",
              details: "Human approved",
              detailsHe: "אושר על ידי בודק אנושי",
            });
          } else if (hitlResult.decision === "reject") {
            const result: ValidationResult = {
              passed: false,
              actual_value: "Human rejected",
              message: "Rejected by human reviewer",
              messageHe: "נדחה על ידי בודק אנושי",
            };
            results[hitlIdx] = result;
            this.patchStatusAndResult(execId, hitlIdx, "fail", result);
            this.addAudit(execId, {
              action: v.name,
              actionHe: v.nameHe || v.name,
              category: "hitl",
              source: v.source || "—",
              result: "REJECTED",
              details: "Human rejected",
              detailsHe: "נדחה על ידי בודק אנושי",
            });
          } else {
            const result: ValidationResult = {
              passed: true,
              actual_value: "Escalated",
              message: "Escalated for further review",
              messageHe: "הועבר לבדיקה נוספת",
            };
            results[hitlIdx] = result;
            this.patchStatusAndResult(execId, hitlIdx, "warning", result);
            this.addAudit(execId, {
              action: v.name,
              actionHe: v.nameHe || v.name,
              category: "hitl",
              source: v.source || "—",
              result: "ESCALATED",
              details: "Escalated for further review",
              detailsHe: "הועבר לבדיקה נוספת",
            });
          }
        }

        const anyRejected = hitlIndices.some((i) => results[i] && !results[i]!.passed);
        if (anyRejected) {
          this.update(execId, {
            outcome: { type: "blocked", message: "Process blocked — rejected by human reviewer", messageHe: "התהליך נחסם — נדחה על ידי בודק אנושי" },
            status: "REJECTED",
          });
          this.addAudit(execId, {
            action: "Outcome determination",
            actionHe: "קביעת תוצאה",
            category: "system",
            source: "—",
            result: "FAIL",
            details: "Flow terminated by human rejection",
            detailsHe: "הזרימה הופסקה עקב דחייה אנושית",
          });
          return;
        }

        this.update(execId, { status: "RUNNING" });
      }

      // Phase 3: outcome
      await delay(400);
      const finalResults = results.filter((r): r is ValidationResult => r !== null);
      const finalOutcome: Outcome = determineOutcome(validationArray, finalResults, execMemberData);

      const finalStatus =
        finalOutcome.type === "approved"
          ? "COMPLETED"
          : finalOutcome.type === "blocked"
            ? "BLOCKED"
            : finalOutcome.type === "customer_action"
              ? "AWAITING_DOCUMENTS"
              : finalOutcome.type === "tax_consent"
                ? "AWAITING_CONSENT"
                : "COMPLETED";

      const isComplex = finalOutcome.type === "tax_consent";
      const newSla = isComplex ? calculateSlaDeadline(execContract, true) : undefined;

      this.update(execId, {
        outcome: finalOutcome,
        status: finalStatus,
        ...(newSla ? { slaDeadline: newSla } : {}),
      });

      this.addAudit(execId, {
        action: "Outcome determination",
        actionHe: "קביעת תוצאה",
        category: "system",
        source: "—",
        result:
          finalOutcome.type === "approved"
            ? "SUCCESS"
            : finalOutcome.type === "blocked"
              ? "FAIL"
              : "WARNING",
        details: finalOutcome.message,
        detailsHe: finalOutcome.messageHe || finalOutcome.message,
      });
    },

    /**
     * Resolve a HITL waiting node. Handles both live runs (resolves the
     * waiting promise) and pre-generated flood scenarios (mutates state
     * directly because there is no awaiting runFlow loop).
     */
    resolveHitl(executionId: string, validationIndex: number, decision: HitlDecision, stepData?: any) {
      const resolver = hitlResolvers[executionId];
      if (resolver) {
        resolver.resolve({ decision, stepData });
        return;
      }

      // Pre-generated (flood) scenario — mutate state directly
      const idx = this.executions.findIndex((e) => e.id === executionId);
      if (idx === -1) return;
      const ex = this.executions[idx];

      const newStatuses = [...ex.validationStatuses];
      const newResults = [...(ex.validationResults || [])];
      const newAudit: AuditEntry[] = [...ex.auditEntries];
      const val = ex.validations?.[validationIndex];
      const ts = formatTime();

      if (stepData && val?.hitl_steps) {
        val.hitl_steps.forEach((step, s) => {
          const data = stepData[s];
          if (data) {
            newAudit.push({
              action: `HITL Step ${s + 1}: ${step.title}`,
              category: "hitl",
              source: val.source || "—",
              result: "COMPLETED",
              details: Object.entries(data)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", "),
              timestamp: ts,
            });
          }
        });
      }

      if (decision === "approve") {
        newStatuses[validationIndex] = "pass";
        newResults[validationIndex] = { passed: true, actual_value: "Human approved", message: "Approved by human reviewer" };
        newAudit.push({ action: val?.name || "HITL Review", category: "hitl", source: val?.source || "—", result: "RESOLVED", details: "Human approved", timestamp: ts });
      } else if (decision === "reject") {
        newStatuses[validationIndex] = "fail";
        newResults[validationIndex] = { passed: false, actual_value: "Human rejected", message: "Rejected by human reviewer" };
        newAudit.push({ action: val?.name || "HITL Review", category: "hitl", source: val?.source || "—", result: "REJECTED", details: "Human rejected", timestamp: ts });
      } else {
        newStatuses[validationIndex] = "warning";
        newResults[validationIndex] = { passed: true, actual_value: "Escalated", message: "Escalated for further review" };
        newAudit.push({ action: val?.name || "HITL Review", category: "hitl", source: val?.source || "—", result: "ESCALATED", details: "Escalated for further review", timestamp: ts });
      }

      const stillWaiting = newStatuses.some((s) => s === "hitl_waiting");
      let newStatus = ex.status;
      let newOutcome = ex.outcome;
      if (decision === "reject") {
        newStatus = "REJECTED";
        newOutcome = { type: "blocked", message: `${val?.name || "HITL Review"}: Rejected by human reviewer` };
        newAudit.push({ action: "Outcome determination", category: "system", source: "—", result: "FAIL", details: "Flow terminated by human rejection", timestamp: ts });
      } else if (!stillWaiting && !newOutcome) {
        const hasFail = newStatuses.some((s, i) => s === "fail" && ex.validations?.[i]?.severity === "blocking");
        if (hasFail) {
          newStatus = "BLOCKED";
          newOutcome = { type: "blocked", message: "Process blocked — one or more validations failed" };
        } else {
          newStatus = "COMPLETED";
          newOutcome = { type: "approved", message: "All validations passed. Process completed successfully." };
        }
        newAudit.push({
          action: "Outcome determination",
          category: "system",
          source: "—",
          result: newOutcome.type === "approved" ? "SUCCESS" : "FAIL",
          details: newOutcome.message,
          timestamp: ts,
        });
      } else if (!stillWaiting) {
        newStatus = "RUNNING";
      }

      this.executions[idx] = { ...ex, validationStatuses: newStatuses, validationResults: newResults, auditEntries: newAudit, status: newStatus, outcome: newOutcome };
    },

    approveTaxConsent(executionId: string) {
      const ex = this.byId(executionId);
      if (!ex || ex.outcome?.type !== "tax_consent") return;
      const newOutcome: Outcome = {
        ...ex.outcome,
        type: "approved",
        message: `Early ${ex.useCase === "early_redemption" ? "redemption" : "withdrawal"} approved with tax deductions. Net amount: ₪${ex.outcome.breakdown?.net?.toLocaleString()}`,
      };
      this.update(executionId, { outcome: newOutcome, status: "COMPLETED" });
      this.addAudit(executionId, {
        action: "Tax consent accepted",
        category: "system",
        source: "customer",
        result: "SUCCESS",
        details: "Customer accepted tax deductions",
      });
    },

    rejectTaxConsent(executionId: string) {
      const ex = this.byId(executionId);
      if (!ex || ex.outcome?.type !== "tax_consent") return;
      this.update(executionId, {
        outcome: { ...ex.outcome, type: "blocked", message: "Customer declined tax deductions — withdrawal cancelled." },
        status: "CANCELLED",
      });
      this.addAudit(executionId, {
        action: "Tax consent declined",
        category: "system",
        source: "customer",
        result: "CANCELLED",
        details: "Customer declined tax deductions",
      });
    },

    async flood(count: number) {
      const scenarios = generateBulkScenarios(count);
      this.floodProgress = { total: count, launched: 0 };

      for (let i = 0; i < scenarios.length; i++) {
        this.executions = [scenarios[i], ...this.executions];
        this.floodProgress = { total: count, launched: i + 1 };
        await delay(randInt(150, 400));
      }

      this.floodProgress = null;
    },

    // ── Internal helpers ──
    patchStatus(execId: string, validationIndex: number, status: string) {
      const idx = this.executions.findIndex((e) => e.id === execId);
      if (idx === -1) return;
      const ex = this.executions[idx];
      this.executions[idx] = {
        ...ex,
        validationStatuses: ex.validationStatuses.map((s, j) => (j === validationIndex ? (status as any) : s)),
      };
    },

    patchStatusAndResult(execId: string, validationIndex: number, status: string, result: ValidationResult) {
      const idx = this.executions.findIndex((e) => e.id === execId);
      if (idx === -1) return;
      const ex = this.executions[idx];
      this.executions[idx] = {
        ...ex,
        validationStatuses: ex.validationStatuses.map((s, j) => (j === validationIndex ? (status as any) : s)),
        validationResults: ex.validationResults.map((r, j) => (j === validationIndex ? result : r)),
      };
    },
  },
});
