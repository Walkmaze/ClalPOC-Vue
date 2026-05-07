<template>
  <div class="flex h-full gap-6">
    <!-- Left sidebar -->
    <div class="w-72 shrink-0 space-y-5">
      <!-- Fund Type / Action -->
      <div class="bg-bg-card rounded-xl border border-border p-4">
        <label class="text-text-muted mb-2 block text-xs tracking-wider uppercase">
          {{ t("builder.fundType") }}
        </label>
        <select
          v-model="fundTypeProxy"
          class="bg-bg-primary text-text-primary focus:border-accent w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none"
        >
          <option
            v-for="ft in FUND_TYPES"
            :key="ft.id"
            :value="ft.id"
          >
            {{ ft.labelHe }} — {{ ft.label }}
          </option>
        </select>

        <label class="text-text-muted mt-4 mb-2 block text-xs tracking-wider uppercase">
          {{ t("builder.action") }}
        </label>
        <div class="space-y-1.5">
          <button
            v-for="uc in currentUseCases"
            :key="uc.id"
            class="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all"
            :class="
              scenario.useCase === uc.id
                ? 'border-accent/40 bg-accent/15 text-accent font-medium'
                : 'bg-bg-primary text-text-muted hover:text-text-primary border-border hover:border-text-muted/30'
            "
            @click="scenario.setUseCase(uc.id)"
          >
            <span>{{ uc.icon }}</span>
            <div>
              <div class="text-sm leading-tight">{{ uc.label }}</div>
              <div class="text-[10px] opacity-70">{{ uc.labelHe }}</div>
            </div>
          </button>
        </div>

        <button
          class="bg-teal text-bg-primary mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-teal/80"
          @click="scenario.generate()"
        >
          {{ t("builder.generate") }}
        </button>
      </div>

      <!-- Launch -->
      <button
        class="bg-accent text-bg-primary disabled:bg-border disabled:text-text-muted shadow-accent/20 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-bold shadow-lg transition-colors hover:bg-accent/80 disabled:shadow-none"
        :disabled="!canLaunch"
        @click="handleLaunch"
      >
        <span
          v-if="isLaunching"
          class="border-bg-primary inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
        />
        {{ isLaunching ? t("builder.launching") : t("builder.launch") }}
      </button>
      <p
        v-if="!scenario.isReady"
        class="text-text-muted -mt-3 text-center text-[10px]"
      >
        {{ t("builder.generateFirst") }}
      </p>
      <p
        v-else-if="!settings.apiKey"
        class="text-warning -mt-3 text-center text-[10px]"
      >
        {{ t("builder.apiKeyRequired") }}
      </p>

      <!-- Bulk -->
      <div class="bg-bg-card rounded-xl border border-border p-4">
        <h3 class="text-text-muted mb-2 text-xs tracking-wider uppercase">{{ t("builder.bulk") }}</h3>
        <p class="text-text-muted mb-3 text-[11px]">{{ t("builder.bulkDesc") }}</p>
        <div class="mb-3 flex gap-1.5">
          <button
            v-for="n in floodPresets"
            :key="n"
            class="flex-1 rounded-lg border py-1.5 text-xs transition-colors"
            :class="
              floodCount === n
                ? 'border-accent bg-accent/15 text-accent font-semibold'
                : 'bg-bg-primary text-text-muted hover:text-text-primary border-border'
            "
            @click="floodCount = n"
          >
            {{ n }}
          </button>
        </div>
        <p
          v-if="floodCount >= 50"
          class="text-warning mb-2 text-[10px]"
        >
          {{ t("builder.bulkWarning") }}
        </p>
        <button
          class="bg-warning text-bg-primary disabled:bg-border disabled:text-text-muted flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-colors hover:bg-warning/80"
          :disabled="!!executions.floodProgress"
          @click="handleFlood"
        >
          <span
            v-if="executions.floodProgress"
            class="border-bg-primary inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
          />
          <template v-if="executions.floodProgress">
            {{ executions.floodProgress.launched }} / {{ executions.floodProgress.total }}
          </template>
          <template v-else> 🚀 {{ t("builder.flood") }} </template>
        </button>
      </div>
    </div>

    <!-- Right area — DataTabs -->
    <div class="min-w-0 flex-1">
      <DataTabs
        :member-data="scenario.memberData"
        :contract="scenario.contract"
        :regulations="scenario.regulations"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { FundType, UseCase } from "@/domain/ClalPOC/domain/models/common";
import { FUND_TYPES, USE_CASES } from "@/domain/ClalPOC/domain/services/dataGenerators";
import DataTabs from "@/domain/ClalPOC/presentation/components/DataTabs.vue";
import { useExecutionsStore } from "@/domain/ClalPOC/infrastructure/stores/executions.store";
import { useScenarioStore } from "@/domain/ClalPOC/infrastructure/stores/scenario.store";
import { useSettingsStore } from "@/shared/stores/settings.store";

const { t } = useI18n();
const router = useRouter();
const scenario = useScenarioStore();
const executions = useExecutionsStore();
const settings = useSettingsStore();

const isLaunching = ref(false);
const floodCount = ref(10);
const floodPresets = [5, 10, 20, 50] as const;

const fundTypeProxy = computed<FundType>({
  get: () => scenario.fundType,
  set: (val) => {
    scenario.setFundType(val);
    const first = USE_CASES[val]?.[0]?.id;
    if (first) scenario.setUseCase(first as UseCase);
  },
});

const currentUseCases = computed(() => USE_CASES[scenario.fundType] || []);

const canLaunch = computed(() => scenario.isReady && !!settings.apiKey && !isLaunching.value);

function handleLaunch() {
  if (!canLaunch.value || !scenario.memberData || !scenario.contract) return;
  isLaunching.value = true;
  const procId = executions.launch({
    memberData: scenario.memberData,
    contract: scenario.contract,
    regulations: scenario.regulations,
    fundType: scenario.fundType,
    apiKey: settings.apiKey,
  });
  isLaunching.value = false;
  router.push({ name: "execution-detail", params: { id: procId } });
}

async function handleFlood() {
  if (executions.floodProgress) return;
  await executions.flood(floodCount.value);
  router.push({ name: "executions" });
}
</script>
