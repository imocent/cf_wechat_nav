import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "eslint-plugin-next";

const eslintConfig = defineConfig([
  {
    plugins: {
      "@next": nextPlugin
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off"
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
