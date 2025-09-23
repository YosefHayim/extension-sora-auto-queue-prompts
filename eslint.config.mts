import js from "@eslint/js";
import query from "@tanstack/eslint-plugin-query";
import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,

  ...query.configs["flat/recommended"],
]);
