<template>
  <div class="flex min-h-screen flex-col">
    <header class="bg-bg-card sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-border px-6 py-0">
      <div class="flex items-center gap-8">
        <h1 class="text-accent py-3 text-lg font-bold tracking-wide">
          <span class="text-text-primary">flow</span>maze
        </h1>
        <nav class="flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="text-text-muted hover:text-text-primary border-b-2 border-transparent px-4 py-3.5 text-sm font-medium transition-colors"
            active-class="!border-accent !text-accent"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
      <p class="text-text-muted text-[10px]">{{ t("header.subtitle") }}</p>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>

    <footer class="shrink-0 border-t border-border py-3 text-center">
      <p class="text-text-muted text-[10px]">{{ t("footer.text") }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const navItems = computed(() => [
  { name: "dashboard", label: t("header.dashboard") },
  { name: "executions", label: t("header.executions") },
  { name: "scenario-builder", label: t("header.scenarioBuilder") },
  { name: "regulations", label: t("header.regulations") },
  { name: "settings", label: t("header.settings") },
]);
</script>
