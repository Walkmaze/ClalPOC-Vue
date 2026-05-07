import { nextTick } from "vue";
import { createI18n, type I18n } from "vue-i18n";

import enLocale from "@/assets/locales/en.json";

export const SUPPORT_LOCALES = ["en", "he"] as const;
export type SupportedLocale = (typeof SUPPORT_LOCALES)[number];

export function setI18nLanguage(i18n: I18n, locale: SupportedLocale) {
  if (i18n.mode === "legacy") {
    (i18n.global as any).locale = locale;
  } else {
    (i18n.global.locale as any).value = locale;
  }
  document.querySelector("html")?.setAttribute("lang", locale);
  document.querySelector("html")?.setAttribute("dir", locale === "he" ? "rtl" : "ltr");
}

export async function loadLocaleMessages(i18n: I18n, locale: SupportedLocale) {
  if (locale === "en") {
    i18n.global.setLocaleMessage(locale, enLocale as any);
  }
  // 'he' messages will be added later when translations exist
  return nextTick();
}

const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  globalInjection: true,
  messages: {
    en: enLocale as any,
  },
});

setI18nLanguage(i18n as I18n, "en");

export default i18n;
