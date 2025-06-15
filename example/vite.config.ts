/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactOgImage from "vite-plugin-react-og-image";

// https://vite.dev/config/
export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      reactOgImage({
        host: "https://example.com",
      }),
    ],
    test: {
      globals: true,
      watch: false,
    },
  };
});
