import { BACKGROUND_LAYERS } from "./config.js";

/**
 * 背景マネージャークラス
 * パララックス背景を管理
 */
export class BackgroundManager {
  /**
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {import('./ImageLoader.js').ImageLoader} imageLoader - 画像ローダー
   */
  constructor(ctx, imageLoader) {
    this.ctx = ctx;
    this.imageLoader = imageLoader;
    this.layers = BACKGROUND_LAYERS.map((bg) => ({ ...bg, enabled: true }));
    this.staticDirty = true;
    this.lastDrawTime = performance.now();
  }

  /**
   * 静的レイヤーの再構築フラグを立てる
   */
  markDirty() {
    this.staticDirty = true;
  }

  /**
   * すべてのレイヤーを準備
   */
  prepareAll() {
    this.layers.forEach((bg) => this.prepareLayer(bg));
  }

  /**
   * レイヤーを準備（画像の事前縮小とパターン化）
   * @param {Object} bg - 背景レイヤー設定
   */
  prepareLayer(bg) {
    const img = this.imageLoader.load(bg.img);
    if (!img.complete || !img.naturalWidth) {
      img.onload = () => this.prepareLayer(bg);
      return;
    }

    const scale = bg.scale || 1;
    const drawW = Math.round(img.naturalWidth * scale);
    const drawH = Math.round(img.naturalHeight * scale);
    const spacing = Math.round(drawW * (bg.repeatSpacing || 1));

    const sameSize =
      bg.drawW === drawW &&
      bg.drawH === drawH &&
      bg.periodW === spacing &&
      bg.pattern;

    bg.drawW = drawW;
    bg.drawH = drawH;

    if (bg.mode === "single") {
      bg.ready = true;
      if (bg.speed === 0) this.staticDirty = true;
      return;
    }

    if (sameSize) {
      bg.ready = true;
      return;
    }

    const off = document.createElement("canvas");
    off.width = spacing;
    off.height = drawH;
    const offCtx = off.getContext("2d");
    offCtx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      0,
      0,
      drawW,
      drawH
    );

    bg.drawW = drawW;
    bg.drawH = drawH;
    bg.periodW = spacing;
    bg.pattern = this.ctx.createPattern(off, "repeat-x");
    bg.ready = !!bg.pattern;

