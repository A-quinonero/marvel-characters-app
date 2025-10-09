import globals from "globals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import cypressPlugin from "eslint-plugin-cypress"; // ⬅️ NUEVO

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    rules: {},
  },

  // Bloque TS general (ignora Cypress para que no use tsconfig.json)
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["cypress/**", "cypress.config.ts"], // ⬅️ NUEVO
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...typescriptEslint.configs["recommended"].rules,
    },
  },

  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // 🔽 Bloque Cypress (usa tsconfig.cypress.json y reglas del plugin)
  {
    files: ["cypress/**/*.ts", "cypress/**/*.tsx", "cypress.config.ts"],
    plugins: {
      cypress: cypressPlugin,
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.cypress.json", // ⬅️ clave para el error de parsing
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        cy: "readonly",
        Cypress: "readonly"
      },
    },
    rules: {
      ...(cypressPlugin.configs.recommended?.rules ?? {}),
      // Puedes añadir reglas TS específicas si quieres
    },
  },

  prettierConfig,
];

export default eslintConfig;
