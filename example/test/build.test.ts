import { expect, beforeAll, afterAll, test } from "vitest";
import { build } from "vite";
import { join } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import {
  PNG_SIGNATURE,
  getPNGSignature,
  getTestPaths,
  cleanupDistDir,
} from "./utils";

const { root, configFile, distDir } = getTestPaths();

beforeAll(async () => {
  // Clean dist directory before build
  cleanupDistDir(distDir);

  // Build the project
  await build({ root, configFile });
});

afterAll(async () => {
  await cleanupDistDir(distDir);
});

const ogFileRegex = /^og-image-\w+\.png$/;

test("should generate og-image-[hash].png file in dist/assets", async () => {
  const assetsDir = join(distDir, "assets");
  const files = await readdir(assetsDir);

  // Find the generated OG image file
  const ogImageFile = files.find((file) => ogFileRegex.test(file));

  expect(ogImageFile).toBeDefined();

  if (ogImageFile) {
    const imagePath = join(assetsDir, ogImageFile);
    const buffer = await readFile(imagePath);

    // Verify PNG signature
    expect(getPNGSignature(buffer)).toEqual(PNG_SIGNATURE);
  }
});

test("should update index.html with correct asset path", async () => {
  const indexPath = join(distDir, "index.html");
  const html = await readFile(indexPath, "utf-8");
  const $ = cheerio.load(html);

  // Check og:image meta tag
  const ogImageMeta = $('meta[property="og:image"]');
  expect(ogImageMeta.attr("content")).toMatch(
    /^https:\/\/example\.com\/assets\/og-image-\w+\.png$/
  );
});
