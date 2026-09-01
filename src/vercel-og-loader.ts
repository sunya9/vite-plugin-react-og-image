import { createRequire } from "node:module";
import path from "node:path";

// @vercel/og 1.x inlines harfbuzzjs (an emscripten CommonJS module) into its
// ESM-only Node build. During import, that code reads the CommonJS globals
// `require` and `__dirname`, and resolves hb.wasm relative to `__dirname`
// even though the file is not shipped in the package, so importing it from
// pure ESM crashes. Temporarily providing both globals — with `__dirname`
// pointing at the transitive harfbuzzjs package, which does ship hb.wasm —
// works around the upstream packaging bug.
let vercelOgPromise: Promise<typeof import("@vercel/og")> | undefined;

export function loadVercelOg(): Promise<typeof import("@vercel/og")> {
  vercelOgPromise ??= importWithCommonJsGlobals();
  return vercelOgPromise;
}

async function importWithCommonJsGlobals(): Promise<
  typeof import("@vercel/og")
> {
  const g = globalThis as Record<string, unknown>;
  const hadRequire = "require" in g;
  const hadDirname = "__dirname" in g;
  const savedRequire = g.require;
  const savedDirname = g.__dirname;
  g.require = createRequire(import.meta.url);
  const harfbuzzDir = findHarfbuzzDir();
  if (harfbuzzDir) {
    g.__dirname = harfbuzzDir;
  }
  try {
    return await import("@vercel/og");
  } finally {
    if (hadRequire) {
      g.require = savedRequire;
    } else {
      Reflect.deleteProperty(g, "require");
    }
    if (hadDirname) {
      g.__dirname = savedDirname;
    } else {
      Reflect.deleteProperty(g, "__dirname");
    }
  }
}

function findHarfbuzzDir(): string | undefined {
  try {
    // Resolve through the dependency chain (@vercel/og -> satori ->
    // harfbuzzjs) so it also works with strict layouts such as pnpm
    const require = createRequire(import.meta.url);
    const ogEntry = require.resolve("@vercel/og");
    const satoriEntry = createRequire(ogEntry).resolve("satori");
    return path.dirname(createRequire(satoriEntry).resolve("harfbuzzjs"));
  } catch {
    return undefined;
  }
}
