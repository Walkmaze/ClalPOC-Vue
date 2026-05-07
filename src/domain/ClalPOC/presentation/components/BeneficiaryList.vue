<template>
  <div
    v-if="beneficiaries && beneficiaries.length > 0"
    class="col-span-2"
  >
    <label class="text-text-muted mb-2 block text-xs">{{ label }}</label>
    <div class="space-y-1.5">
      <div
        v-for="(b, i) in beneficiaries"
        :key="i"
        class="bg-bg-primary flex items-center justify-between rounded border border-[var(--color-border)]/50 px-3 py-2 text-xs"
      >
        <span class="text-text-primary">
          {{ b.name }}
          <span class="text-text-muted">({{ b.relation }})</span>
        </span>
        <span class="text-accent font-mono">{{ b.percentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Beneficiary } from "@/domain/ClalPOC/domain/models/Member";

defineProps<{
  label: string;
  beneficiaries?: Beneficiary[];
}>();
</script>
