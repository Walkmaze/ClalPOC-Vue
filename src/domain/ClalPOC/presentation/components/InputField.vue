<template>
  <div>
    <label class="text-text-muted mb-1 block text-xs">{{ label }}</label>
    <input
      :type="type || 'text'"
      :value="displayValue"
      class="bg-bg-primary text-text-primary w-full rounded border border-[var(--color-border)] px-3 py-1.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
      @input="onInput(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  modelValue?: string | number | null;
  type?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string | number): void;
}>();

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === null) {
    return props.type === "number" ? 0 : "";
  }
  return props.modelValue;
});

function onInput(raw: string) {
  if (props.type === "number") {
    emit("update:modelValue", raw === "" ? 0 : Number(raw));
  } else {
    emit("update:modelValue", raw);
  }
}
</script>
