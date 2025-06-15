/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactOgImage from "vite-plugin-react-og-image";
import { readFile } from "fs/promises";

// https://vite.dev/config/
export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      reactOgImage({
        host: "https://example.com",
        imageResponseOptions: {
          fonts: [
            {
              name: "Geist",
              data: await readFile(
                "./node_modules/@fontsource/geist/files/geist-latin-700-normal.woff"
              ),
            },
            {
              name: "Noto Sans",
              data: await readFile(
                "./node_modules/@fontsource/noto-serif-jp/files/noto-serif-jp-japanese-400-normal.woff"
              ),
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      watch: false,
    },
  };
});
