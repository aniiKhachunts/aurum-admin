import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
    globalIgnores(["dist", "node_modules"]),

    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
    },

    {
        files: ["src/mock/**/*.{ts,tsx}", "public/mockServiceWorker.js"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "react-hooks/exhaustive-deps": "off",
        },
    },

    {
        files: ["src/server/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },

    {
        files: ["src/shared/ui/DataTable/**/*.{ts,tsx}", "src/shared/hooks/useTableQueryState.ts"],
        rules: {
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/incompatible-library": "off",
        },
    },
    {
        files: ["src/shared/ui/ConfirmDialog.tsx"],
        rules: {
            "react-hooks/set-state-in-effect": "off",
        },
    },

])

