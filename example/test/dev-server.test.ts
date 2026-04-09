import { expect, beforeAll, afterAll, test } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import * as cheerio from "cheerio";
import { PNG_SIGNATURE, getPNGSignature, getTestPaths } from "./utils";

const { root, configFile } = getTestPaths();

let server: ViteDevServer;
const devServerHost = "http://localhost:5173";
const ogImageHost = "https://example.com";

beforeAll(async () => {
  server = await createServer({
    root,
    configFile,
    logLevel: "warn",
  });
  await server.listen();
});

afterAll(async () => {
  await server.close();
});

test("should return PNG image response for /src/og-image.tsx", async () => {
  const response = await fetch(`${devServerHost}/src/og-image.tsx`);

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("image/png");

  // Verify it's actually a PNG by checking magic bytes
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Verify PNG signature
  expect(getPNGSignature(bytes)).toEqual(PNG_SIGNATURE);
});

test("should serve HTML with og:image meta tag pointing to preview", async () => {
  const response = await fetch(`${devServerHost}/`);

  expect(response.ok).toBe(true);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Check og:image meta tag
  const ogImageMeta = $('meta[property="og:image"]');
  expect(ogImageMeta.attr("content")).toBe(`${ogImageHost}/src/og-image.tsx`);

  // Check og:image:width and og:image:height meta tags
  const ogImageWidth = $('meta[property="og:image:width"]');
  const ogImageHeight = $('meta[property="og:image:height"]');
  expect(ogImageWidth.attr("content")).toBe("1200");
  expect(ogImageHeight.attr("content")).toBe("630");

  // Check og:image:type and og:image:alt meta tags
  const ogImageType = $('meta[property="og:image:type"]');
  expect(ogImageType.attr("content")).toBe("image/png");

  const ogImageAlt = $('meta[property="og:image:alt"]');
  expect(ogImageAlt.attr("content")).toBe("Vite React OG Image Example");
});
