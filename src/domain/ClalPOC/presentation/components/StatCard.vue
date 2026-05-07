<template>
  <div
    class="cursor-pointer rounded-xl border p-4 text-center transition-all"
    :class="[
      bg,
      active ? 'border-accent ring-accent/30 ring-1' : 'hover:border-text-muted/30 border-[var(--color-border)]',
    ]"
    @click="emit('click')"
  >
    <div class="mb-1 flex items-center justify-center gap-2">
      <span
        v-if="dot"
        class="relative flex h-2 w-2"
      >
        <span
          v-if="pulse"
          :class="['absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', dot]"
        />
        <span :class="['relative inline-flex h-2 w-2 rounded-full', dot]" />
      </span>
      <span :class="['text-2xl font-bold', color]">{{ value }}</span>
    </div>
    <span class="text-text-muted text-[10px] tracking-wider uppercase">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
  color: string;
  bg: string;
  dot?: string;
  pulse?: boolean;
  active?: boolean;
}>();

const emit = defineEmits<{ (event: "click"): void }>();
</script>
