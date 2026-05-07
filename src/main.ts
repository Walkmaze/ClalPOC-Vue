import "@/app.css";
import "primeicons/primeicons.css";

import Aura from "@primevue/themes/aura";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";

import i18n from "@/i18n";

import App from "./App.vue";
import router from "./routes";

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark",
      cssLayer: false,
    },
  },
});

app.use(ConfirmationService);
app.use(ToastService);
app.use(i18n);
app.use(createPinia());
app.use(router);

app.mount("#app");
