<template>
  <div
    v-if="!contract"
    class="text-text-muted flex items-center justify-center py-16 text-sm italic"
  >
    {{ t("dataTabs.generateToSeeContract") }}
  </div>

  <div
    v-else
    class="animate-fade-in-up space-y-3"
  >
    <!-- Contract header -->
    <div class="bg-bg-primary rounded-lg border border-[var(--color-border)] p-3">
      <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <span class="text-text-muted">{{ t("dataTabs.contractId") }}</span>
          <span class="text-accent ms-1 font-mono">{{ contract.contract_id }}</span>
        </div>
        <div>
          <span class="text-text-muted">{{ t("dataTabs.customer") }}</span>
          <span class="text-text-primary ms-1">{{ contract.customer_name }}</span>
        </div>
        <div>
          <span class="text-text-muted">{{ t("dataTabs.insuranceCompany") }}</span>
          <span class="text-text-primary ms-1">{{ contract.insurance_company }}</span>
        </div>
        <div>
          <span class="text-text-muted">{{ t("dataTabs.fundTypeLabel") }}</span>
          <span class="text-text-primary ms-1">{{ contract.fund_type }}</span>
        </div>
        <div>
          <span class="text-text-muted">{{ t("dataTabs.effective") }}</span>
          <span class="text-text-primary ms-1">{{ contract.effective_date }}</span>
        </div>
        <div>
          <span class="text-text-muted">{{ t("dataTabs.expires") }}</span>
          <span class="text-text-primary ms-1">{{ contract.expiry_date }}</span>
        </div>
      </div>
    </div>

    <h4 class="text-text-muted text-xs tracking-wider uppercase">
      {{ t("dataTabs.contractTerms") }} ({{ contract.clauses.length }} {{ t("dataTabs.clauses") }})
    </h4>

    <div
      v-for="(clause, i) in contract.clauses"
      :key="i"
      class="bg-bg-primary rounded-lg border border-[var(--color-border)] p-4"
    >
      <div class="mb-2 flex items-start justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <input
            :value="clause.clause_id"
            class="text-accent w-20 rounded border border-transparent bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-xs focus:border-[var(--color-accent)] focus:outline-none"
            @input="updateClause(i, 'clause_id', ($event.target as HTMLInputElement).value)"
          />
          <select
            :value="clause.category || 'processing'"
            :class="[
              'focus:ring-accent cursor-pointer rounded border-0 px-1.5 py-0.5 text-[10px] focus:ring-1 focus:outline-none',
              CATEGORY_COLORS[clause.category] || 'bg-bg-card text-text-muted',
            ]"
            @change="updateClause(i, 'category', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="cat in CATEGORIES"
              :key="cat"
              :value="cat"
            >
              {{ t(`cat.${cat}`, cat) }}
            </option>
          </select>
          <select
            :value="clause.consequence || 'block'"
            :class="[
              'focus:ring-accent cursor-pointer rounded border-0 px-1.5 py-0.5 text-[10px] focus:ring-1 focus:outline-none',
              CONSEQUENCE_COLORS[clause.consequence || ''] || 'bg-warning/20 text-warning',
            ]"
            @change="updateClause(i, 'consequence', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="con in CONSEQUENCES"
              :key="con"
              :value="con"
            >
              {{ t(`consequence.${con}`, con) }}
            </option>
          </select>
        </div>
        <button
          class="text-text-muted hover:text-error text-xs"
          @click="removeClause(i)"
        >
          ✕
        </button>
      </div>
      <input
        :value="clause.title || ''"
        :placeholder="t('dataTabs.newClauseTitle')"
        class="text-text-primary mb-1 w-full border-b border-transparent bg-transparent text-sm font-semibold focus:border-[var(--color-accent)] focus:outline-none"
        @input="updateClause(i, 'title', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        :value="clause.description || ''"
        :placeholder="t('dataTabs.newClauseDesc')"
        rows="2"
        class="text-text-muted mt-1 w-full resize-none border-b border-transparent bg-transparent text-xs focus:border-[var(--color-accent)] focus:outline-none"
        @input="updateClause(i, 'description', ($event.target as HTMLTextAreaElement).value)"
      />

      <div
        v-if="clause.conditions && clause.conditions.length > 0"
        class="mt-2 space-y-1"
      >
        <div
          v-for="(c, j) in clause.conditions"
          :key="j"
          class="flex items-center gap-1 font-mono text-[10px]"
        >
          <input
            :value="c.field"
            placeholder="field"
            class="bg-bg-card text-text-muted w-36 rounded border border-transparent px-1.5 py-0.5 focus:border-[var(--color-accent)] focus:outline-none"
            @input="updateCondition(i, j, 'field', ($event.target as HTMLInputElement).value)"
          />
          <select
            :value="c.operator"
            class="bg-bg-card text-accent cursor-pointer rounded border border-transparent px-1 py-0.5 focus:border-[var(--color-accent)] focus:outline-none"
            @change="updateCondition(i, j, 'operator', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="op in OPERATORS"
              :key="op"
              :value="op"
            >
              {{ op }}
            </option>
          </select>
          <input
            :value="formatConditionValue(c.value)"
            placeholder="value"
            class="bg-bg-card text-text-muted w-24 rounded border border-transparent px-1.5 py-0.5 focus:border-[var(--color-accent)] focus:outline-none"
            @input="updateCondition(i, j, 'value', ($event.target as HTMLInputElement).value)"
          />
          <button
            class="text-text-muted hover:text-error px-1"
            @click="removeCondition(i, j)"
          >
            ✕
          </button>
        </div>
      </div>
      <button
        class="text-accent mt-1.5 flex items-center gap-1 text-[10px] transition-colors hover:opacity-80"
        @click="addCondition(i)"
      >
        <span>+</span> {{ t("dataTabs.addCondition") }}
      </button>
    </div>

    <button
      class="text-accent flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-accent)]/40 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--color-accent)]/5"
      @click="addClause"
    >
      <span class="text-sm">+</span> {{ t("dataTabs.addClause") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { ClauseCondition, Contract, ContractClause } from "@/domain/ClalPOC/domain/models/Contract";

const props = defineProps<{
  contract: Contract | null;
}>();

const emit = defineEmits<{
  (event: "update:contract", contract: Contract): void;
}>();

const { t } = useI18n();

const CATEGORIES = ["eligibility", "financial", "processing", "withdrawal", "sla", "penalties"] as const;
const CONSEQUENCES = ["block", "require_approval", "require_hitl", "apply_fee", "notify"] as const;
const OPERATORS = ["==", "!=", ">=", "<=", ">", "<"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  eligibility: "bg-cyan-500/20 text-cyan-300",
  financial: "bg-emerald-500/20 text-emerald-300",
  processing: "bg-blue-500/20 text-blue-300",
  withdrawal: "bg-amber-500/20 text-amber-300",
  sla: "bg-purple-500/20 text-purple-300",
  penalties: "bg-red-500/20 text-red-300",
};

const CONSEQUENCE_COLORS: Record<string, string> = {
  block: "bg-error/20 text-error",
  require_approval: "bg-warning/20 text-warning",
  require_hitl: "bg-purple-500/20 text-purple-400",
  apply_fee: "bg-amber-500/20 text-amber-300",
  notify: "bg-blue-500/20 text-blue-400",
};

function emitContract(next: Contract) {
  emit("update:contract", next);
}

function updateClause(index: number, field: keyof ContractClause | string, value: any) {
  if (!props.contract) return;
  const clauses = props.contract.clauses.map((c, i) => (i === index ? { ...c, [field]: value } : c));
  emitContract({ ...props.contract, clauses });
}

function parseConditionValue(currentValue: any, raw: string): any {
  if (typeof currentValue === "boolean") return raw === "true";
  if (typeof currentValue === "number") return raw === "" ? 0 : Number(raw);
  return raw;
}

function formatConditionValue(value: any): string {
  if (typeof value === "boolean") return String(value);
  if (value === undefined || value === null) return "";
  return String(value);
}

function updateCondition(clauseIndex: number, condIndex: number, key: keyof ClauseCondition | string, value: any) {
  if (!props.contract) return;
  const clauses = props.contract.clauses.map((c, i) => {
    if (i !== clauseIndex) return c;
    const conds = (c.conditions || []).map((cond, j) => {
      if (j !== condIndex) return cond;
      const next = { ...cond, [key]: key === "value" ? parseConditionValue(cond.value, value) : value };
      return next;
    });
    return { ...c, conditions: conds };
  });
  emitContract({ ...props.contract, clauses });
}

function removeCondition(clauseIndex: number, condIndex: number) {
  if (!props.contract) return;
  const clauses = props.contract.clauses.map((c, i) => {
    if (i !== clauseIndex) return c;
    return { ...c, conditions: (c.conditions || []).filter((_, j) => j !== condIndex) };
  });
  emitContract({ ...props.contract, clauses });
}

function addCondition(clauseIndex: number) {
  if (!props.contract) return;
  const clauses = props.contract.clauses.map((c, i) => {
    if (i !== clauseIndex) return c;
    return { ...c, conditions: [...(c.conditions || []), { field: "", operator: "==", value: "" }] };
  });
  emitContract({ ...props.contract, clauses });
}

function removeClause(index: number) {
  if (!props.contract) return;
  const clauses = props.contract.clauses.filter((_, i) => i !== index);
  emitContract({ ...props.contract, clauses });
}

function addClause() {
  if (!props.contract) return;
  const nextNum = props.contract.clauses.length + 1;
  const newClause: ContractClause = {
    clause_id: `CL-NEW-${nextNum}`,
    category: "processing",
    title: t("dataTabs.newClauseTitle"),
    titleHe: t("dataTabs.newClauseTitle"),
    description: "",
    descriptionHe: "",
    conditions: [],
    consequence: "block",
  };
  emitContract({ ...props.contract, clauses: [...props.contract.clauses, newClause] });
}
</script>
