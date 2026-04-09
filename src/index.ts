import {
  createServer,
  type HtmlTagDescriptor,
  type Plugin,
  type ResolvedConfig,
} from "vite";
import {
  type ImageResponseOptions,
  OgImageGenerator,
} from "./og-image-generator";

const pluginName = "vite-plugin-og-image";

export interface OgImagePluginOptions {
  componentPath?: string | undefined;
  host: string;
  alt?: string | undefined;
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
      server.middlewares.use(async (req, res, next) => {
        const reqPath = req.url?.split("?")[0];
        const devPath = ogImageGenerator.devComponentPath;
        if (reqPath === devPath) {
          try {
            const imageRes = await ogImageGenerator.generateOgImage((id) =>
              server.ssrLoadModule(id),
            );
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
          const [outputPath, arrayBuffer] =
            await ogImageGenerator.generateOgImageInProd((id) =>
              server.ssrLoadModule(id),
            );
          referenceId = this.emitFile({
            type: "asset",
            source: new Uint8Array(arrayBuffer),
            name: outputPath,
          });
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
      const { width, height } = ogImageGenerator.imageSize;
      const commonTags: HtmlTagDescriptor[] = [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: url.toString(),
          },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:type",
            content: "image/png",
          },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:width",
            content: String(width),
          },
          injectTo: "head",
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:height",
            content: String(height),
          },
          injectTo: "head",
        },
      ] as const;
      if (ogImagePluginOptions.alt) {
        return [
          ...commonTags,
          {
            tag: "meta",
            attrs: {
              property: "og:image:alt",
              content: ogImagePluginOptions.alt,
            },
            injectTo: "head",
          },
        ];
      }
      return commonTags;
    },
  };
}
