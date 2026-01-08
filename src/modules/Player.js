import { CONFIG, PLAYER_SPRITES } from "./config.js";
import { clamp } from "./utils.js";

/**
 * プレイヤー状態の列挙型
 */
export const PlayerState = {
  IDLE: "idle", // 着地状態
  JUMPING: "jumping", // ジャンプ中
  FALLING: "falling", // 落下中
  DEAD: "dead", // 死亡
};

/**
 * プレイヤークラス
 */
export class Player {
  /**
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {ImageLoader} imageLoader - 画像ローダー
   */
  constructor(x, y, imageLoader = null) {
    this.x = x;
    this.y = y;
    this.w = CONFIG.PLAYER_SIZE;
    this.h = CONFIG.PLAYER_SIZE;
    this.vy = 0;
    this.onGround = true;
    this.alive = true;

    // プレイヤー状態管理
    this.state = PlayerState.IDLE;
    this.previousState = null;

    // ImageLoaderを保持
    this.imageLoader = imageLoader;

    // スプライト画像マップ（状態別）
    this.spriteImages = {};
    if (imageLoader) {
      Object.keys(PLAYER_SPRITES).forEach((state) => {
        this.spriteImages[state] = imageLoader.load(PLAYER_SPRITES[state].path);
      });
    }

    // スプライトアニメーション
    this.currentFrame = 0;
    this.frameTime = 0;

    // 状態別アニメーション設定（configから読み込み）
    this.spriteConfig = {};
    Object.keys(PLAYER_SPRITES).forEach((state) => {
      const cfg = PLAYER_SPRITES[state];
      this.spriteConfig[state] = {
        frameCount: cfg.frameCount,
        frameDelay: cfg.frameDelay,
        loop: cfg.loop,
      };
    });

    // 初期フレーム設定
    this.frameCount = this.spriteConfig[this.state].frameCount;
    this.frameDelay = this.spriteConfig[this.state].frameDelay;
  }

  /**
   * プレイヤーをリセット
   * @param {number} groundY - 地面のY座標
   */
  reset(groundY) {
    this.w = CONFIG.PLAYER_SIZE;
    this.h = CONFIG.PLAYER_SIZE;
    this.vy = 0;
    this.alive = true;
    this.y = groundY - this.h;
    this.onGround = true;
    this.state = PlayerState.IDLE;
    this.previousState = null;
    this.currentFrame = 0;
    this.frameTime = 0;
  }

  /**
   * 状態を設定し、アニメーションをリセット
   * @param {string} newState - 新しい状態
   */
  setState(newState) {
    if (this.state !== newState) {
      this.previousState = this.state;
      this.state = newState;
      this.currentFrame = 0;
      this.frameTime = 0;

      // 新しい状態のスプライト設定を適用
      const config = this.spriteConfig[newState];
      if (config) {
        this.frameCount = config.frameCount;
        this.frameDelay = config.frameDelay;
      }
    }
  }

  /**
   * 現在の状態を取得
   * @returns {string} プレイヤー状態
   */
  getState() {
    return this.state;
  }

  /**
   * 現在の状態に対応するスプライト画像を取得
   * @returns {HTMLImageElement|null} スプライト画像
   */
  getCurrentSprite() {
    return this.spriteImages[this.state] || null;
  }

  /**
   * 状態遷移ロジック（内部）
   */
  updateState() {
    if (!this.alive) {
      this.setState(PlayerState.DEAD);
      return;
    }

    if (this.onGround) {
      // 着地状態
      this.setState(PlayerState.IDLE);
    } else if (this.vy < 0) {
      // 上昇中（ジャンプ）
      this.setState(PlayerState.JUMPING);
    } else {
      // 下降中（落下）
      this.setState(PlayerState.FALLING);
    }
  }

  /**
   * ジャンプ
   */
  jump() {
    if (this.onGround) {
      this.vy = -CONFIG.JUMP_VEL;
      this.onGround = false;
    }
  }

