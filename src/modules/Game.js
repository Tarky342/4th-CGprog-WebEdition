import { AudioManager } from "./AudioManager.js";
import { BackgroundManager } from "./BackgroundManager.js";
import {
  BACKGROUND_LAYERS,
  CONFIG,
  ENEMY_SPRITES,
  OBJECT_TEMPLATES,
  PLAYER_SPRITES,
} from "./config.js";
import { GameState } from "./GameState.js";
import { ImageLoader } from "./ImageLoader.js";
import { InputManager } from "./InputManager.js";
import { ObstacleManager } from "./ObstacleManager.js";
import { Player } from "./Player.js";
import { clamp } from "./utils.js";

/**
 * メインゲームクラス
 * すべてのシステムを統合し、ゲームループを実行
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    // 画面サイズ
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.groundY = 0;

    // デバッグモード
    this.debugMode = true;

    // サブシステムの初期化
    this.imageLoader = new ImageLoader();
    this.state = new GameState();
    this.input = new InputManager(() => this.toggleDebug());
    this.audio = new AudioManager();

    // プレイヤーは初期化後に作成
    this.player = null;

    // 背景マネージャー（ctx依存なので後で初期化）
    this.backgroundManager = null;

    // 障害物マネージャー（groundY依存なので後で初期化）
    this.obstacleManager = null;

    // 着地点検索用のキャッシュ関数
    this.landingResolver = null;

    // タイムステップ
    this.lastTime = 0;
    this.accumulator = 0;

    // 攻撃関連
    this.projectiles = [];
    this.rangedCooldown = 0;

    // 画像プリロード
    this.preloadAssets();

    // リサイズハンドラ
    this.setupResize();
    this.resize();
  }

  /**
   * アセットをプリロード
   */
  preloadAssets() {
    const sources = [
      // プレイヤースプライト（状態別）
      ...Object.values(PLAYER_SPRITES).map((sprite) => sprite.path),
      // エネミースプライト
      ...Object.values(ENEMY_SPRITES).map((sprite) => sprite.path),
      // 障害物画像
      ...OBJECT_TEMPLATES.map((obj) => obj.img),
      // 背景画像
      ...BACKGROUND_LAYERS.map((bg) => bg.img),
    ];
    this.imageLoader.preloadAll(sources);
  }

  /**
   * リサイズハンドラをセットアップ
   */
  setupResize() {
    addEventListener("resize", () => this.resize(), { passive: true });
  }

  /**
   * 画面リサイズ処理
   */
  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.floor(innerWidth);
    this.height = Math.floor(innerHeight);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.groundY = this.height - CONFIG.GROUND_H;

    // 背景を再構築
    if (this.backgroundManager) {
      this.backgroundManager.markDirty();
    }

    // 障害物マネージャーのgroundY更新
    if (this.obstacleManager) {
      this.obstacleManager.updateGroundY(this.groundY);
    }
  }

  /**
   * ゲームを開始
   */
  start(autoStart = false) {
    // サブシステムの遅延初期化
    if (!this.backgroundManager) {
      this.backgroundManager = new BackgroundManager(
        this.ctx,
        this.imageLoader
      );
      this.backgroundManager.prepareAll();
    }

    if (!this.obstacleManager) {
      this.obstacleManager = new ObstacleManager(
        this.imageLoader,
        this.groundY
      );
    }

    // 着地検索は1つの関数インスタンスを再利用してGCを抑制
    if (!this.landingResolver) {
      this.landingResolver = (wx, w, prevBottom, currBottom) =>
        this.obstacleManager.findLandingY(wx, w, prevBottom, currBottom);
    }

    if (!this.player) {
      // ImageLoaderを渡してプレイヤーを初期化
      this.player = new Player(
        110,
        this.groundY - CONFIG.PLAYER_SIZE,
        this.imageLoader
      );
    }

    // 初期リセット
    this.reset();

    if (autoStart) {
      this.state.start();
    }

    // ゲームループ開始
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.tick(t));
  }

  /**
   * ゲームをリセット
   */
  reset() {
    this.state.reset();
    this.player.reset(this.groundY);
    this.obstacleManager.reset();
    this.backgroundManager.reset();
    this.obstacleManager.ensureGroundSegments(0, this.width);
    this.projectiles.length = 0;
    this.rangedCooldown = 0;
    // BGMを再開
    this.audio.playBGM("bgm");
  }

  /**
   * 入力処理
   */
  handleInput() {
    if (!this.input.consumePress()) return;

    if (this.state.isStart() || this.state.isGameOver()) {
      this.reset();
      this.state.start();
      return;
    }

    if (this.state.isRunning()) {
      this.player.jump();
      this.audio.play("jump");
    }
  }

  /**
   * 攻撃入力処理（遠距離攻撃）
   * @param {number} worldX - プレイヤーのワールドX
   */
  handleCombatInputs(worldX) {
    if (this.input.consumeRanged() && this.rangedCooldown <= 0) {
      this.spawnProjectile(worldX);
    }
  }

  /**
   * 固定タイムステップで更新
   */
  updateFixed(dt) {
    this.handleInput();

    if (!this.state.isRunning() || !this.player.alive) return;

    // クールダウンを進める（遠距離のみ）
    this.rangedCooldown = Math.max(0, this.rangedCooldown - dt);

    // 距離を進める（前進入力時のみ増加。後退は不可）
    let distDelta = 0;
    if (this.input.isForwardHeld()) {
      distDelta += CONFIG.SPEED * dt;
    }
    if (this.input.isBackwardHeld()) {
      distDelta -= CONFIG.SPEED * CONFIG.RETREAT_SPEED_RATE * dt;
    }

    if (distDelta !== 0) {
      const minDist = Math.max(
        0,
        this.state.getPeakDistance() - CONFIG.RETREAT_LIMIT
      );
      this.state.updateDistance(distDelta, minDist);
    }

    const currentDist = this.state.getDistance();

    // 攻撃入力処理
    this.handleCombatInputs(currentDist);

    // プレイヤー更新（足場当たり判定を考慮）
    this.player.update(dt, this.groundY, this.landingResolver, currentDist);

    // 落下死判定（画面外下）
    if (this.player.y > this.height + 200) {
      this.player.alive = false;
      this.state.gameOver();
      this.input.reset();
    }

    // 敵アニメーション更新
    this.obstacleManager.updateEnemyAnimations(dt);

    // 障害物更新
    this.obstacleManager.spawnObstacles(currentDist);
    this.obstacleManager.ensureGroundSegments(currentDist, this.width);
    this.obstacleManager.cullObstacles(currentDist);
    this.obstacleManager.cullGround(currentDist);

    // 飛び道具更新
    this.updateProjectiles(dt, currentDist);

    // 衝突判定（デバッグ時は無効化）
    if (!this.debugMode) {
      if (this.obstacleManager.checkCollisions(this.player, currentDist)) {
        this.player.alive = false;
        this.state.gameOver();
        this.input.reset();
        this.audio.play("dead");
      }
    }
  }

  /**
   * 飛び道具を生成
   * @param {number} worldX - プレイヤーのワールドX
   */
  spawnProjectile(worldX) {
    const projY = this.player.y + this.player.h * 0.45;
    this.projectiles.push({
      x: worldX + this.player.w,
      y: projY,
      w: CONFIG.PROJECTILE_SIZE,
      h: CONFIG.PROJECTILE_SIZE,
      life: CONFIG.PROJECTILE_LIFETIME,
    });

    this.rangedCooldown = CONFIG.PROJECTILE_COOLDOWN;
    this.audio.play("step");
  }

  /**
   * 飛び道具の更新と敵への当たり判定
   * @param {number} dt - デルタタイム
   * @param {number} currentDist - 現在のスクロール距離
   */
  updateProjectiles(dt, currentDist) {
    const speed = CONFIG.PROJECTILE_SPEED;
    let write = 0;

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      p.x += speed * dt;
      p.life -= dt;

      const hit = this.obstacleManager.hitEnemies(p);
      const outOfView =
        p.life <= 0 ||
        p.x > currentDist + this.width + 260 ||
        p.x < currentDist - 200;

      if (hit > 0 || outOfView) {
        continue;
      }

      this.projectiles[write++] = p;
    }

    this.projectiles.length = write;
  }

  /**
   * 飛び道具の描画
   * @param {number} distance - スクロール距離
   * @param {number} screenWidth - 画面幅
   */
  drawProjectiles(distance, screenWidth) {
    for (const p of this.projectiles) {
      const sx = p.x - distance + this.player.x;
      if (sx + p.w < -40 || sx > screenWidth + 40) continue;

      this.ctx.fillStyle = "#ffd24c";
      this.ctx.fillRect(sx, p.y, p.w, p.h);
    }
  }

  /**
   * 描画
   */
  draw() {
    // 背景クリア
    this.ctx.fillStyle = "#bdcaf4";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 背景描画
    this.backgroundManager.rebuildStatic(this.width, this.height, this.groundY);
    this.backgroundManager.draw(
      this.state.getDistance(),
      this.width,
      this.height,
      this.groundY,
      this.debugMode
    );

    // 地面ライン
    this.ctx.fillStyle = "rgba(255,255,255,.10)";
    this.ctx.fillRect(0, this.groundY, this.width, CONFIG.GROUND_H);
    this.ctx.fillStyle = "rgba(255,255,255,.18)";
    this.ctx.fillRect(0, this.groundY, this.width, 2);

    // 地面セグメント描画
    this.obstacleManager.drawGroundSegments(
      this.ctx,
      this.state.getDistance(),
      this.player.x,
      this.width,
      this.debugMode
    );

    // 障害物描画
    this.obstacleManager.drawObstacles(
      this.ctx,
      this.state.getDistance(),
      this.player.x,
      this.width,
      this.debugMode
    );

    // 飛び道具
    this.drawProjectiles(this.state.getDistance(), this.width);

    // プレイヤー描画
    this.player.draw(this.ctx, this.debugMode);

    // UI描画（距離表示など）
    this.drawUI();
  }

  /**
   * UI描画
   */
  drawUI() {
    // 距離表示
    this.ctx.fillStyle = "rgba(255,255,255,0.8)";
    this.ctx.font = "20px sans-serif";
    this.ctx.fillText(
      `Distance: ${Math.floor(this.state.getDistance())}`,
      10,
      30
    );

    // 状態表示
    if (this.state.isStart()) {
      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "40px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Click to Start", this.width / 2, this.height / 2);
      this.ctx.textAlign = "left";
    } else if (this.state.isGameOver()) {
      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "40px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Game Over", this.width / 2, this.height / 2 - 30);
      this.ctx.font = "24px sans-serif";
      this.ctx.fillText(
        `Distance: ${Math.floor(this.state.getDistance())}`,
        this.width / 2,
        this.height / 2 + 10
      );
      this.ctx.fillText(
        "Click to Restart",
        this.width / 2,
        this.height / 2 + 50
      );
      this.ctx.textAlign = "left";
    }

    // デバッグモード表示
    if (this.debugMode) {
      this.ctx.fillStyle = "rgba(255,0,0,0.8)";
      this.ctx.font = "16px sans-serif";
      this.ctx.fillText("DEBUG MODE", 10, 60);
    }
  }

  /**
   * ゲームループ
   */
  tick(now) {
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.033);
    this.lastTime = now;

    this.accumulator += dt;
    this.accumulator = Math.min(this.accumulator, CONFIG.MAX_ACCUM);

    // 固定タイムステップで更新
    while (this.accumulator >= CONFIG.FIXED_DT) {
      this.updateFixed(CONFIG.FIXED_DT);
      this.accumulator -= CONFIG.FIXED_DT;
    }

    // 描画
    this.draw();

    // 次のフレーム
    requestAnimationFrame((t) => this.tick(t));
  }

  /**
   * デバッグモードの切り替え
   */
  toggleDebug() {
    this.debugMode = !this.debugMode;
  }
}
