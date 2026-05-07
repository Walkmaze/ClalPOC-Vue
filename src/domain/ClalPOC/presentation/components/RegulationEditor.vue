<template>
  <div>
    <div class="mb-2 flex items-center gap-2">
      <input
        :value="reg.regulation_id"
        class="text-accent w-32 rounded border border-transparent bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-xs focus:border-[var(--color-accent)] focus:outline-none"
        @input="emitUpdate('regulation_id', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="reg.authority"
        class="flex-1 border-b border-transparent bg-transparent text-xs text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        @input="emitUpdate('authority', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <input
      :value="reg.title"
      :placeholder="t('regulation.newTitle')"
      class="text-text-primary mb-2 w-full border-b border-transparent bg-transparent text-sm font-semibold focus:border-[var(--color-accent)] focus:outline-none"
      @input="emitUpdate('title', ($event.target as HTMLInputElement).value)"
    />
    <div class="space-y-1">
      <textarea
        v-for="(req, j) in reg.requirements || []"
        :key="j"
        :value="req || ''"
        :placeholder="t('regulation.newRequirement')"
        rows="2"
        class="bg-bg-card w-full resize-none rounded border border-transparent px-2 py-1.5 text-xs text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        @input="emitRequirementUpdate(j, ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
    <button
      v-if="canAddRequirement"
      class="text-accent mt-1.5 flex items-center gap-1 text-[10px] transition-colors hover:text-[var(--color-accent)]/80"
      @click="emit('addRequirement')"
    >
      <span>+</span> {{ t("regulation.addRequirement") }}
    </button>
    <div class="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
      <span>{{ t("regulation.effective") }}</span>
      <input
        type="date"
        :value="reg.effective_date || ''"
        class="border-b border-transparent bg-transparent text-[10px] text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        @input="emitUpdate('effective_date', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { Regulation } from "@/domain/ClalPOC/domain/models/Regulation";

const props = defineProps<{
  reg: Regulation;
  canAddRequirement?: boolean;
}>();

const emit = defineEmits<{
  (event: "update", patch: Partial<Regulation>): void;
  (event: "updateRequirement", index: number, value: string): void;
  (event: "addRequirement"): void;
}>();

const { t } = useI18n();

function emitUpdate(field: keyof Regulation, value: string) {
  emit("update", { [field]: value } as Partial<Regulation>);
}

function emitRequirementUpdate(index: number, value: string) {
  emit("updateRequirement", index, value);
}

// suppress unused-prop-warning for canAddRequirement when omitted
void props;
</script>
