import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";
import satori from "satori";
import type { ResolvedConfig } from "vite";
import type { ModuleRunner } from "vite/module-runner";
import type { FontOption } from "./";

export interface OgImageGeneratorOptions {
  componentAbsPath: string;
  satori: {
    width: number;
    height: number;
    fonts: FontOption[];
  };
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
      return this.renderPng(module.default);
    } catch (error) {
      console.error("Error generating OG image:", error);
      throw error;
    }
  }

  private async renderPng(component: Parameters<typeof createElement>[0]) {
    try {
      // Create React element
      const element = createElement(component);

      // Generate SVG with Satori
      const svg = await satori(element, this.options.satori);

      // Convert SVG to PNG
      const resvg = new Resvg(svg, {
        background: "rgba(0,0,0,0)",
        fitTo: {
          mode: "width",
          value: this.options.satori.width,
        },
      });

      const pngData = resvg.render();
      return pngData.asPng();
    } catch (error) {
      console.error("Error generating OG image:", error);
      throw error;
    }
  }
}
