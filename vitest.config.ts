import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Testes de lógica pura (RBAC, validadores) — não precisam de DOM.
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
