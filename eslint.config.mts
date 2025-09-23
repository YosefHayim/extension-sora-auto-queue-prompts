// eslint.config.js (Flat Config) — unified, Next.js prioritized

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import query from "@tanstack/eslint-plugin-query";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  // TanStack Query plugin (flat config)
  ...query.configs["flat/recommended"],

  ...compat.config({
    extends: ["next"],
  }),
]);