    if (bg.speed === 0) this.staticDirty = true;
  }

  /**
   * レイヤーのオフセットY座標を計算
   * @param {Object} bg - 背景レイヤー
   * @param {number} tileH - タイル高さ
   * @param {number} groundY - 地面Y座標
   * @returns {number} オフセットY
   */
  getLayerOffsetY(bg, tileH, groundY) {
    const anchor = bg.anchor || "center";
    if (anchor === "ground" || anchor === "groundTop") {
      return groundY - tileH + (bg.offsetY || 0);
    }
    if (anchor === "bottom") {
      return this.height - tileH + (bg.offsetY || 0);
    }
    return (this.height - tileH) * 0.5 + (bg.offsetY || 0);
  }

  /**
   * 静的レイヤーを再構築
   * @param {number} width - 画面幅
   * @param {number} height - 画面高さ
   * @param {number} groundY - 地面Y座標
   */
  rebuildStatic(width, height, groundY) {
    if (!this.staticDirty) return;
    this.staticDirty = false;
    this.height = height;

    for (const bg of this.layers) {
      if (bg.enabled === false) continue;
      if (bg.independent || bg.speed !== 0 || !bg.ready || !bg.drawH) continue;

      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d");

      if (bg.mode === "single") {
        const img = this.imageLoader.load(bg.img);
        if (!img.complete || !img.naturalWidth) continue;
        const offsetX = (width - bg.drawW) * 0.5 + (bg.offsetX || 0);
        const offsetY = this.getLayerOffsetY(bg, bg.drawH, groundY);
        offCtx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          offsetX,
          offsetY,
          bg.drawW,
          bg.drawH
        );
        bg.staticCanvas = off;
        continue;
      }

      if (!bg.pattern) continue;
      const tileW = bg.periodW || bg.drawW;
      const tileH = bg.drawH;
      const offsetY = this.getLayerOffsetY(bg, tileH, groundY);

      offCtx.fillStyle = bg.pattern;
      offCtx.fillRect(-tileW, offsetY, width + tileW * 2, tileH);

      bg.staticCanvas = off;
    }
  }

  /**
   * 背景を描画
   * @param {number} distance - スクロール距離
   * @param {number} width - 画面幅
   * @param {number} height - 画面高さ
   * @param {number} groundY - 地面Y座標
   * @param {boolean} debugMode - デバッグモード
   */
  draw(distance, width, height, groundY, debugMode = false) {
    this.height = height;
    const now = performance.now();
    const dt = Math.max(0, Math.min((now - this.lastDrawTime) / 1000, 0.1));
    this.lastDrawTime = now;

    for (const bg of this.layers) {
      if (bg.enabled === false) continue;

      if (bg.independent) {
        const speed = bg.independentSpeed ?? 0;
        bg.independentOffset = (bg.independentOffset || 0) + speed * dt;
      }

      const scrollX = bg.independent
        ? bg.independentOffset || 0
        : distance * bg.speed;

      // 静的レイヤー
      if (bg.speed === 0 && bg.staticCanvas) {
        this.ctx.drawImage(bg.staticCanvas, 0, 0);
        continue;
      }

      if (!bg.ready || !bg.drawW || !bg.drawH) continue;

      // 単一画像モード
      if (bg.mode === "single") {
        const img = this.imageLoader.load(bg.img);
        if (!img.complete || !img.naturalWidth) continue;
        const baseX = (width - bg.drawW) * 0.5 + (bg.offsetX || 0) - scrollX;
        const offsetY = this.getLayerOffsetY(bg, bg.drawH, groundY);
        this.ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          baseX,
          offsetY,
          bg.drawW,
          bg.drawH
        );

        // デバッグ枠
        if (debugMode) {
          this.ctx.strokeStyle = "rgba(255,0,255,0.6)";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(baseX, offsetY, bg.drawW, bg.drawH);
        }
        continue;
      }

      // セグメント描画
      if (bg.segment) {
        const img = this.imageLoader.load(bg.img);
        if (!img.complete || !img.naturalWidth) continue;

        const tileW = bg.drawW;
        const spacing = Math.round(tileW * (bg.repeatSpacing || 1));
        const tileH = bg.drawH;
        const offsetY = this.getLayerOffsetY(bg, tileH, groundY);
        let startX = -(((scrollX % spacing) + spacing) % spacing) - spacing;

        for (let x = startX; x < width + spacing * 2; x += spacing) {
          const dx = x + (bg.offsetX || 0);
          this.ctx.drawImage(
            img,
            0,
            0,
            img.naturalWidth,
            img.naturalHeight,
            dx,
            offsetY,
            bg.drawW,
            bg.drawH
          );

          // デバッグ枠
          if (debugMode) {
            this.ctx.strokeStyle = "rgba(255,128,0,0.6)";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(dx, offsetY, bg.drawW, bg.drawH);
          }
        }
        continue;
      }

      // パターン描画
      if (!bg.pattern) continue;

      const tileW = bg.periodW || bg.drawW;
      const tileH = bg.drawH;
      const offsetX = -(((scrollX % tileW) + tileW) % tileW);
      const offsetY = this.getLayerOffsetY(bg, tileH, groundY);

      this.ctx.save();
      this.ctx.translate(offsetX, offsetY);
      this.ctx.fillStyle = bg.pattern;
      this.ctx.fillRect(-tileW, 0, width + tileW * 2, tileH);

      // デバッグ枠
      if (debugMode) {
        this.ctx.strokeStyle = "rgba(0,255,255,0.6)";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-tileW, 0, width + tileW * 2, tileH);
      }

      this.ctx.restore();
    }
  }

  /**
   * リセット（レイヤーの有効/無効をランダム化）
   */
  reset() {
    this.layers.forEach((bg) => {
      bg.enabled = bg.prob === undefined ? true : Math.random() < bg.prob;
      bg.independentOffset = 0;
    });
    this.staticDirty = true;
    this.lastDrawTime = performance.now();
  }
}