  /**
   * 更新
   * @param {number} dt - デルタタイム
   * @param {number} groundY - 地面のY座標
   */
  update(dt, groundY, platformsOrLanding = [], playerWorldX = 0) {
    const prevY = this.y;

    // 重力適用
    this.vy += CONFIG.GRAVITY * dt;
    this.vy = clamp(this.vy, -99999, CONFIG.MAX_FALL);
    this.y += this.vy * dt;

    let landed = false;
    const prevBottom = prevY + this.h;
    const currBottom = this.y + this.h;

    // 足場との当たり判定（トップ面だけで乗れる）
    if (this.vy >= 0) {
      if (typeof platformsOrLanding === "function") {
        const hitTop = platformsOrLanding(
          playerWorldX,
          this.w,
          prevBottom,
          currBottom
        );
        if (hitTop !== null && hitTop !== undefined) {
          this.y = hitTop - this.h;
          this.vy = 0;
          this.onGround = true;
          landed = true;
        }
      } else if (platformsOrLanding.length) {
        const px0 = playerWorldX;
        const px1 = playerWorldX + this.w;
        let bestTop = Infinity;

        const tol = 1.5; // 着地漏れを防ぐための縦方向緩衝

        for (const p of platformsOrLanding) {
          const top = p.y;
          const left = p.x;
          const right = p.x + p.w;
          const wasAbove = prevBottom <= top + tol;
          const crossesTop = currBottom >= top - tol;
          const horizontalOverlap = px1 > left && px0 < right;

          if (wasAbove && crossesTop && horizontalOverlap) {
            if (top < bestTop) {
              bestTop = top;
            }
          }
        }

        if (bestTop !== Infinity) {
          this.y = bestTop - this.h;
          this.vy = 0;
          this.onGround = true;
          landed = true;
        }
      }
    }

    // 足場なし: 落下継続
    if (!landed) {
      this.onGround = false;
    }

    // 状態更新
    this.updateState();

    // アニメーション更新（状態に応じたフレーム制御）
    const config = this.spriteConfig[this.state];
    if (config) {
      this.frameCount = config.frameCount;
      this.frameDelay = config.frameDelay;
    }

    const spriteImage = this.getCurrentSprite();
    if (spriteImage && config && config.frameCount > 0) {
      this.frameTime += dt;
      if (this.frameTime >= this.frameDelay) {
        this.frameTime -= this.frameDelay;
        // ループ設定に基づいてフレーム進める
        if (config.loop) {
          this.currentFrame = (this.currentFrame + 1) % config.frameCount;
        } else if (this.currentFrame < config.frameCount - 1) {
          this.currentFrame++;
        }
      }
    }
  }

  /**
   * 描画
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {boolean} debugMode - デバッグモード
   */
  draw(ctx, debugMode = false) {
    // 現在の状態に対応するスプライト画像を取得
    const spriteImage = this.getCurrentSprite();

    // スプライトアニメーションが有効な場合（画像が正常に読み込まれている）
    if (
      spriteImage &&
      spriteImage.complete &&
      spriteImage.naturalWidth > 0 &&
      this.frameCount > 0
    ) {
      const frameWidth = spriteImage.width / this.frameCount;
      const frameHeight = spriteImage.height;
      const sx = this.currentFrame * frameWidth;

      ctx.drawImage(
        spriteImage,
        sx,
        0,
        frameWidth,
        frameHeight, // ソース領域
        this.x,
        this.y,
        this.w,
        this.h // 描画先
      );
    } else {
      // フォールバック: 単色矩形（状態に応じた色分け）
      const stateColors = {
        [PlayerState.IDLE]: "#4CAF50",
        [PlayerState.JUMPING]: "#2196F3",
        [PlayerState.FALLING]: "#FF9800",
        [PlayerState.DEAD]: "#F44336",
      };
      ctx.fillStyle = stateColors[this.state] || "#e9eefc";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    // デバッグ枠
    if (debugMode) {
      ctx.strokeStyle = "rgba(0,0,255,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      // 状態テキスト表示
      ctx.fillStyle = "#000";
      ctx.font = "10px monospace";
      ctx.fillText(this.state, this.x, this.y - 5);
    }
  }
}
