<template>
  <div
    v-if="entries && entries.length > 0"
    class="bg-bg-card mt-4 overflow-hidden rounded-xl border border-[var(--color-border)]"
  >
    <button
      class="hover:bg-bg-card-hover flex w-full items-center justify-between p-4 transition-colors"
      @click="expanded = !expanded"
    >
      <h3 class="text-accent text-sm font-semibold tracking-wider uppercase">
        {{ t("audit.title") }}
      </h3>
      <span class="text-text-muted text-xs">
        {{ expanded ? "▲" : "▼" }} {{ entries.length }} {{ t("audit.entries") }}
      </span>
    </button>

    <div
      v-if="expanded"
      class="px-4 pb-4"
    >
      <div
        v-if="processInfo"
        class="bg-bg-primary mb-4 grid grid-cols-2 gap-3 rounded-lg p-3 md:grid-cols-5"
      >
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("audit.processId") }}</span>
          <p class="text-accent font-mono text-xs">{{ processInfo.processId }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("audit.member") }}</span>
          <p class="text-text-primary text-xs">{{ processInfo.memberId }} — {{ processInfo.memberName }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("audit.fundType") }}</span>
          <p class="text-text-primary text-xs">{{ processInfo.fundType }}</p>
        </div>
        <div v-if="processInfo.useCase">
          <span class="text-text-muted text-[10px] uppercase">{{ t("audit.action") }}</span>
          <p class="text-text-primary text-xs">{{ processInfo.useCase }}</p>
        </div>
        <div>
          <span class="text-text-muted text-[10px] uppercase">{{ t("audit.status") }}</span>
          <p :class="['text-xs font-semibold', (processInfo.status && RESULT_STYLES[processInfo.status]) || 'text-text-primary']">
            {{ processInfo.status }}
          </p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-text-muted border-b border-[var(--color-border)] text-[10px] uppercase">
              <th class="w-8 px-2 py-2 text-start">#</th>
              <th class="w-20 px-2 py-2 text-start">{{ t("audit.time") }}</th>
              <th class="px-2 py-2 text-start">{{ t("audit.action") }}</th>
              <th class="w-24 px-2 py-2 text-start">{{ t("audit.category") }}</th>
              <th class="w-28 px-2 py-2 text-start">{{ t("audit.source") }}</th>
              <th class="w-20 px-2 py-2 text-start">{{ t("audit.result") }}</th>
              <th class="px-2 py-2 text-start">{{ t("audit.details") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, i) in entries"
              :key="i"
              class="hover:bg-bg-primary/50 border-b border-[var(--color-border)]/50"
            >
              <td class="text-text-muted px-2 py-2">{{ i + 1 }}</td>
              <td class="text-text-muted px-2 py-2 font-mono">{{ entry.timestamp }}</td>
              <td class="text-text-primary px-2 py-2">{{ entry.action }}</td>
              <td class="text-text-muted px-2 py-2">{{ entry.category }}</td>
              <td class="text-text-muted px-2 py-2 font-mono">{{ entry.source || "—" }}</td>
              <td :class="['px-2 py-2 font-semibold', RESULT_STYLES[entry.result] || 'text-text-muted']">
                {{ entry.result }}
              </td>
              <td class="text-text-muted max-w-[200px] truncate px-2 py-2">{{ entry.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { AuditEntry } from "@/domain/ClalPOC/domain/models/Audit";

defineProps<{
  entries: AuditEntry[];
  processInfo?: {
    processId: string;
    memberId?: string;
    memberName?: string;
    fundType?: string;
    useCase?: string;
    status?: string;
  };
}>();

const { t } = useI18n();
const expanded = ref(true);

const RESULT_STYLES: Record<string, string> = {
  SUCCESS: "text-success",
  COMPLETED: "text-success",
  PASS: "text-success",
  FAIL: "text-error",
  BLOCKED: "text-error",
  REJECTED: "text-error",
  WARNING: "text-warning",
  AWAITING_DOCUMENTS: "text-warning",
  AWAITING_CONSENT: "text-warning",
  RUNNING: "text-accent",
  INFO: "text-accent",
  PENDING: "text-text-muted",
};
</script>
