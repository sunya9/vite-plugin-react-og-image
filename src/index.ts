import path from "node:path";
import type { SatoriOptions } from "satori";
import {
  type Plugin,
  type ResolvedConfig,
  createServer,
  isRunnableDevEnvironment,
  normalizePath,
} from "vite";
import { OgImageGenerator } from "./og-image-generator";
import { loadFonts } from "./util";

export type FontOption = SatoriOptions["fonts"][number];
export type FontOptionWithoutData = Omit<FontOption, "data">;

const pluginName = "vite-plugin-og-image";

export interface OgImagePluginOptions {
  componentPath?: string;
  host: string;
  satori: {
    width?: number;
    height?: number;
    fonts: FontOptionWithoutData[];
  };
}

export async function ogImagePlugin(
  options: OgImagePluginOptions
): Promise<Plugin> {
  const {
    componentPath = "./src/og-image.tsx",
    satori: { width = 1200, height = 630, fonts = [{ name: "inter" }] },
  } = options;
  const outputPath = `${path.basename(
    componentPath,
    path.extname(componentPath)
  )}.png`;
  let resolvedConfig: ResolvedConfig;

  const loadedFonts: FontOption[] = await loadFonts(fonts);
  let ogImageGenerator: OgImageGenerator;
  let assetPath: string;
  let referenceId: string;
  const determineUrl = (resolvedConfig: ResolvedConfig) => {
    if (resolvedConfig.isProduction) {
      // For production, use the built image path
      return new URL(assetPath, options.host);
    }
    return new URL(
      devComponentPath(),
      `http://localhost:${resolvedConfig.server.port}`
    );
  };

  const devComponentPath = () =>
    normalizePath(`${resolvedConfig.base}${componentPath}`);
  return {
    name: pluginName,
    sharedDuringBuild: true,
    configResolved(config) {
      resolvedConfig = config;
      ogImageGenerator = new OgImageGenerator({
        componentAbsPath: path.resolve(config.root, componentPath),
        satori: {
          width,
          height,
          fonts: loadedFonts,
        },
        resolvedConfig: config,
      });
    },
    configureServer(server) {
      // Add middleware for development server
      server.middlewares.use(async (req, res, next) => {
        const reqPath = req.url?.split("?")[0];
        const env = server.environments.ssr;
        if (reqPath === devComponentPath() && isRunnableDevEnvironment(env)) {
          try {
            // Try Vite SSR first for better HMR support
            const pngBuffer = await ogImageGenerator.generateOgImageWithViteSSR(
              env.runner
            );

            res.setHeader("Content-Type", "image/png");
            res.setHeader("Cache-Control", "no-cache");
            res.end(pngBuffer);
          } catch (error) {
            console.error("Error generating OG image:", error);
            res.statusCode = 500;
            res.end("Error generating OG image");
          }
          return;
        }
        next();
      });
    },
    async buildStart() {
      if (resolvedConfig.isProduction) {
        const server = await createServer();
        try {
          const env = server.environments.ssr;
          if (isRunnableDevEnvironment(env)) {
            const pngBuffer = await ogImageGenerator.generateOgImageWithViteSSR(
              env.runner
            );
            referenceId = this.emitFile({
              type: "asset",
              source: pngBuffer,
              name: outputPath,
            });
          }
        } catch (error) {
          console.error("Error generating OG image:", error);
        } finally {
          await server.close();
        }
      }
    },
    generateBundle() {
      assetPath = this.getFileName(referenceId);
    },
    transformIndexHtml() {
      const url = determineUrl(resolvedConfig);
      return [
        {
          tag: "meta",
          attrs: {
            name: "og:image",
            content: url.toString(),
          },
          injectTo: "head",
        },
      ];
    },
  };
}
