/**
 * プレイヤースプライト画像生成スクリプト（Node.js版）
 * 正方形を組み合わせたピクセルアート風スプライトシート
 */
const fs = require("fs");
const path = require("path");

// 出力ディレクトリ
const outputDir = path.join(
  __dirname,
  "src",
  "public",
  "images",
  "objects",
  "player"
);

// Canvas APIを使用するためのパッケージが必要
// npm install canvas

// ピクセルサイズ（各正方形のサイズ）
const PIXEL = 3;

// 正方形を描画するヘルパー関数
function drawSquare(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, PIXEL, PIXEL);
}

async function createSprites() {
  try {
    const { createCanvas } = require("canvas");

    console.log("Creating pixel-art player sprite sheets...");

    // idle.png - 4フレーム（緑）
    {
      const canvas = createCanvas(144, 36);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false; // ピクセルアートをシャープに

      for (let i = 0; i < 4; i++) {
        const offsetX = i * 36 + 9; // フレーム開始位置
        const bounce = Math.floor((i % 2) * 1.5); // 上下バウンス

        // 頭部（4x4の正方形）
        const headColor = "#4CAF50";
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            drawSquare(
              ctx,
              offsetX + x * PIXEL,
              6 + bounce * PIXEL + y * PIXEL,
              headColor
            );
          }
        }

        // 目（2つの白い正方形）
        drawSquare(ctx, offsetX + PIXEL, 9 + bounce * PIXEL, "#FFFFFF");
        drawSquare(ctx, offsetX + PIXEL * 2, 9 + bounce * PIXEL, "#FFFFFF");

        // 瞳
        drawSquare(ctx, offsetX + PIXEL, 9 + bounce * PIXEL, "#000000");
        drawSquare(ctx, offsetX + PIXEL * 2, 9 + bounce * PIXEL, "#000000");

        // 体部（3x3の正方形）
        const bodyColor = "#66BB6A";
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            if (x === 1 || y < 2) {
              // 中央と上2行
              drawSquare(
                ctx,
                offsetX + (x + 0.5) * PIXEL,
                18 + bounce * PIXEL + y * PIXEL,
                bodyColor
              );
            }
          }
        }

        // 腕（左右に1ピクセルずつ、フレームで動く）
        const armOffset = i % 2 === 0 ? 0 : PIXEL;
        drawSquare(ctx, offsetX - PIXEL, 21 - armOffset, "#388E3C");
        drawSquare(ctx, offsetX + 4 * PIXEL, 21 - armOffset, "#388E3C");

        // 足（2x1、交互に動く）
        const legColor = "#2E7D32";
        if (i % 2 === 0) {
          drawSquare(ctx, offsetX + PIXEL, 27, legColor);
          drawSquare(ctx, offsetX + PIXEL * 2, 28, legColor);
        } else {
          drawSquare(ctx, offsetX + PIXEL, 28, legColor);
          drawSquare(ctx, offsetX + PIXEL * 2, 27, legColor);
        }
      }

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(path.join(outputDir, "idle.png"), buffer);
      console.log("✓ idle.png created (4 frames - walking animation)");
    }

    // jumping.png - 2フレーム（青）
    {
      const canvas = createCanvas(72, 36);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      for (let i = 0; i < 2; i++) {
        const offsetX = i * 36 + 9;
        const stretch = i * 2; // 伸びるアニメーション

        // 頭部（4x4の正方形）
        const headColor = "#2196F3";
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            drawSquare(
              ctx,
              offsetX + x * PIXEL,
              4 - stretch * PIXEL + y * PIXEL,
              headColor
            );
          }
        }

        // 目（驚き表情 - 大きく）
        drawSquare(ctx, offsetX + PIXEL, 7 - stretch * PIXEL, "#FFFFFF");
        drawSquare(ctx, offsetX + PIXEL, 8 - stretch * PIXEL, "#FFFFFF");
        drawSquare(ctx, offsetX + PIXEL * 2, 7 - stretch * PIXEL, "#FFFFFF");
        drawSquare(ctx, offsetX + PIXEL * 2, 8 - stretch * PIXEL, "#FFFFFF");

        // 体部（伸びる）
        const bodyColor = "#42A5F5";
        const bodyHeight = 4 + stretch;
        for (let y = 0; y < bodyHeight; y++) {
          for (let x = 0; x < 3; x++) {
            if (x === 1 || y < bodyHeight - 1) {
              drawSquare(
                ctx,
                offsetX + (x + 0.5) * PIXEL,
                16 - stretch * PIXEL + y * PIXEL,
                bodyColor
              );
            }
          }
        }

        // 腕（上に伸ばす）
        const armColor = "#1565C0";
        const armY = 10 - stretch * PIXEL - i * PIXEL;
        drawSquare(ctx, offsetX - PIXEL, armY, armColor);
        drawSquare(ctx, offsetX - PIXEL, armY + PIXEL, armColor);
        drawSquare(ctx, offsetX + 4 * PIXEL, armY, armColor);
        drawSquare(ctx, offsetX + 4 * PIXEL, armY + PIXEL, armColor);

        // 足（伸ばす）
        const legColor = "#0D47A1";
        drawSquare(ctx, offsetX + PIXEL, 28, legColor);
        drawSquare(ctx, offsetX + PIXEL * 2, 28, legColor);
      }

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(path.join(outputDir, "jumping.png"), buffer);
      console.log("✓ jumping.png created (2 frames - jump stretch)");
    }

    // falling.png - 2フレーム（オレンジ）
    {
      const canvas = createCanvas(72, 36);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      for (let i = 0; i < 2; i++) {
        const offsetX = i * 36 + 9;
        const wobble = i * 2; // 揺れる動き

        // 頭部（4x4の正方形）
        const headColor = "#FF9800";
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            drawSquare(ctx, offsetX + x * PIXEL, 8 + y * PIXEL, headColor);
          }
        }

        // 目（心配そうな表情）
        drawSquare(ctx, offsetX + PIXEL, 11, "#FFFFFF");
        drawSquare(ctx, offsetX + PIXEL * 2, 11, "#FFFFFF");
        // 瞳（下を向いている）
        drawSquare(ctx, offsetX + PIXEL, 12, "#000000");
        drawSquare(ctx, offsetX + PIXEL * 2, 12, "#000000");

        // 体部（3x3の正方形）
        const bodyColor = "#FFA726";
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            if (x === 1 || y < 2) {
              drawSquare(
                ctx,
                offsetX + (x + 0.5) * PIXEL,
                20 + y * PIXEL,
                bodyColor
              );
            }
          }
        }

        // 腕（広げる - 左右に伸ばす）
        const armColor = "#E67E22";
        const armSpread = 2 + wobble;
        // 左腕
        for (let j = 0; j < 2; j++) {
          drawSquare(
            ctx,
            offsetX - PIXEL * armSpread - j * PIXEL,
            21,
            armColor
          );
        }
        // 右腕
        for (let j = 0; j < 2; j++) {
          drawSquare(
            ctx,
            offsetX + 4 * PIXEL + (armSpread - 1) * PIXEL + j * PIXEL,
            21,
            armColor
          );
        }

        // 足（バタバタ）
        const legColor = "#D84315";
        if (i === 0) {
          drawSquare(ctx, offsetX + PIXEL, 29, legColor);
          drawSquare(ctx, offsetX + PIXEL * 2, 30, legColor);
        } else {
          drawSquare(ctx, offsetX + PIXEL, 30, legColor);
          drawSquare(ctx, offsetX + PIXEL * 2, 29, legColor);
        }
      }

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(path.join(outputDir, "falling.png"), buffer);
      console.log("✓ falling.png created (2 frames - flailing arms)");
    }

    // dead.png - 1フレーム（赤）
    {
      const canvas = createCanvas(36, 36);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const offsetX = 6;

      // 頭部（横倒し - 4x4の正方形を横に）
      const headColor = "#F44336";
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          drawSquare(ctx, offsetX + x * PIXEL, 16 + y * PIXEL, headColor);
        }
      }

      // X目（左目）
      drawSquare(ctx, offsetX + PIXEL, 18, "#000000");
      drawSquare(ctx, offsetX + PIXEL * 2, 18, "#000000");
      drawSquare(ctx, offsetX + PIXEL, 19, "#FFFFFF");
      drawSquare(ctx, offsetX + PIXEL * 2, 19, "#FFFFFF");
      // X形
      drawSquare(ctx, offsetX + PIXEL, 18, "#323232");
      drawSquare(ctx, offsetX + PIXEL + PIXEL, 19, "#323232");
      drawSquare(ctx, offsetX + PIXEL, 20, "#323232");
      drawSquare(ctx, offsetX + PIXEL + PIXEL, 18, "#323232");

      // X目（右目）
      drawSquare(ctx, offsetX + PIXEL * 2, 18, "#323232");
      drawSquare(ctx, offsetX + PIXEL * 3, 19, "#323232");
      drawSquare(ctx, offsetX + PIXEL * 2, 20, "#323232");
      drawSquare(ctx, offsetX + PIXEL * 3, 18, "#323232");

      // 体部（横倒し）
      const bodyColor = "#E57373";
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 2; y++) {
          if (x > 0 && x < 5) {
            drawSquare(
              ctx,
              offsetX + 12 + x * PIXEL,
              19 + y * PIXEL,
              bodyColor
            );
          }
        }
      }

      // 腕と足（バラバラに）
      const limbColor = "#C62828";
      drawSquare(ctx, offsetX + PIXEL, 24, limbColor);
      drawSquare(ctx, offsetX + PIXEL * 4, 25, limbColor);
      drawSquare(ctx, offsetX + 27, 18, limbColor);
      drawSquare(ctx, offsetX + 30, 22, limbColor);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(path.join(outputDir, "dead.png"), buffer);
      console.log("✓ dead.png created (1 frame - knocked out)");
    }

    console.log("\n✨ All pixel-art sprites created successfully!");
    console.log(`Location: ${path.resolve(outputDir)}`);
    console.log("\n📐 Design: Square blocks (3x3px each)");
    console.log("🎨 Style: Retro pixel-art animation");
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error("\n❌ Error: canvas module not found");
      console.error("Please install it by running: npm install canvas");
      console.error(
        "\nAlternatively, use the simple version without canvas dependency."
      );
      process.exit(1);
    }
    throw error;
  }
}

createSprites();
