import { createElement } from "react";
import type { ResolvedConfig } from "vite";
import type { ModuleRunner } from "vite/module-runner";
import { ImageResponse } from "@vercel/og";

export type ImageResponseOptions = Omit<
  NonNullable<ConstructorParameters<typeof ImageResponse>[1]>,
  keyof ResponseInit
>;

export interface OgImageGeneratorOptions {
  componentAbsPath: string;
  imageResponseOptions?: ImageResponseOptions | undefined;
  resolvedConfig: ResolvedConfig;
}

export class OgImageGenerator {
  private readonly options: OgImageGeneratorOptions;
  constructor(options: OgImageGeneratorOptions) {
    this.options = options;
  }

  async generateOgImageWithViteSSR(runner: ModuleRunner) {
    // Load the module through Vite's SSR
    try {
      const module = await runner.import(this.options.componentAbsPath);
      const element = createElement(module.default);
      const imageRes = new ImageResponse(
        element,
        this.options.imageResponseOptions
      );
      const arrayBuffer = await imageRes.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error("Error generating OG image:", error);
      throw error;
    }
  }
}
