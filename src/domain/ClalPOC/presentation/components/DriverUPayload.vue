<template>
  <div v-if="!payload">
    <div class="flex flex-col items-center justify-center py-16">
      <div class="bg-bg-card mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)]">
        <span class="text-text-muted text-lg">📦</span>
      </div>
      <p class="text-text-muted text-sm">{{ t("driverU.empty") }}</p>
      <p class="text-text-muted mt-1 text-xs">{{ t("driverU.emptyDesc") }}</p>
    </div>
  </div>
  <div v-else>
    <div class="mb-3 flex items-center justify-between">
      <p class="text-text-muted text-xs">{{ t("driverU.desc") }}</p>
      <button
        class="text-accent hover:text-accent/80 flex items-center gap-1 rounded border border-[var(--color-border)] px-2 py-1 text-[10px] transition-colors"
        @click="copy"
      >
        📋 {{ t("driverU.copy") }}
      </button>
    </div>
    <pre
      class="text-accent/80 bg-bg-primary max-h-[60vh] overflow-x-auto overflow-y-auto rounded-lg border border-[var(--color-border)] p-4 font-mono text-[11px] break-all whitespace-pre-wrap"
    >{{ json }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { Execution } from "@/domain/ClalPOC/domain/models/Execution";

const props = defineProps<{ execution: Execution | null | undefined }>();

const { t } = useI18n();

const payload = computed(() => {
  if (!props.execution) return null;
  const ex = props.execution;
  const md = ex.memberData || ({} as any);
  const validations = ex.validations || [];
  const statuses = ex.validationStatuses || [];
  const results = ex.validationResults || [];
  return {
    process_id: ex.processId,
    timestamp: ex.timestamp,
    status: ex.status,
    member: {
      id: md.member_id,
      name: md.member_name,
      name_he: md.member_name_he,
      birth_date: md.birth_date,
      phone: md.phone,
      email: md.email,
      account_number: md.account_number,
    },
    request: {
      fund_type: md.fund_type,
      use_case: md.use_case,
      amount: md.withdrawal_amount || md.transfer_amount || md.redemption_amount || null,
      balance: md.balance || md.total_balance || null,
    },
    validations: validations.map((v, i) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      severity: v.severity,
      status: statuses[i] || "pending",
      result: results[i] ? { passed: results[i]!.passed, value: results[i]!.actual_value } : null,
    })),
    outcome: ex.outcome
      ? {
          type: ex.outcome.type,
          message: ex.outcome.message,
          ...(ex.outcome.breakdown ? { breakdown: ex.outcome.breakdown } : {}),
        }
      : null,
    sla_deadline: ex.slaDeadline,
    priority: ex.priority,
  };
});

const json = computed(() => (payload.value ? JSON.stringify(payload.value, null, 2) : ""));

function copy() {
  if (json.value) navigator.clipboard.writeText(json.value).catch(() => undefined);
}
</script>
