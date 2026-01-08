import { defineConfig } from "vite";
import imagemin from "vite-plugin-imagemin";

export default defineConfig({
  root: "src",
  base: process.env.VITE_BASE_URL || "./",
  publicDir: "../public",
  server: {
    port: 5500,
    open: true,
    middlewareMode: false,
  },
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [{ name: "removeViewBox" }, { name: "removeEmptyAttrs" }],
      },
    }),
  ],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
});
