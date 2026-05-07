import parser from "vue-eslint-parser";
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vue from "eslint-plugin-vue";

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,ts,vue}", "*.{js,ts,vue}"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        ecmaVersion: 2020,
      },
      globals: {
        Event: "readonly",
        window: "readonly",
        URL: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        document: "readonly",
        location: "readonly",
        FormData: "readonly",
        File: "readonly",
        FileReader: "readonly",
        URLSearchParams: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        crypto: "readonly",
      },
    },
    plugins: {
      vue,
      "@typescript-eslint": typescript,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "max-len": [
        "error",
        {
          code: 140,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      "vue/max-attributes-per-line": ["error", { singleline: 1, multiline: 1 }],
      "vue/first-attribute-linebreak": ["error", { singleline: "beside", multiline: "below" }],
      "vue/component-api-style": ["error", ["script-setup", "composition"]],
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "off",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:", "^vue", "^@?\\w"],
            ["^@/shared"],
            ["^@/domain"],
            ["^@/"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },
  prettier,
];
