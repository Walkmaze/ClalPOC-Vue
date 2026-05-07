import { defineStore } from "pinia";

import { setI18nLanguage, type SupportedLocale } from "@/i18n";
import i18n from "@/i18n";

const API_KEY_STORAGE = "flowmaze_api_key";
const LANG_STORAGE = "flowmaze_language";

interface SettingsState {
  apiKey: string;
  lang: SupportedLocale;
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    apiKey: localStorage.getItem(API_KEY_STORAGE) || "",
    lang: ((localStorage.getItem(LANG_STORAGE) as SupportedLocale) || "en") as SupportedLocale,
  }),

  actions: {
    setApiKey(key: string) {
      this.apiKey = key;
      localStorage.setItem(API_KEY_STORAGE, key);
    },

    setLang(lang: SupportedLocale) {
      this.lang = lang;
      localStorage.setItem(LANG_STORAGE, lang);
      setI18nLanguage(i18n as any, lang);
    },
  },
});
