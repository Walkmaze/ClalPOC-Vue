<template>
  <div
    v-if="submitted"
    class="bg-bg-card border-accent h-full w-96 shrink-0 overflow-y-auto border-s-2 p-5"
  >
    <div class="flex flex-col items-center justify-center py-12">
      <div class="bg-success/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <span class="text-3xl">✓</span>
      </div>
      <h3 class="text-success mb-2 text-lg font-bold">{{ t("hitl.submitted") }}</h3>
      <p class="text-text-muted text-center text-sm">{{ t("hitl.submittedDesc") }}</p>
    </div>
  </div>

  <div
    v-else-if="validation && steps.length > 0"
    class="bg-bg-card border-accent h-full w-96 shrink-0 overflow-y-auto border-s-2"
  >
    <!-- Header -->
    <div class="bg-bg-card sticky top-0 z-10 border-b border-[var(--color-border)] p-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-lg">👤</span>
          <h3 class="text-text-primary text-sm font-bold">{{ t("hitl.title") }}</h3>
        </div>
        <button
          class="text-text-muted hover:text-text-primary rounded border border-[var(--color-border)] px-2 py-0.5 text-xs"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <h4 class="text-accent mb-1 text-sm font-semibold">{{ validation.name }}</h4>
      <p class="text-text-muted mb-3 text-xs">{{ validation.hitl_reason }}</p>

      <div class="flex items-center gap-2">
        <span class="text-text-muted text-[10px] whitespace-nowrap">
          {{ t("hitl.step") }} {{ currentStep + 1 }} {{ t("hitl.of") }} {{ steps.length }}
        </span>
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            class="bg-accent h-full rounded-full transition-all duration-500"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Steps -->
    <div class="space-y-3 p-4">
      <div
        v-for="(step, i) in steps"
        :key="step.step_id || i"
        class="overflow-hidden rounded-xl border-2 transition-all duration-300"
        :class="
          i === currentStep
            ? 'border-accent bg-bg-card'
            : i < currentStep
              ? 'border-success/30 bg-success/5'
              : 'border-[var(--color-border)]/50 bg-bg-card/50 opacity-60'
        "
      >
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              :class="
                i < currentStep
                  ? 'bg-success text-bg-primary'
                  : i === currentStep
                    ? 'bg-accent text-bg-primary'
                    : 'bg-border text-text-muted'
              "
            >
              {{ i < currentStep ? "✓" : i + 1 }}
            </div>
            <div>
              <h4
                class="text-sm font-semibold"
                :class="
                  i === currentStep
                    ? 'text-text-primary'
                    : i < currentStep
                      ? 'text-success'
                      : 'text-text-muted'
                "
              >
                {{ step.title }}
              </h4>
              <p
                v-if="i > currentStep"
                class="text-text-muted text-[10px]"
              >
                {{ t("hitl.locked") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Completed summary -->
        <div
          v-if="i < currentStep && stepData[i]"
          class="px-4 pb-3"
        >
          <div class="text-text-muted space-y-0.5 text-xs">
            <template
              v-for="field in step.fields"
              :key="field.name"
            >
              <div
                v-if="hasValue(stepData[i]?.[field.name])"
                class="flex gap-1.5"
              >
                <span class="text-success/70">{{ field.label }}:</span>
                <span class="text-text-primary">{{ formatValue(stepData[i]?.[field.name]) }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Current step form -->
        <div
          v-if="i === currentStep"
          class="space-y-3 px-4 pb-4"
        >
          <p class="text-text-muted text-xs">{{ step.description }}</p>
          <div
            v-for="field in step.fields"
            :key="field.name"
          >
            <label
              v-if="field.type !== 'checkbox'"
              class="text-text-muted mb-1 block text-xs"
            >{{ field.label }}</label>

            <input
              v-if="field.type === 'text'"
              type="text"
              :value="stepData[i]?.[field.name] || ''"
              class="bg-bg-primary text-text-primary w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              @input="update(i, field.name, ($event.target as HTMLInputElement).value)"
            />

            <textarea
              v-else-if="field.type === 'textarea'"
              :value="stepData[i]?.[field.name] || ''"
              rows="3"
              class="bg-bg-primary text-text-primary w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              @input="update(i, field.name, ($event.target as HTMLTextAreaElement).value)"
            />

            <select
              v-else-if="field.type === 'select'"
              :value="stepData[i]?.[field.name] || ''"
              class="bg-bg-primary text-text-primary w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              @change="update(i, field.name, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Select...</option>
              <option
                v-for="opt in field.options || []"
                :key="opt"
                :value="opt"
              >
                {{ opt }}
              </option>
            </select>

            <input
              v-else-if="field.type === 'number'"
              type="number"
              :value="stepData[i]?.[field.name] ?? ''"
              class="bg-bg-primary text-text-primary w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              @input="update(i, field.name, parseNumberInput(($event.target as HTMLInputElement).value))"
            />

            <input
              v-else-if="field.type === 'date'"
              type="date"
              :value="stepData[i]?.[field.name] || ''"
              class="bg-bg-primary text-text-primary w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              @input="update(i, field.name, ($event.target as HTMLInputElement).value)"
            />

            <label
              v-else-if="field.type === 'checkbox'"
              class="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                :checked="!!stepData[i]?.[field.name]"
                class="border-border text-accent focus:ring-accent h-4 w-4 rounded"
                @change="update(i, field.name, ($event.target as HTMLInputElement).checked)"
              />
              <span class="text-text-primary text-sm">{{ field.label }}</span>
            </label>
          </div>
          <div class="flex justify-end pt-2">
            <button
              v-if="i === steps.length - 1"
              class="bg-success text-bg-primary rounded-lg px-5 py-2 text-sm font-semibold transition-colors hover:bg-success/80"
              @click="handleSubmit"
            >
              {{ t("hitl.submit") }}
            </button>
            <button
              v-else
              class="bg-accent text-bg-primary inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold transition-colors hover:bg-accent/80"
              @click="handleNext"
            >
              {{ t("hitl.next") }} <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import type { HitlDecision, Validation } from "@/domain/ClalPOC/domain/models/Validation";

const props = defineProps<{
  validation: Validation | null;
  validationIndex: number | null;
}>();

const emit = defineEmits<{
  (event: "resolve", validationIndex: number, decision: HitlDecision, stepData: Record<number, Record<string, any>>): void;
  (event: "close"): void;
}>();

const { t } = useI18n();

const currentStep = ref(0);
const stepData = ref<Record<number, Record<string, any>>>({});
const submitted = ref(false);

const steps = computed(() => props.validation?.hitl_steps || []);
const progress = computed(() => ((currentStep.value + (submitted.value ? 1 : 0)) / Math.max(steps.value.length, 1)) * 100);

watch(
  () => props.validation?.id,
  () => {
    currentStep.value = 0;
    stepData.value = {};
    submitted.value = false;
  }
);

function update(stepIdx: number, fieldName: string, value: any) {
  stepData.value = {
    ...stepData.value,
    [stepIdx]: { ...(stepData.value[stepIdx] || {}), [fieldName]: value },
  };
}

function parseNumberInput(raw: string): number | "" {
  return raw === "" ? "" : Number(raw);
}

function hasValue(value: any): boolean {
  return value !== undefined && value !== null && value !== "";
}

function formatValue(value: any): string {
  if (typeof value === "boolean") return value ? t("hitl.yes") : t("hitl.no");
  return String(value);
}

function handleNext() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
}

function handleSubmit() {
  submitted.value = true;

  const lastStep = stepData.value[steps.value.length - 1] || {};
  const decision = String(lastStep.decision || lastStep.final_decision || "").toLowerCase();
  let result: HitlDecision = "approve";
  if (decision.includes("reject")) result = "reject";
  else if (decision.includes("escalate")) result = "escalate";

  setTimeout(() => {
    if (props.validationIndex === null) return;
    emit("resolve", props.validationIndex, result, stepData.value);
  }, 1200);
}
</script>
