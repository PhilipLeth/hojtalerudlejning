import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    // Under fuld suite deles CPU'en af alle workers; standardens 5 s pr. test
    // skød langsomme-men-grønne tests ned. Hænger noget ægte, fanger 20 s det også.
    testTimeout: 20000,
    // .claude/worktrees rummer andre sessioners udgaver af det samme repo.
    // Uden det her kører npm test deres tests med — mod deres kode — og
    // suiten er rød af noget der ikke findes i denne checkout.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/.claude/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
