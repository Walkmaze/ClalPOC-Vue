<template>
  <div
    :class="[
      'bg-bg-primary rounded-lg border-2 p-4 transition-all duration-300',
      borderColor,
      opacityClass,
      isHitlWaiting ? 'cursor-pointer' : '',
    ]"
    :style="{ animationDelay: `${index * 50}ms` }"
    @click="onCardClick"
  >
    <!-- Header -->
    <div class="mb-2 flex items-start justify-between">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="text-xs">{{ headerIcon }}</span>
        <h4 class="text-text-primary truncate text-sm font-semibold">{{ validation.name }}</h4>
        <span
          v-if="validation.requires_hitl"
          class="bg-warning/20 text-warning shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
        >
          HITL
        </span>
      </div>
      <div class="ms-2 flex shrink-0 items-center gap-1.5">
        <span
          v-if="isExecuting"
          class="border-accent inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
        />
        <span
          v-if="isHitlWaiting"
          class="text-warning text-lg"
        >👤</span>
        <span
          v-if="status === 'pass'"
          class="text-success text-lg"
        >✓</span>
        <span
          v-if="status === 'fail'"
          class="text-error text-lg"
        >✗</span>
        <span
          v-if="status === 'warning'"
          class="text-warning text-lg"
        >⚠</span>
      </div>
    </div>

    <!-- Category + source -->
    <div class="mb-2 flex items-center gap-2">
      <span :class="['rounded-full px-1.5 py-0.5 text-[10px] font-medium', categoryClass]">
        {{ t(`cat.${validation.category}`, validation.category) }}
      </span>
      <span
        v-if="validation.source"
        class="text-text-muted font-mono text-[10px]"
      >
        {{ validation.source }}
      </span>
    </div>

    <!-- Description -->
    <p class="text-text-muted mb-2 text-xs">{{ validation.description }}</p>

    <!-- HITL waiting state -->
    <div
      v-if="isHitlWaiting"
      class="border-warning/30 mt-2 border-t pt-2"
    >
      <p class="text-warning mb-1 text-xs font-semibold">{{ t("flow.requiresReview") }}</p>
      <p
        v-if="validation.hitl_reason"
        class="text-text-muted mb-2 text-[10px]"
      >
        {{ validation.hitl_reason }}
      </p>
      <div
        class="text-warning bg-warning/10 inline-flex animate-pulse items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
      >
        <span>👤</span> {{ t("flow.clickToReview") }}
      </div>
    </div>

    <!-- Rule -->
    <div
      v-if="!isHitlWaiting && validation.rule"
      class="text-text-muted bg-bg-card mb-2 rounded px-2 py-1 font-mono text-[10px]"
    >
      {{ t("flow.rule") }} {{ validation.rule }}
    </div>

    <!-- Result -->
    <div
      v-if="isDone && result"
      :class="[
        'mt-2 border-t pt-2 text-xs',
        status === 'pass' ? 'border-success/30 text-success' : status === 'fail' ? 'border-error/30 text-error' : 'border-warning/30 text-warning',
      ]"
    >
      <div class="flex justify-between">
        <span>{{ t("flow.value") }} {{ result.actual_value }}</span>
      </div>
      <p class="mt-0.5 opacity-80">{{ result.message }}</p>
    </div>

    <!-- Executing label -->
    <div
      v-if="isExecuting"
      class="text-accent border-accent/30 mt-2 border-t pt-2 text-xs"
    >
      {{ t("flow.executing") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { Validation, ValidationResult, ValidationStatus } from "@/domain/ClalPOC/domain/models/Validation";

const props = defineProps<{
  validation: Validation;
  status: ValidationStatus | undefined;
  result: ValidationResult | null | undefined;
  index: number;
}>();

const emit = defineEmits<{ (event: "hitlClick", validationIndex: number): void }>();

const { t } = useI18n();

const CATEGORY_COLORS: Record<string, string> = {
  identity: "bg-purple-500/20 text-purple-300",
  eligibility: "bg-blue-500/20 text-blue-300",
  financial: "bg-emerald-500/20 text-emerald-300",
  regulatory: "bg-orange-500/20 text-orange-300",
  contract: "bg-cyan-500/20 text-cyan-300",
};

const SEVERITY_ICONS: Record<string, string> = {
  blocking: "🔒",
  warning: "⚠️",
  info: "ℹ️",
};

const isPending = computed(() => props.status === "pending" || !props.status);
const isExecuting = computed(() => props.status === "executing");
const isHitlWaiting = computed(() => props.status === "hitl_waiting");
const isDone = computed(() => ["pass", "fail", "warning"].includes(props.status || ""));

const borderColor = computed(() => {
  if (isHitlWaiting.value) return "border-warning animate-pulse-glow";
  if (isExecuting.value) return "border-accent animate-pulse-glow";
  if (props.status === "pass") return "border-success";
  if (props.status === "fail") return "border-error";
  if (props.status === "warning") return "border-warning";
  return "border-border";
});

const opacityClass = computed(() => (isPending.value ? "opacity-50" : "opacity-100"));

const headerIcon = computed(() => {
  if (isHitlWaiting.value) return "👤";
  return SEVERITY_ICONS[props.validation.severity] || "ℹ️";
});

const categoryClass = computed(
  () => CATEGORY_COLORS[props.validation.category] || "bg-border text-text-muted"
);

function onCardClick() {
  if (isHitlWaiting.value) emit("hitlClick", props.index);
}
</script>
