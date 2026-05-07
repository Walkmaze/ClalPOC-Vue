<template>
  <div v-if="!log">
    <div class="flex flex-col items-center justify-center py-16">
      <div class="bg-bg-card mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)]">
        <span class="text-text-muted text-lg">💬</span>
      </div>
      <p class="text-text-muted text-sm">{{ t("claudeLog.empty") }}</p>
      <p class="text-text-muted mt-1 text-xs">{{ t("claudeLog.emptyDesc") }}</p>
    </div>
  </div>
  <div v-else>
    <div class="mb-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
      <div>
        <span class="text-text-muted block text-[10px] uppercase">{{ t("claudeLog.model") }}</span>
        <span class="text-text-primary font-mono">{{ log.model }}</span>
      </div>
      <div>
        <span class="text-text-muted block text-[10px] uppercase">{{ t("claudeLog.requestedAt") }}</span>
        <span class="text-text-primary font-mono">{{ formatTimestamp(log.requestedAt) }}</span>
      </div>
      <div>
        <span class="text-text-muted block text-[10px] uppercase">{{ t("claudeLog.respondedAt") }}</span>
        <span class="text-text-primary font-mono">{{ formatTimestamp(log.respondedAt) }}</span>
      </div>
      <div>
        <span class="text-text-muted block text-[10px] uppercase">{{ t("claudeLog.tokens") }}</span>
        <span class="text-text-primary font-mono">{{ tokenSummary }}</span>
      </div>
    </div>

    <ClaudeLogSection
      :title="t('claudeLog.system')"
      :value="log.system"
    />
    <ClaudeLogSection
      :title="t('claudeLog.user')"
      :value="log.userMessage"
    />
    <ClaudeLogSection
      :title="log.error ? t('claudeLog.errorResponse') : t('claudeLog.response')"
      :value="log.rawResponse"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { ClaudeLog } from "@/domain/ClalPOC/domain/models/Execution";
import ClaudeLogSection from "@/domain/ClalPOC/presentation/components/ClaudeLogSection.vue";
import { formatTimestamp } from "@/shared/utils/formatters";

const props = defineProps<{
  log?: ClaudeLog;
}>();

const { t } = useI18n();

const tokenSummary = computed(() => {
  if (!props.log?.usage) return "—";
  return `${props.log.usage.input_tokens ?? "?"} → ${props.log.usage.output_tokens ?? "?"}`;
});
</script>
