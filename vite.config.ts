import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    Components({
      dirs: ["./src/shared/components", "./src/domain/**/components"],
      resolvers: [PrimeVueResolver()],
      dts: "components.d.ts",
    }),
    AutoImport({
      imports: ["vue", "vue-router", "vue-i18n", "pinia"],
      dirs: ["./src/domain/**/composables", "./src/domain/**/application", "./src/shared/composables"],
      dts: "auto-imports.d.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
  },
});
