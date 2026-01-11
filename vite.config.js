import { defineConfig } from "vite";
import { resolve } from "path";
import imagemin from "vite-plugin-imagemin";

export default defineConfig({
  root: "src",
  // Use relative base so the site works both on GitHub Pages subpaths and local preview
  base: "./",
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
    rollupOptions: {
      // Ensure Slide.html and /Slide/ redirect are emitted to dist for GitHub Pages access
      input: {
        main: resolve(__dirname, "src/index.html"),
        slide: resolve(__dirname, "src/Slide.html"),
        slideRedirect: resolve(__dirname, "src/Slide/index.html"),
      },
    },
  },
});
