/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the chart library in its own long-cacheable chunk so app
        // code changes don't invalidate it. Every eagerly-used library must
        // be assigned explicitly: any unassigned module shared with recharts
        // (react, scheduler, clsx, ...) gets hoisted into the recharts
        // chunk by Rollup, the entry then imports from it, and the landing
        // page ends up downloading all of recharts.
        manualChunks(id: string) {
          if (id.includes("node_modules/recharts")) return "recharts";
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/scheduler") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/lucide-react")
          ) {
            return "vendor";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
