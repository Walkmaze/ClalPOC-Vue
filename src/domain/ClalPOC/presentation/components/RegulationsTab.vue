<template>
  <div
    v-if="!regulations || regulations.length === 0"
    class="text-text-muted flex items-center justify-center py-16 text-sm italic"
  >
    {{ t("dataTabs.generateToSeeRegulations") }}
  </div>

  <div
    v-else
    class="animate-fade-in-up space-y-3"
  >
    <div
      v-for="(reg, i) in regulations"
      :key="i"
      class="bg-bg-primary rounded-lg border border-[var(--color-border)] p-4"
    >
      <RegulationEditor
        :reg="reg"
        can-add-requirement
        @update="(patch) => updateReg(i, patch)"
        @update-requirement="(j, val) => updateRequirement(i, j, val)"
        @add-requirement="addRequirement(i)"
      />
      <button
        class="text-text-muted hover:text-error mt-2 text-xs"
        @click="removeRegulation(i)"
      >
        ✕ {{ t("common.delete") }}
      </button>
    </div>

    <button
      class="text-accent flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-accent)]/40 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--color-accent)]/5"
      @click="addRegulation"
    >
      <span class="text-sm">+</span> {{ t("regulation.addRegulation") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { Regulation } from "@/domain/ClalPOC/domain/models/Regulation";
import RegulationEditor from "@/domain/ClalPOC/presentation/components/RegulationEditor.vue";

const props = defineProps<{
  regulations: Regulation[];
}>();

const emit = defineEmits<{
  (event: "update:regulations", regulations: Regulation[]): void;
}>();

const { t } = useI18n();

function emitNext(next: Regulation[]) {
  emit("update:regulations", next);
}

function updateReg(index: number, patch: Partial<Regulation>) {
  emitNext(props.regulations.map((r, i) => (i === index ? ({ ...r, ...patch } as Regulation) : r)));
}

function updateRequirement(regIndex: number, reqIndex: number, value: string) {
  emitNext(
    props.regulations.map((r, i) => {
      if (i !== regIndex) return r;
      const reqs = [...(r.requirements || [])];
      reqs[reqIndex] = value;
      return { ...r, requirements: reqs };
    })
  );
}

function addRequirement(regIndex: number) {
  emitNext(
    props.regulations.map((r, i) => {
      if (i !== regIndex) return r;
      return {
        ...r,
        requirements: [...(r.requirements || []), ""],
        requirementsHe: [...(r.requirementsHe || []), ""],
      };
    })
  );
}

function removeRegulation(index: number) {
  emitNext(props.regulations.filter((_, i) => i !== index));
}

function addRegulation() {
  const today = new Date().toISOString().slice(0, 10);
  const next: Regulation = {
    regulation_id: `REG-NEW-${props.regulations.length + 1}`,
    authority: "Custom",
    authorityHe: "מותאם אישית",
    title: t("regulation.newTitle"),
    titleHe: t("regulation.newTitle"),
    requirements: [""],
    requirementsHe: [""],
    effective_date: today,
  };
  emitNext([...props.regulations, next]);
}
</script>
