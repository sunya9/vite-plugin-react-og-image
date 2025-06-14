import { APIv2 } from "google-font-metadata";
import type { FontOptionWithoutData, FontOption } from "./";

export async function loadFonts(fonts: FontOptionWithoutData[]) {
  return Promise.all(
    fonts.map(async (font) => {
      const variants = APIv2[font.name]?.variants;
      if (!variants) throw new Error(`Font ${font.name} not found`);
      const weight = font.weight || 400;
      const style = font.style || "normal";
      const url = variants[weight]?.[style]?.latin?.url?.truetype;
      if (!url) throw new Error("truetype url not found");
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      return {
        ...font,
        data,
      } satisfies FontOption;
    })
  ).catch((error) => {
    console.error("Some font not found", error);
    return [];
  });
}
