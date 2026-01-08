import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.resolve(__dirname, "../public/images");

async function ensureInput() {
  try {
    await access(inputDir);
  } catch (error) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }
}

async function optimize() {
  await ensureInput();
  const glob = path.posix.join(
    inputDir.replace(/\\/g, "/"),
    "**/*.{png,jpg,jpeg,gif,svg}"
  );
  const files = await imagemin([glob], {
    destination: inputDir,
    plugins: [
      imageminGifsicle({ optimizationLevel: 3 }),
      imageminMozjpeg({ quality: 80 }),
      imageminPngquant({ quality: [0.8, 0.9], speed: 4 }),
      imageminSvgo({
        plugins: [{ name: "removeViewBox" }, { name: "removeEmptyAttrs" }],
      }),
    ],
  });
  console.log(`Optimized ${files.length} images in ${inputDir}`);
}

optimize().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
