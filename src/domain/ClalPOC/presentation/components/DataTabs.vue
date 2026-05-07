<template>
  <div class="bg-bg-card overflow-hidden rounded-xl border border-[var(--color-border)]">
    <!-- Tab bar -->
    <div class="flex border-b border-[var(--color-border)]">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="relative flex-1 px-4 py-3 text-sm font-medium transition-colors"
        :class="activeTab === tab.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span
          v-if="tab.id === 'policies' && contract?.clauses?.length"
          class="bg-accent/20 text-accent ms-1.5 rounded-full px-1.5 text-[10px]"
        >
          {{ contract.clauses.length }}
        </span>
        <span
          v-if="tab.id === 'regulations' && regulations.length"
          class="bg-accent/20 text-accent ms-1.5 rounded-full px-1.5 text-[10px]"
        >
          {{ regulations.length }}
        </span>
        <div
          v-if="activeTab === tab.id"
          class="bg-accent absolute right-0 bottom-0 left-0 h-0.5"
        />
      </button>
    </div>

    <!-- Tab content -->
    <div class="max-h-[calc(100vh-17rem)] min-h-[calc(100vh-17rem)] overflow-y-auto p-4">
      <InputDataTab
        v-if="activeTab === 'input'"
        :member-data="memberData"
        @update:member-data="onMemberPatch"
      />
      <ContractTab
        v-if="activeTab === 'policies'"
        :contract="contract"
        @update:contract="(c) => scenario.setContract(c)"
      />
      <RegulationsTab
        v-if="activeTab === 'regulations'"
        :regulations="regulations"
        @update:regulations="(r) => scenario.setRegulations(r)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Contract } from "@/domain/ClalPOC/domain/models/Contract";
import type { Member } from "@/domain/ClalPOC/domain/models/Member";
import type { Regulation } from "@/domain/ClalPOC/domain/models/Regulation";
import { useScenarioStore } from "@/domain/ClalPOC/infrastructure/stores/scenario.store";
import ContractTab from "@/domain/ClalPOC/presentation/components/ContractTab.vue";
import InputDataTab from "@/domain/ClalPOC/presentation/components/InputDataTab.vue";
import RegulationsTab from "@/domain/ClalPOC/presentation/components/RegulationsTab.vue";

const props = defineProps<{
  memberData: Member | null;
  contract: Contract | null;
  regulations: Regulation[];
}>();

const { t } = useI18n();
const scenario = useScenarioStore();

const activeTab = ref<"input" | "policies" | "regulations">("input");
const tabs = computed(() => [
  { id: "input" as const, label: t("dataTabs.inputData") },
  { id: "policies" as const, label: t("dataTabs.contract") },
  { id: "regulations" as const, label: t("dataTabs.regulations") },
]);

function onMemberPatch(patch: Partial<Member>) {
  if (!props.memberData) return;
  scenario.setMemberData({ ...props.memberData, ...patch });
}
</script>
