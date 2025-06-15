# vite-plugin-react-og-image

[![npm version](https://badge.fury.io/js/vite-plugin-react-og-image.svg)](https://www.npmjs.com/package/vite-plugin-react-og-image)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate Open Graph images for your React + Vite app using React components.

## Features

- 🎨 Use React components to design OG images
- ⚡ Fast image generation powered by [@vercel/og](https://vercel.com/docs/functions/og-image-generation)

## Installation

```bash
npm install vite-plugin-react-og-image
# or
pnpm add vite-plugin-react-og-image
# or
yarn add vite-plugin-react-og-image
```

## Quick Start

### 1. Configure the plugin in `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactOgImage from "vite-plugin-react-og-image";

export default defineConfig({
  plugins: [
    react(),
    reactOgImage({
      // Specify the host for production builds
      host: "https://yourdomain.com",
    }),
  ],
});
```

### 2. Create your OG image component:

```tsx
// src/og-image.tsx (or .jsx, .ts, .js)
export default function OgImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 72,
        fontWeight: 600,
        textAlign: "center",
        padding: 40,
      }}
    >
      <div>Your Amazing App</div>
      <div style={{ fontSize: 36, opacity: 0.8, marginTop: 20 }}>
        This is a dynamic OG image!
      </div>
    </div>
  );
}
```

### 3. Complete!

The plugin automatically inserts the necessary `og:image` meta tag in your HTML. You can add other Open Graph meta tags as needed:

```html
<!-- index.html - Add these manually if needed -->
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Your page description" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com" />

<!-- Twitter Card meta tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Your Page Title" />
<meta name="twitter:description" content="Your page description" />
```

## How It Works

### Development Mode

- Access `/src/og-image` to preview your OG image (extension will be auto-detected)
- The plugin intercepts requests and generates PNG images on-the-fly

### Production Build

- Automatically generates static PNG images during build
- Updates HTML meta tags with hashed filenames
- Images are optimized and placed in the `dist/assets` directory

## Configuration Options

```typescript
interface OgImagePluginOptions {
  /**
   * The host URL for production builds
   * Used to generate absolute URLs in meta tags
   */
  host: string;

  /**
   * OG image component path
   * Extension is optional - will try .tsx, .jsx, .ts, .js in that order
   * @default './src/og-image'
   */
  componentPath?: string;

  /**
   * Image response options (from @vercel/og)
   * See: https://vercel.com/docs/functions/og-image-generation
   * Note: ResponseInit properties (status, headers, etc.) are not supported
   */
  imageResponseOptions?: {
    width?: number; // Default: 1200
    height?: number; // Default: 630
    emoji?: "twemoji" | "blobmoji" | "noto" | "openmoji";
    fonts?: Array<{
      name: string;
      data: ArrayBuffer;
      weight?: number;
      style?: "normal" | "italic";
    }>;
    debug?: boolean;
    // ... other @vercel/og options
  };
}
```

## Advanced Usage

### Custom Fonts

Use [@fontsource](https://fontsource.org/) packages for easy font integration:

```bash
pnpm add @fontsource/geist @fontsource/noto-serif-jp
```

```typescript
import { readFile } from "fs/promises";

export default defineConfig({
  plugins: [
    react(),
    reactOgImage({
      host: "https://yourdomain.com",
      imageResponseOptions: {
        fonts: [
          {
            name: "Geist",
            data: await readFile(
              "./node_modules/@fontsource/geist/files/geist-latin-700-normal.woff"
            ),
            weight: 700,
          },
          {
            name: "Noto Serif JP",
            data: await readFile(
              "./node_modules/@fontsource/noto-serif-jp/files/noto-serif-jp-japanese-400-normal.woff"
            ),
            weight: 400,
          },
        ],
      },
    }),
  ],
});
```

## Examples

Check out the [example](./example) directory for a complete working example.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [sunya9](https://github.com/sunya9)
