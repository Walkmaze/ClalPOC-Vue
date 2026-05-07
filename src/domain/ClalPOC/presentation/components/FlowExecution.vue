<template>
  <div
    v-if="!analysisMessages && !validations"
    class="bg-bg-card flex items-center justify-center rounded-xl border border-border p-12"
  >
    <div class="text-center">
      <div class="mb-3 text-4xl opacity-50">⚡</div>
      <p class="text-text-muted text-sm">{{ t("flow.emptyState") }}</p>
    </div>
  </div>

  <div
    v-else
    class="bg-bg-card rounded-xl border border-border p-5"
  >
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-accent text-sm font-semibold tracking-wider uppercase">{{ t("flow.title") }}</h3>
      <div
        v-if="hasValidations"
        class="bg-accent text-bg-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
      >
        <span>📋</span> {{ t("flow.cardsView") }}
      </div>
    </div>

    <!-- Analysis messages -->
    <AnalysisMessages
      v-if="analysisMessages && analysisMessages.length > 0"
      :messages="analysisMessages"
    />

    <!-- Cards grid -->
    <div
      v-if="hasValidations"
      class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      <ValidationCard
        v-for="(v, i) in validations"
        :key="v.id || i"
        :validation="v"
        :status="validationStatuses?.[i]"
        :result="validationResults?.[i]"
        :index="i"
        @hitl-click="(idx) => emit('hitlClick', idx)"
      />
    </div>

    <!-- Outcome -->
    <OutcomeCard
      :outcome="outcome"
      :use-case="useCase"
      :member-data="memberData"
      @approve="emit('approve')"
      @reject="emit('reject')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { AnalysisMessage } from "@/domain/ClalPOC/domain/models/Audit";
import type { Member } from "@/domain/ClalPOC/domain/models/Member";
import type { Outcome } from "@/domain/ClalPOC/domain/models/Outcome";
import type { Validation, ValidationResult, ValidationStatus } from "@/domain/ClalPOC/domain/models/Validation";
import AnalysisMessages from "@/domain/ClalPOC/presentation/components/AnalysisMessages.vue";
import OutcomeCard from "@/domain/ClalPOC/presentation/components/OutcomeCard.vue";
import ValidationCard from "@/domain/ClalPOC/presentation/components/ValidationCard.vue";

const props = defineProps<{
  analysisMessages: AnalysisMessage[] | null;
  validations: Validation[] | null;
  validationStatuses: ValidationStatus[];
  validationResults: (ValidationResult | null)[];
  outcome: Outcome | null;
  useCase: string;
  memberData: Member | null;
}>();

const emit = defineEmits<{
  (event: "hitlClick", validationIndex: number): void;
  (event: "approve"): void;
  (event: "reject"): void;
}>();

const { t } = useI18n();

const hasValidations = computed(() => !!props.validations && props.validations.length > 0);
</script>
