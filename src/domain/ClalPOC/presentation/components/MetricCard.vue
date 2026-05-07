<template>
  <div class="bg-bg-card rounded-xl border border-[var(--color-border)] p-4">
    <span class="text-text-muted text-[10px] tracking-wider uppercase">{{ label }}</span>
    <p :class="['mt-1 text-2xl font-bold', color || 'text-text-primary']">{{ value }}</p>
    <p
      v-if="sub"
      class="text-text-muted mt-0.5 text-[11px]"
    >
      {{ sub }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}>();
</script>
