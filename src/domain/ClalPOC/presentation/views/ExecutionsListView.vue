<template>
  <div v-if="executions.executions.length === 0">
    <div class="flex flex-col items-center justify-center py-24">
      <div class="bg-bg-card mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border)]">
        <span class="text-text-muted text-2xl">📄</span>
      </div>
      <h3 class="text-text-primary mb-2 text-lg font-semibold">{{ t("executions.emptyTitle") }}</h3>
      <p class="text-text-muted mb-4 text-sm">{{ t("executions.emptyText") }}</p>
      <div class="flex items-center gap-3">
        <button
          class="text-accent text-sm transition-colors hover:opacity-80"
          @click="router.push({ name: 'scenario-builder' })"
        >
          {{ t("executions.emptyGoToBuilder") }} →
        </button>
        <button
          class="bg-warning text-bg-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-warning/80"
          @click="executions.flood(10)"
        >
          🚀 {{ t("executions.emptyFlood") }}
        </button>
      </div>
    </div>
  </div>

  <div v-else>
    <!-- Stat cards -->
    <div class="mb-5 grid grid-cols-5 gap-3">
      <StatCard
        :label="t('executions.total')"
        :value="stats.total"
        color="text-text-primary"
        bg="bg-bg-card"
        :active="!statusFilter"
        @click="statusFilter = ''"
      />
      <StatCard
        :label="t('executions.success')"
        :value="stats.success"
        color="text-success"
        bg="bg-success/5"
        dot="bg-success"
        :active="statusFilter === 'success'"
        @click="statusFilter = statusFilter === 'success' ? '' : 'success'"
      />
      <StatCard
        :label="t('executions.failed')"
        :value="stats.failed"
        color="text-error"
        bg="bg-error/5"
        dot="bg-error"
        :active="statusFilter === 'failed'"
        @click="statusFilter = statusFilter === 'failed' ? '' : 'failed'"
      />
      <StatCard
        :label="t('executions.running')"
        :value="stats.running"
        color="text-blue-400"
        bg="bg-blue-500/5"
        dot="bg-blue-400"
        pulse
        :active="statusFilter === 'running'"
        @click="statusFilter = statusFilter === 'running' ? '' : 'running'"
      />
      <StatCard
        :label="t('executions.needsHitl')"
        :value="stats.hitl"
        color="text-warning"
        bg="bg-warning/5"
        dot="bg-warning"
        :active="statusFilter === 'hitl'"
        @click="statusFilter = statusFilter === 'hitl' ? '' : 'hitl'"
      />
    </div>

    <!-- Header bar -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-text-primary text-lg font-bold">{{ t("executions.title") }}</h2>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
          :class="
            showFilters || hasActiveFilters
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border bg-bg-card text-text-muted hover:text-text-primary'
          "
          @click="showFilters = !showFilters"
        >
          🎛 {{ t("executions.filter") }}
        </button>
        <input
          v-model="search"
          type="text"
          :placeholder="t('executions.search')"
          class="bg-bg-card text-text-primary w-52 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>
    </div>

    <!-- Filter bar -->
    <div
      v-if="showFilters"
      class="bg-bg-card mb-4 flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3"
    >
      <select
        v-model="statusFilter"
        class="bg-bg-primary text-text-primary rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
      >
        <option value="">{{ t("executions.allStatuses") }}</option>
        <option value="running">{{ t("executions.running") }}</option>
        <option value="success">{{ t("executions.success") }}</option>
        <option value="failed">{{ t("executions.failed") }}</option>
        <option value="hitl">{{ t("executions.needsHitl") }}</option>
        <option value="awaiting">{{ t("status.AWAITING_CUSTOMER") }}</option>
        <option value="cancelled">{{ t("status.CANCELLED") }}</option>
      </select>
      <select
        v-model="priorityFilter"
        class="bg-bg-primary text-text-primary rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
      >
        <option value="">{{ t("executions.allPriorities") }}</option>
        <option value="High">{{ t("priority.High") }}</option>
        <option value="Medium">{{ t("priority.Medium") }}</option>
        <option value="Low">{{ t("priority.Low") }}</option>
      </select>
      <select
        v-model="fundTypeFilter"
        class="bg-bg-primary text-text-primary rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
      >
        <option value="">{{ t("executions.allFundTypes") }}</option>
        <option
          v-for="ft in fundTypes"
          :key="ft"
          :value="ft"
        >
          {{ ft }}
        </option>
      </select>
      <button
        v-if="hasActiveFilters"
        class="text-text-muted hover:text-error ms-auto text-[10px] transition-colors"
        @click="clearFilters"
      >
        {{ t("executions.clearAll") }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-bg-card overflow-hidden rounded-xl border border-[var(--color-border)]">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-text-muted border-b border-[var(--color-border)] text-[10px] uppercase">
            <th class="px-4 py-3 text-start">{{ t("executions.processId") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.member") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.fundType") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.status") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.priority") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.sla") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.launched") }}</th>
            <th class="px-4 py-3 text-start">{{ t("executions.action") }}</th>
            <th class="w-10 px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="exec in filtered"
            :key="exec.id"
            class="hover:bg-bg-primary/50 cursor-pointer border-b border-[var(--color-border)]/50 transition-colors"
            :class="isHitlRow(exec) ? 'border-s-warning border-s-2' : ''"
            @click="router.push({ name: 'execution-detail', params: { id: exec.id } })"
          >
            <td class="text-accent px-4 py-3 font-mono text-xs">{{ exec.processId }}</td>
            <td class="text-text-primary px-4 py-3">{{ exec.memberName }}</td>
            <td class="text-text-muted px-4 py-3 text-xs">{{ exec.fundTypeLabel }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="statusBadgeClass(exec.status)"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="statusDotClass(exec.status)"
                />
                {{ t(`status.${exec.status}`) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="priorityBadgeClass(exec.priority)"
              >
                {{ t(`priority.${exec.priority}`) }}
              </span>
            </td>
            <td
              class="px-4 py-3 font-mono text-xs"
              :class="formatSlaRemaining(exec.slaDeadline, exec.contract, t).color"
            >
              {{ formatSlaRemaining(exec.slaDeadline, exec.contract, t).text }}
            </td>
            <td class="text-text-muted px-4 py-3 text-xs">{{ formatRelativeTime(exec.timestamp, t) }}</td>
            <td class="text-text-muted px-4 py-3 text-xs">{{ exec.useCaseLabel }}</td>
            <td class="text-text-muted hover:text-accent px-3 py-3 transition-colors">→</td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="filtered.length === 0 && executions.executions.length > 0"
        class="text-text-muted py-8 text-center text-sm"
      >
        {{ t("executions.noMatch") }}
        <button
          class="text-accent ms-2 hover:underline"
          @click="clearFilters"
        >
          {{ t("executions.clearFilters") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { Execution } from "@/domain/ClalPOC/domain/models/Execution";
import { useExecutionsStore } from "@/domain/ClalPOC/infrastructure/stores/executions.store";
import StatCard from "@/domain/ClalPOC/presentation/components/StatCard.vue";
import { formatRelativeTime, formatSlaRemaining } from "@/shared/utils/formatters";

const { t } = useI18n();
const router = useRouter();
const executions = useExecutionsStore();

const search = ref("");
const statusFilter = ref("");
const priorityFilter = ref("");
const fundTypeFilter = ref("");
const showFilters = ref(false);

function getStatusGroup(status: string): string {
  if (status === "RUNNING") return "running";
  if (status === "COMPLETED") return "success";
  if (status === "BLOCKED" || status === "REJECTED" || status === "ERROR") return "failed";
  if (status === "PENDING_APPROVAL") return "hitl";
  if (status === "AWAITING_DOCUMENTS" || status === "AWAITING_CONSENT") return "awaiting";
  if (status === "CANCELLED") return "cancelled";
  return "other";
}

const stats = computed(() => {
  const s = { total: executions.executions.length, success: 0, failed: 0, running: 0, hitl: 0 };
  for (const e of executions.executions) {
    const g = getStatusGroup(e.status);
    if (g === "success") s.success++;
    else if (g === "failed") s.failed++;
    else if (g === "running") s.running++;
    else if (g === "hitl") s.hitl++;
  }
  return s;
});

const fundTypes = computed(() => {
  const set = new Set(executions.executions.map((e) => e.fundTypeLabel));
  return [...set].sort();
});

const hasActiveFilters = computed(
  () => !!search.value || !!statusFilter.value || !!priorityFilter.value || !!fundTypeFilter.value
);

const filtered = computed(() => {
  let list = [...executions.executions];
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter((e) => e.processId.toLowerCase().includes(q) || e.memberName.toLowerCase().includes(q));
  }
  if (statusFilter.value) list = list.filter((e) => getStatusGroup(e.status) === statusFilter.value);
  if (priorityFilter.value) list = list.filter((e) => e.priority === priorityFilter.value);
  if (fundTypeFilter.value) list = list.filter((e) => e.fundTypeLabel === fundTypeFilter.value);
  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return list;
});

function clearFilters() {
  search.value = "";
  statusFilter.value = "";
  priorityFilter.value = "";
  fundTypeFilter.value = "";
}

function isHitlRow(exec: Execution): boolean {
  if (exec.status === "PENDING_APPROVAL") return true;
  return exec.validationStatuses?.some((s) => s === "hitl_waiting") ?? false;
}

function statusBadgeClass(status: string): string {
  if (status === "RUNNING") return "bg-blue-500/20 text-blue-400";
  if (status === "COMPLETED") return "bg-success/20 text-success";
  if (status === "BLOCKED" || status === "REJECTED" || status === "ERROR") return "bg-error/20 text-error";
  if (status === "PENDING_APPROVAL") return "bg-warning/20 text-warning";
  if (status === "AWAITING_DOCUMENTS" || status === "AWAITING_CONSENT") return "bg-purple-500/20 text-purple-400";
  return "bg-text-muted/20 text-text-muted";
}

function statusDotClass(status: string): string {
  if (status === "RUNNING") return "bg-blue-400";
  if (status === "COMPLETED") return "bg-success";
  if (status === "BLOCKED" || status === "REJECTED" || status === "ERROR") return "bg-error";
  if (status === "PENDING_APPROVAL") return "bg-warning";
  if (status === "AWAITING_DOCUMENTS" || status === "AWAITING_CONSENT") return "bg-purple-400";
  return "bg-text-muted";
}

function priorityBadgeClass(priority: string): string {
  if (priority === "High") return "bg-error/20 text-error";
  if (priority === "Medium") return "bg-warning/20 text-warning";
  return "bg-success/20 text-success";
}
</script>
