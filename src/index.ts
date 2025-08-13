import {
  type Plugin,
  type ResolvedConfig,
  createServer,
  isRunnableDevEnvironment,
} from "vite";
import {
  type ImageResponseOptions,
  OgImageGenerator,
} from "./og-image-generator";

const pluginName = "vite-plugin-og-image";

export interface OgImagePluginOptions {
  componentPath?: string | undefined;
  host: string;
  imageResponseOptions?: ImageResponseOptions | undefined;
}

export default function ogImagePlugin(
  ogImagePluginOptions: OgImagePluginOptions,
): Plugin {
  let resolvedConfig: ResolvedConfig;
  let ogImageGenerator: OgImageGenerator;
  let assetPath: string | undefined;
  let referenceId: string;

  return {
    name: pluginName,
    sharedDuringBuild: true,
    configResolved(config) {
      resolvedConfig = config;
      ogImageGenerator = new OgImageGenerator({
        ogImagePluginOptions,
        resolvedConfig: resolvedConfig,
      });
    },
    configureServer(server) {
      // Add middleware for development server
      server.middlewares.use(async (req, res, next) => {
        const reqPath = req.url?.split("?")[0];
        const env = server.environments.ssr;
        const devPath = ogImageGenerator.devComponentPath;
        if (reqPath === devPath && isRunnableDevEnvironment(env)) {
          try {
            const imageRes = await ogImageGenerator.generateOgImage(env.runner);
            res.setHeader("Content-Type", "image/png");
            res.setHeader("Cache-Control", "no-cache");
            res.end(imageRes);
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
      if (resolvedConfig.command === "build") {
        const server = await createServer();
        try {
          const env = server.environments.ssr;
          if (isRunnableDevEnvironment(env)) {
            const [outputPath, arrayBuffer] =
              await ogImageGenerator.generateOgImageInProd(env.runner);
            referenceId = this.emitFile({
              type: "asset",
              source: new Uint8Array(arrayBuffer),
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
      const url = ogImageGenerator.determineUrl(assetPath);
      return [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: url.toString(),
          },
          injectTo: "head",
        },
      ];
    },
  };
}
