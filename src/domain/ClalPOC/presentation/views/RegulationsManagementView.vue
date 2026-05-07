<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div>
      <h1 class="text-text-primary text-xl font-bold">{{ t("regMgmt.title") }}</h1>
      <p class="mt-1 text-xs text-[var(--color-text-muted)]">{{ t("regMgmt.subtitle") }}</p>
    </div>

    <div
      v-if="error"
      class="bg-error/10 border-error/30 text-error rounded-lg border px-3 py-2 text-xs"
    >
      {{ error }}
    </div>

    <!-- Source Files -->
    <section class="bg-bg-card rounded-xl border border-[var(--color-border)] p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-text-primary text-sm font-semibold tracking-wider uppercase">
          {{ t("regMgmt.sourceFiles") }}
        </h2>
        <label class="cursor-pointer">
          <input
            ref="fileInputEl"
            type="file"
            multiple
            accept=".txt,.md,.pdf,.docx,.json,.csv,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            class="hidden"
            :disabled="busy || regs.generating"
            @change="handleFileSelect"
          />
          <button
            class="bg-accent text-bg-primary disabled:bg-border disabled:text-text-muted inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent/80"
            :disabled="busy || regs.generating"
            @click="triggerFileSelect"
          >
            <span
              v-if="busy"
              class="border-bg-primary inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
            />
            📥 {{ t("regMgmt.upload") }}
          </button>
        </label>
      </div>
      <p class="mb-3 text-[11px] text-[var(--color-text-muted)]">
        {{ t("regMgmt.dropHint", { kb: KB_LIMIT }) }}
      </p>

      <div
        v-if="regs.files.length === 0"
        class="py-10 text-center text-sm text-[var(--color-text-muted)] italic"
      >
        {{ t("regMgmt.sourceFilesEmpty") }}
      </div>

      <div
        v-else
        class="space-y-2"
      >
        <div
          v-for="f in regs.files"
          :key="f.id"
          class="bg-bg-primary rounded-lg border border-[var(--color-border)]"
        >
          <div class="flex items-center justify-between gap-3 px-3 py-2.5">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-text-primary truncate text-sm">{{ f.name }}</span>
                <span
                  v-if="f.status === 'processed'"
                  class="bg-success/20 text-success rounded-full px-1.5 py-0.5 text-[10px]"
                >
                  {{ t("regMgmt.statusProcessed") }}
                </span>
                <span
                  v-else
                  class="bg-warning/20 text-warning rounded-full px-1.5 py-0.5 text-[10px]"
                >
                  {{ t("regMgmt.statusRaw") }}
                </span>
              </div>
              <div class="mt-0.5 flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                <span>{{ formatSize(f.size) }}</span>
                <span>{{ t("regMgmt.uploadedAt", { when: formatDate(f.uploadedAt) }) }}</span>
                <span
                  v-if="f.entries.length > 0"
                  class="text-accent"
                >
                  {{ t("regMgmt.entriesCount", { n: f.entries.length }) }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="f.entries.length > 0"
                class="text-accent text-[10px] hover:opacity-80"
                @click="toggleExpand(f.id)"
              >
                {{ expanded.has(f.id) ? t("regMgmt.hideExtracted") : t("regMgmt.viewExtracted") }}
              </button>
              <button
                class="hover:text-error text-sm text-[var(--color-text-muted)]"
                @click="handleDeleteFile(f.id)"
              >
                ✕
              </button>
            </div>
          </div>
          <div
            v-if="expanded.has(f.id) && f.entries.length > 0"
            class="space-y-2 border-t border-[var(--color-border)] p-3"
          >
            <RegulationEditor
              v-for="(reg, i) in f.entries"
              :key="i"
              :reg="reg"
              @update="(patch) => regs.updateFileEntry(f.id, i, patch)"
              @update-requirement="(j, val) => updateFileRequirement(f.id, i, j, val)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Knowledge Base -->
    <section class="bg-bg-card rounded-xl border border-[var(--color-border)] p-5">
      <div class="mb-2 flex items-center justify-between">
        <div>
          <h2 class="text-text-primary text-sm font-semibold tracking-wider uppercase">
            {{ t("regMgmt.knowledgeBase") }}
          </h2>
          <p class="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
            {{ t("regMgmt.totalEntries", { n: regs.totalEntries }) }}
          </p>
        </div>
        <button
          class="bg-accent text-bg-primary disabled:bg-border disabled:text-text-muted inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent/80"
          :disabled="regs.generating || regs.files.length === 0 || !settings.apiKey"
          @click="handleGenerate"
        >
          <span
            v-if="regs.generating"
            class="border-bg-primary inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
          />
          {{ regs.generating ? t("regMgmt.generating") : t("regMgmt.generate") }}
        </button>
      </div>
      <p class="mb-4 text-[11px] text-[var(--color-text-muted)]">
        {{ t("regMgmt.regenerateHint") }}
        <span
          v-if="!settings.apiKey && regs.files.length > 0"
          class="text-warning mt-1 block"
        >
          {{ t("regMgmt.errorApiKey") }}
        </span>
      </p>

      <div
        v-if="regs.totalEntries === 0"
        class="py-10 text-center text-sm text-[var(--color-text-muted)] italic"
      >
        {{ t("regMgmt.kbEmpty") }}
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <template
          v-for="f in regs.files"
          :key="f.id"
        >
          <div
            v-for="(reg, i) in f.entries"
            :key="`${f.id}-${i}`"
            class="bg-bg-primary rounded-lg border border-[var(--color-border)] p-4"
          >
            <div class="mb-2 text-[10px] text-[var(--color-text-muted)]">
              {{ t("regMgmt.fromFile", { file: f.name }) }}
            </div>
            <RegulationEditor
              :reg="reg"
              @update="(patch) => regs.updateFileEntry(f.id, i, patch)"
              @update-requirement="(j, val) => updateFileRequirement(f.id, i, j, val)"
            />
          </div>
        </template>
        <div
          v-for="(reg, i) in regs.manualEntries"
          :key="`manual-${i}`"
          class="bg-bg-primary rounded-lg border border-[var(--color-border)] p-4"
        >
          <div class="mb-2 flex items-center justify-between">
            <div class="text-accent text-[10px] font-medium">{{ t("regMgmt.manual") }}</div>
            <button
              class="hover:text-error text-xs text-[var(--color-text-muted)]"
              @click="regs.removeManualEntry(i)"
            >
              ✕
            </button>
          </div>
          <RegulationEditor
            :reg="reg"
            can-add-requirement
            @update="(patch) => regs.updateManualEntry(i, patch)"
            @update-requirement="(j, val) => updateManualRequirement(i, j, val)"
            @add-requirement="addManualRequirement(i)"
          />
        </div>
      </div>

      <button
        class="text-accent mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-accent)]/40 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--color-accent)]/5"
        @click="addManualEntry"
      >
        <span class="text-sm">+</span> {{ t("regMgmt.addManual") }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Regulation, RegulationFile } from "@/domain/ClalPOC/domain/models/Regulation";
import RegulationEditor from "@/domain/ClalPOC/presentation/components/RegulationEditor.vue";
import {
  extractTextFromFile,
  MAX_REG_IMPORT_BYTES,
  RegulationImportError,
} from "@/domain/ClalPOC/infrastructure/services/regulationImport";
import { useRegulationsStore } from "@/domain/ClalPOC/infrastructure/stores/regulations.store";
import { useSettingsStore } from "@/shared/stores/settings.store";

const { t } = useI18n();
const regs = useRegulationsStore();
const settings = useSettingsStore();

const KB_LIMIT = MAX_REG_IMPORT_BYTES / 1000;
const fileInputEl = ref<HTMLInputElement | null>(null);
const busy = ref(false);
const error = ref("");
const expanded = ref<Set<string>>(new Set());

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function triggerFileSelect() {
  fileInputEl.value?.click();
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const list = Array.from(input.files || []);
  input.value = "";
  if (list.length === 0) return;

  error.value = "";
  busy.value = true;
  const newFiles: RegulationFile[] = [];

  for (const f of list) {
    if (f.size > MAX_REG_IMPORT_BYTES) {
      error.value = t("regMgmt.errorTooLarge", { kb: KB_LIMIT });
      continue;
    }
    try {
      const text = await extractTextFromFile(f);
      newFiles.push({
        id: newId(),
        name: f.name,
        size: f.size,
        uploadedAt: new Date().toISOString(),
        rawText: text,
        status: "raw",
        entries: [],
      });
    } catch (err) {
      if (err instanceof RegulationImportError && err.code === "UNSUPPORTED") {
        error.value = t("regMgmt.errorUnsupported");
      } else {
        error.value = t("regMgmt.errorParse", { file: f.name });
      }
    }
  }
  if (newFiles.length > 0) regs.addFiles(newFiles);
  busy.value = false;
}

function handleDeleteFile(id: string) {
  if (!window.confirm(t("regMgmt.confirmDelete"))) return;
  regs.removeFile(id);
  const next = new Set(expanded.value);
  next.delete(id);
  expanded.value = next;
}

function toggleExpand(id: string) {
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expanded.value = next;
}

async function handleGenerate() {
  if (!settings.apiKey) {
    error.value = t("regMgmt.errorApiKey");
    return;
  }
  error.value = "";
  try {
    await regs.generate(settings.apiKey);
    if (regs.lastError) error.value = regs.lastError;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

function updateFileRequirement(fileId: string, entryIndex: number, reqIndex: number, value: string) {
  const file = regs.files.find((f) => f.id === fileId);
  if (!file) return;
  const reqs = [...(file.entries[entryIndex].requirements || [])];
  reqs[reqIndex] = value;
  regs.updateFileEntry(fileId, entryIndex, { requirements: reqs });
}

function updateManualRequirement(index: number, reqIndex: number, value: string) {
  const reqs = [...(regs.manualEntries[index].requirements || [])];
  reqs[reqIndex] = value;
  regs.updateManualEntry(index, { requirements: reqs });
}

function addManualRequirement(index: number) {
  const cur = regs.manualEntries[index];
  regs.updateManualEntry(index, {
    requirements: [...(cur.requirements || []), ""],
    requirementsHe: [...(cur.requirementsHe || []), ""],
  });
}

function addManualEntry() {
  const today = new Date().toISOString().slice(0, 10);
  const entry: Regulation = {
    regulation_id: `REG-MANUAL-${regs.manualEntries.length + 1}`,
    authority: "Custom",
    authorityHe: "מותאם אישית",
    title: t("regulation.newTitle"),
    titleHe: t("regulation.newTitle"),
    requirements: [""],
    requirementsHe: [""],
    effective_date: today,
  };
  regs.addManualEntry(entry);
}
</script>
