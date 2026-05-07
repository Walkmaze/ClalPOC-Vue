<template>
  <div class="mb-4 space-y-2">
    <div
      v-for="(msg, i) in messages"
      :key="i"
      class="animate-fade-in-up flex items-center gap-2 text-sm"
      :style="{ animationDelay: `${i * 100}ms` }"
    >
      <span>{{ msg.icon }}</span>
      <span :class="msg.done ? 'text-text-primary' : 'text-text-muted'">{{ msg.text }}</span>
      <span
        v-if="!msg.done"
        class="border-accent inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisMessage } from "@/domain/ClalPOC/domain/models/Audit";

defineProps<{
  messages: AnalysisMessage[];
}>();
</script>
