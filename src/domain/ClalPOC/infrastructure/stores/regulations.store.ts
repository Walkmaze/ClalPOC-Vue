import { defineStore } from "pinia";

import type { Regulation, RegulationFile } from "@/domain/ClalPOC/domain/models/Regulation";
import { extractRegulationsFromText } from "@/domain/ClalPOC/infrastructure/services/regulationImport";

const FILES_STORAGE = "flowmaze_reg_files";
const MANUAL_STORAGE = "flowmaze_reg_manual";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage full or unavailable — silently ignore */
  }
}

interface RegulationsState {
  files: RegulationFile[];
  manualEntries: Regulation[];
  generating: boolean;
  lastError: string | null;
}

export const useRegulationsStore = defineStore("regulations", {
  state: (): RegulationsState => ({
    files: loadJson<RegulationFile[]>(FILES_STORAGE, []),
    manualEntries: loadJson<Regulation[]>(MANUAL_STORAGE, []),
    generating: false,
    lastError: null,
  }),

  getters: {
    /** All KB entries — file-derived first, then manual. */
    kbEntries(state): Regulation[] {
      return [...state.files.flatMap((f) => f.entries || []), ...state.manualEntries];
    },
    totalEntries(): number {
      return this.kbEntries.length;
    },
  },

  actions: {
    addFile(file: RegulationFile) {
      this.files.push(file);
      saveJson(FILES_STORAGE, this.files);
    },

    addFiles(files: RegulationFile[]) {
      this.files.push(...files);
      saveJson(FILES_STORAGE, this.files);
    },

    removeFile(id: string) {
      this.files = this.files.filter((f) => f.id !== id);
      saveJson(FILES_STORAGE, this.files);
    },

    updateFileEntry(fileId: string, entryIndex: number, patch: Partial<Regulation>) {
      const file = this.files.find((f) => f.id === fileId);
      if (!file) return;
      const next = [...file.entries];
      next[entryIndex] = { ...next[entryIndex], ...patch } as Regulation;
      file.entries = next;
      saveJson(FILES_STORAGE, this.files);
    },

    addManualEntry(entry: Regulation) {
      this.manualEntries.push(entry);
      saveJson(MANUAL_STORAGE, this.manualEntries);
    },

    updateManualEntry(index: number, patch: Partial<Regulation>) {
      this.manualEntries[index] = { ...this.manualEntries[index], ...patch } as Regulation;
      saveJson(MANUAL_STORAGE, this.manualEntries);
    },

    removeManualEntry(index: number) {
      this.manualEntries.splice(index, 1);
      saveJson(MANUAL_STORAGE, this.manualEntries);
    },

    /**
     * Re-extract entries for every file from scratch using Claude.
     * Manual entries are untouched. Sequential `REG-IMPORT-{n}` IDs are
     * assigned across the whole result.
     */
    async generate(apiKey: string): Promise<void> {
      if (!apiKey) throw new Error("API key required");
      if (this.files.length === 0) return;
      this.generating = true;
      this.lastError = null;
      try {
        let counter = 1;
        const updated: RegulationFile[] = [];
        for (const f of this.files) {
          try {
            const entries = await extractRegulationsFromText(f.rawText, apiKey);
            const renumbered = entries.map((e) => ({ ...e, regulation_id: `REG-IMPORT-${counter++}` }));
            updated.push({ ...f, status: "processed", entries: renumbered });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.lastError = `Extraction failed for ${f.name}: ${message}`;
            updated.push({ ...f, status: "raw", entries: [] });
          }
        }
        this.files = updated;
        saveJson(FILES_STORAGE, this.files);
      } finally {
        this.generating = false;
      }
    },
  },
});
