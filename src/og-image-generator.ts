import { existsSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "@vercel/og";
import { createElement } from "react";
import { normalizePath, type ResolvedConfig } from "vite";
import type { OgImagePluginOptions } from "./";

export type ImageResponseOptions = Omit<
  NonNullable<ConstructorParameters<typeof ImageResponse>[1]>,
  keyof ResponseInit
>;

export interface OgImageGeneratorOptions {
  ogImagePluginOptions: OgImagePluginOptions;
  resolvedConfig: ResolvedConfig;
}

export class OgImageGenerator {
  private readonly options: OgImageGeneratorOptions;
  private readonly resolvedComponentPath: string;
  constructor(options: OgImageGeneratorOptions) {
    this.options = options;
    this.resolvedComponentPath = this.resolveComponentPath(
      options.ogImagePluginOptions.componentPath || "./src/og-image",
      options.resolvedConfig.root,
    );
  }

  async generateOgImage(
    loadModule: (id: string) => Promise<Record<string, unknown>>,
  ) {
    try {
      const module = await loadModule(this.resolvedComponentPath);
      const element = createElement(module.default as React.ComponentType);
      const imageRes = new ImageResponse(
        element,
        this.options.ogImagePluginOptions.imageResponseOptions,
      );
      const arrayBuffer = await imageRes.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error("Error generating OG image:", error);
      throw error;
    }
  }

  async generateOgImageInProd(
    loadModule: (id: string) => Promise<Record<string, unknown>>,
  ) {
    const arrayBuffer = await this.generateOgImage(loadModule);
    const outputPath = `${path.basename(
      this.resolvedComponentPath,
      path.extname(this.resolvedComponentPath),
    )}.png`;
    return [outputPath, arrayBuffer] as const;
  }

  get imageSize() {
    const opts = this.options.ogImagePluginOptions.imageResponseOptions;
    return {
      width: opts?.width ?? 1200,
      height: opts?.height ?? 630,
    };
  }

  get devComponentPath() {
    const resolvedRelPath = path.relative(
      this.options.resolvedConfig.root,
      this.resolvedComponentPath,
    );
    const resolvedPath = normalizePath(
      `${this.options.resolvedConfig.base}${resolvedRelPath}`,
    );
    return resolvedPath;
  }

  determineUrl(assetPath?: string) {
    if (assetPath) {
      // For production, use the built image path
      return new URL(assetPath, this.options.ogImagePluginOptions.host);
    }
    return new URL(
      this.devComponentPath,
      this.options.ogImagePluginOptions.host,
    );
  }

  private resolveComponentPath(componentPath: string, rootDir: string): string {
    const fullPath = path.resolve(rootDir, componentPath);

    // If the path already has an extension and exists, use it
    if (path.extname(componentPath) && existsSync(fullPath)) {
      return fullPath;
    }

    // If no extension or file doesn't exist, try extensions in order
    const extensions = [".tsx", ".jsx", ".ts", ".js"];
    const basePath = path.extname(componentPath)
      ? fullPath.slice(0, -path.extname(componentPath).length)
      : fullPath;

    for (const ext of extensions) {
      const pathWithExt = basePath + ext;
      if (existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }

    // If nothing found, return the original path (will cause an error later)
    return fullPath;
  }
}
