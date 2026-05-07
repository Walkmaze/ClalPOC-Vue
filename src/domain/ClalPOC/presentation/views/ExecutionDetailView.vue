<template>
  <div v-if="!execution">
    <div class="text-text-muted py-16 text-center text-sm">Execution not found.</div>
  </div>
  <div v-else>
    <!-- Back button -->
    <div class="mb-5 flex items-center gap-4">
      <button
        class="text-text-muted hover:text-accent flex items-center gap-1 text-sm transition-colors"
        @click="router.push({ name: 'executions' })"
      >
        ← {{ t("detail.back") }}
      </button>
    </div>

    <!-- Process info bar -->
    <div class="bg-bg-card mb-4 rounded-xl border border-[var(--color-border)] p-4">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.processId") }}</span>
          <p class="text-accent font-mono text-sm">{{ execution.processId }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.member") }}</span>
          <p class="text-text-primary text-sm">{{ execution.memberName }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.fundType") }}</span>
          <p class="text-text-primary text-sm">{{ execution.fundTypeLabel }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.action") }}</span>
          <p class="text-text-primary text-sm">{{ execution.useCaseLabel }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.priority") }}</span>
          <p
            class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="priorityBadgeClass(execution.priority)"
          >
            {{ t(`priority.${execution.priority}`) }}
          </p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.slaDeadline") }}</span>
          <p
            class="font-mono text-xs"
            :class="sla.color"
          >
            {{ sla.text }}
          </p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("detail.status") }}</span>
          <p
            class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="statusBadgeClass(execution.status)"
          >
            {{ t(`status.${execution.status}`) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="execution.error"
      class="bg-error/10 border-error text-error mb-4 rounded-lg border p-4 text-sm"
    >
      {{ execution.error }}
    </div>

    <!-- Detail tabs -->
    <div class="mb-4 flex items-center gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          activeTab === tab.id
            ? 'bg-accent text-bg-primary'
            : 'bg-bg-card text-text-muted hover:text-text-primary border border-[var(--color-border)]'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Flow tab -->
    <div v-if="activeTab === 'flow'">
      <div class="flex gap-0">
        <div
          class="min-w-0 flex-1"
          :class="{ 'me-4': showHitlPanel }"
        >
          <FlowExecution
            :analysis-messages="execution.analysisMessages"
            :validations="execution.validations"
            :validation-statuses="execution.validationStatuses"
            :validation-results="execution.validationResults"
            :outcome="execution.outcome"
            :use-case="execution.useCase"
            :member-data="execution.memberData"
            @hitl-click="onHitlCardClick"
            @approve="executions.approveTaxConsent(execution.id)"
            @reject="executions.rejectTaxConsent(execution.id)"
          />

          <AuditTrail
            :entries="execution.auditEntries"
            :process-info="{
              processId: execution.processId,
              memberId: execution.memberData?.member_id,
              memberName: execution.memberName,
              fundType: execution.fundTypeLabel,
              useCase: execution.useCaseLabel,
              status: execution.status,
            }"
          />
        </div>

        <HitlPanel
          v-if="showHitlPanel"
          :validation="hitlValidation"
          :validation-index="hitlIndex"
          @resolve="onHitlResolve"
          @close="hitlIndex = null"
        />
      </div>
    </div>

    <!-- Payload tab -->
    <div
      v-if="activeTab === 'payload'"
      class="bg-bg-card rounded-xl border border-[var(--color-border)] p-5"
    >
      <h3 class="text-accent mb-4 text-sm font-semibold tracking-wider uppercase">
        {{ t("detail.driverUPayload") }} — {{ execution.processId }}
      </h3>
      <DriverUPayload :execution="execution" />
    </div>

    <!-- Claude log tab -->
    <div
      v-if="activeTab === 'claudeLog'"
      class="bg-bg-card rounded-xl border border-[var(--color-border)] p-5"
    >
      <h3 class="text-accent mb-4 text-sm font-semibold tracking-wider uppercase">
        {{ t("detail.claudeLog") }} — {{ execution.processId }}
      </h3>
      <ClaudeLogPanel :log="execution.claudeLog" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import type { HitlDecision } from "@/domain/ClalPOC/domain/models/Validation";
import { useExecutionsStore } from "@/domain/ClalPOC/infrastructure/stores/executions.store";
import AuditTrail from "@/domain/ClalPOC/presentation/components/AuditTrail.vue";
import ClaudeLogPanel from "@/domain/ClalPOC/presentation/components/ClaudeLogPanel.vue";
import DriverUPayload from "@/domain/ClalPOC/presentation/components/DriverUPayload.vue";
import HitlPanel from "@/domain/ClalPOC/presentation/components/HitlPanel.vue";
import FlowExecution from "@/domain/ClalPOC/presentation/components/FlowExecution.vue";
import { formatSlaDeadline } from "@/shared/utils/formatters";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const executions = useExecutionsStore();

const execution = computed(() => executions.byId(String(route.params.id)));

type DetailTab = "flow" | "payload" | "claudeLog";
const activeTab = ref<DetailTab>("flow");
const tabs = computed(() => [
  { id: "flow" as const, label: t("detail.flowExecution") },
  { id: "payload" as const, label: `📦 ${t("detail.driverUPayload")}` },
  { id: "claudeLog" as const, label: `💬 ${t("detail.claudeLog")}` },
]);

const hitlIndex = ref<number | null>(null);
const hitlValidation = computed(() => {
  if (hitlIndex.value === null || !execution.value?.validations) return null;
  return execution.value.validations[hitlIndex.value] ?? null;
});
const showHitlPanel = computed(() => hitlIndex.value !== null && hitlValidation.value !== null);

const sla = computed(() => formatSlaDeadline(execution.value?.slaDeadline));

function onHitlCardClick(validationIndex: number) {
  if (execution.value?.validationStatuses?.[validationIndex] === "hitl_waiting") {
    hitlIndex.value = validationIndex;
  }
}

function onHitlResolve(validationIndex: number, decision: HitlDecision, stepData: Record<number, Record<string, any>>) {
  if (!execution.value) return;
  hitlIndex.value = null;
  executions.resolveHitl(execution.value.id, validationIndex, decision, stepData);
}

function statusBadgeClass(status: string): string {
  if (status === "RUNNING") return "bg-accent/20 text-accent";
  if (status === "COMPLETED") return "bg-success/20 text-success";
  if (status === "BLOCKED" || status === "REJECTED" || status === "ERROR") return "bg-error/20 text-error";
  if (status === "PENDING_APPROVAL" || status === "AWAITING_DOCUMENTS" || status === "AWAITING_CONSENT") return "bg-warning/20 text-warning";
  return "text-text-muted";
}

function priorityBadgeClass(priority: string): string {
  if (priority === "High") return "bg-error/20 text-error";
  if (priority === "Medium") return "bg-warning/20 text-warning";
  return "bg-success/20 text-success";
}
</script>
