import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rm } from "node:fs/promises";
import { existsSync } from "node:fs";

export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function getPNGSignature(buffer: Uint8Array | Buffer): number[] {
  return Array.from(buffer.subarray(0, 8));
}

export function getTestPaths() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return {
    root: join(__dirname, ".."),
    configFile: join(__dirname, "../vite.config.ts"),
    distDir: join(__dirname, "../dist"),
  };
}

export async function cleanupDistDir(distDir: string) {
  if (existsSync(distDir)) {
    await rm(distDir, { recursive: true, force: true });
  }
}
