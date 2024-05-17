import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node
    },
    rules: {
      'semi': 'error',
      '@typescript-eslint/no-explicit-any': 'off'
    },
    ignores: ["node_modules", "*.json", "*.md", "dist/**/*"]
  }
);
