<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <!-- API Key -->
    <section class="bg-bg-card rounded-xl border border-border p-6">
      <div class="mb-4 flex items-center gap-2">
        <span class="text-lg">🔑</span>
        <h2 class="text-text-primary text-lg font-bold">{{ t("settings.apiKey") }}</h2>
      </div>
      <p class="text-text-muted mb-3 text-xs">{{ t("settings.apiKeyDesc") }}</p>
      <input
        v-model="apiKeyDraft"
        type="password"
        placeholder="sk-ant-..."
        class="bg-bg-primary text-text-primary placeholder-text-muted/50 focus:border-accent w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none"
        @blur="commitApiKey"
      />
      <div
        v-if="settings.apiKey"
        class="mt-2 flex items-center gap-1.5"
      >
        <div class="bg-success h-1.5 w-1.5 rounded-full" />
        <span class="text-success text-[10px]">{{ t("settings.apiKeyConfigured") }}</span>
      </div>
    </section>

    <!-- Language -->
    <section class="bg-bg-card rounded-xl border border-border p-6">
      <div class="mb-4 flex items-center gap-2">
        <span class="text-lg">🌐</span>
        <h2 class="text-text-primary text-lg font-bold">{{ t("settings.language") }}</h2>
      </div>
      <p class="text-text-muted mb-3 text-xs">{{ t("settings.languageDesc") }}</p>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          :class="
            settings.lang === 'en'
              ? 'bg-accent text-bg-primary border-accent'
              : 'bg-bg-primary text-text-muted hover:text-text-primary hover:border-accent border-border'
          "
          @click="settings.setLang('en')"
        >
          <img
            src="https://flagcdn.com/w40/us.png"
            srcset="https://flagcdn.com/w80/us.png 2x"
            alt=""
            class="h-4 w-6 shrink-0 rounded-[2px] object-cover"
          />
          {{ t("settings.english") }}
        </button>
        <button
          class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          :class="
            settings.lang === 'he'
              ? 'bg-accent text-bg-primary border-accent'
              : 'bg-bg-primary text-text-muted hover:text-text-primary hover:border-accent border-border'
          "
          @click="settings.setLang('he')"
        >
          <img
            src="https://flagcdn.com/w40/il.png"
            srcset="https://flagcdn.com/w80/il.png 2x"
            alt=""
            class="h-4 w-6 shrink-0 rounded-[2px] object-cover"
          />
          {{ t("settings.hebrew") }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useSettingsStore } from "@/shared/stores/settings.store";

const { t } = useI18n();
const settings = useSettingsStore();

const apiKeyDraft = ref(settings.apiKey);

function commitApiKey() {
  settings.setApiKey(apiKeyDraft.value);
}
</script>
