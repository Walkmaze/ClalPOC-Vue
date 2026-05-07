<template>
  <div class="mb-4">
    <div class="mb-2 flex items-center justify-between">
      <h4 class="text-accent text-[11px] font-semibold tracking-wider uppercase">{{ title }}</h4>
      <button
        class="text-accent hover:text-accent/80 flex items-center gap-1 rounded border border-[var(--color-border)] px-2 py-1 text-[10px] transition-colors"
        @click="copy"
      >
        📋 Copy
      </button>
    </div>
    <pre
      class="text-text-primary bg-bg-primary max-h-[40vh] overflow-x-auto overflow-y-auto rounded-lg border border-[var(--color-border)] p-4 font-mono text-[11px] break-words whitespace-pre-wrap"
    >{{ value }}</pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; value: string }>();

function copy() {
  navigator.clipboard.writeText(props.value).catch(() => undefined);
}
</script>
