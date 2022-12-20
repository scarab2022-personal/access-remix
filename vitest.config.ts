import * as path from "path";
import * as VitestConfig from "vitest/config";
import react from "@vitejs/plugin-react";

export default VitestConfig.defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["./tests/**/*.test.{ts,tsx}"],
    // exclude: ["node_modules", "e2e"],
    includeSource: ["app/**/*.{ts,tsx}"],
    coverage: {
      exclude: ["app/mocks.tsx"],
      reporter: process.env.CI ? "json" : "html-spa",
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  plugins: [react()],
});
