<template>
  <div
    class="bg-bg-card rounded-xl border border-[var(--color-border)] p-4"
    :class="fullWidth ? 'col-span-full' : 'col-span-2'"
  >
    <div class="mb-3">
      <h3 class="text-accent text-sm font-medium">{{ title }}</h3>
      <p
        v-if="subtitle"
        class="text-text-muted mt-0.5 text-xs"
      >
        {{ subtitle }}
      </p>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  fullWidth?: boolean;
}>();
</script>
