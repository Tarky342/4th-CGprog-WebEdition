import { CONFIG, OBJECT_TEMPLATES, OBSTACLE_PATTERNS } from "./config.js";
import { pickWeighted, rectsOverlap, rnd } from "./utils.js";

/**
 * 障害物マネージャークラス
 * 障害物と地面タイルの生成・管理を行う
 */
export class ObstacleManager {
  /**
   * @param {import('./ImageLoader.js').ImageLoader} imageLoader - 画像ローダー
   * @param {number} groundY - 地面Y座標
   */
  constructor(imageLoader, groundY) {
    this.imageLoader = imageLoader;
    this.groundY = groundY;

    /** @type {Array<Object>} */
    this.obstacles = [];
    this.nextObsX = 0;

    /** @type {Array<Object>} */
    this.groundSegments = [];
    this.nextGroundX = 0;
    this.gapCooldown = 0;

    // 障害物プール（事前フィルタリング）
    // エネミーは通常の障害物として生成されないように除外
    this.airPool = OBJECT_TEMPLATES.filter((o) => o.allowAir && !o.isEnemy);
    this.groundPool = OBJECT_TEMPLATES.filter(
      (o) => o.allowGround !== false && !o.isEnemy
    );
    this.groundTiles = OBJECT_TEMPLATES.filter((o) => o.topAlignGround);

    // パターンプール
    this.patternPool = OBSTACLE_PATTERNS.filter(
      (p) => p.obstacles && p.obstacles.length > 0
    );
  }

  /**
   * 足場として扱う当たり判定矩形を取得（ワールド座標）
   * @returns {Array<{x:number,y:number,w:number,h:number}>}
   */
  getColliders() {
    return [
      ...this.obstacles.map((o) => ({ x: o.x, y: o.y, w: o.w, h: o.h })),
      ...this.groundSegments.map((g) => ({ x: g.x, y: g.y, w: g.w, h: g.h })),
    ];
  }

  /**
   * 足場のトップ面を走査し、着地可能なYを返す（なければnull）。
   * 配列生成を避けつつ左右と上下の範囲を絞って探索する。
   * @param {number} worldX - プレイヤーのワールドX
   * @param {number} width - プレイヤー幅
   * @param {number} prevBottom - 前フレームのプレイヤー底Y
   * @param {number} currBottom - 今フレームのプレイヤー底Y
   * @param {number} margin - 横方向の余白
   * @returns {number|null} 着地Y
   */
  findLandingY(worldX, width, prevBottom, currBottom, margin = 8) {
    const rangeStart = worldX - margin;
    const rangeEnd = worldX + width + margin;
    const tol = 1.5; // 浮動誤差吸収を少し広げて着地漏れを防ぐ
    let bestTop = Infinity;

    const sweep = (list) => {
      for (let i = 0; i < list.length; i++) {
        const p = list[i];

        // 左に離れすぎ→次へ、右に超えたら打ち切り（昇順前提）
        if (p.x + p.w < rangeStart) continue;
        if (p.x > rangeEnd) break;

        const top = p.y;
        const wasAbove = prevBottom <= top + tol;
        const crossesTop = currBottom >= top - tol;

        if (wasAbove && crossesTop) {
          if (top < bestTop) bestTop = top;
        }
      }
    };

    sweep(this.groundSegments);
    sweep(this.obstacles);

    return bestTop === Infinity ? null : bestTop;
  }

  /**
   * 地面Y座標を更新
   * @param {number} groundY - 新しい地面Y座標
   */
  updateGroundY(groundY) {
    this.groundY = groundY;
  }

  /**
   * リセット
   */
  reset() {
    this.obstacles.length = 0;
    this.groundSegments.length = 0;
    this.nextObsX = rnd(CONFIG.SPAWN_AHEAD_MIN, CONFIG.SPAWN_AHEAD_MAX);
    this.nextGroundX = -200;
    this.gapCooldown = 0;
  }

  /**
   * 敵のアニメーションを更新（プレイヤーと同じパターン）
   * @param {number} dt - デルタタイム（秒）
   */
  updateEnemyAnimations(dt) {
    for (const o of this.obstacles) {
      if (!o.isEnemy) continue;

      // フレーム時間を進める
      o.frameTime = (o.frameTime || 0) + dt;

      // フレーム切り替えタイミング
      if (o.frameTime >= o.frameDelay) {
        o.frameTime -= o.frameDelay;

        // ループ設定に基づいてフレームを進める
        if (o.loop !== false) {
          // ループする場合（デフォルト）
          o.currentFrame = (o.currentFrame + 1) % o.frameCount;
        } else if (o.currentFrame < o.frameCount - 1) {
          // ループしない場合は最後のフレームで停止
          o.currentFrame++;
        }
      }
    }
  }

  /**
   * 障害物を生成
   * @param {number} currentDist - 現在の距離
   */
  spawnObstacles(currentDist) {
    if (!this.groundPool.length) return;

    const spawnAhead = rnd(CONFIG.SPAWN_AHEAD_MIN, CONFIG.SPAWN_AHEAD_MAX);
    const spawnLimit = currentDist + spawnAhead;

    while (this.nextObsX < spawnLimit) {
      // パターン生成かランダム生成か選択
      const usePattern =
        this.patternPool.length > 0 && Math.random() < CONFIG.PATTERN_RATE;

      if (usePattern) {
        this.spawnPattern();
      } else {
        this.spawnSingleObstacle();
      }
    }
  }

  /**
   * Y座標を計算（空中/地面共通ロジック）
   * @param {Object} template - テンプレート
   * @param {string} type - 「air」または「ground」
   * @param {number} [baseLift] - 基本リフト値
   * @returns {number} Y座標
   */
  calculateY(template, type, baseLift = 0) {
    const h = template.h;
    if (type === "air") {
      const lift = baseLift || rnd(CONFIG.AIR_LIFT_MIN, CONFIG.AIR_LIFT_MAX);
      const jitter = template.airLiftJitter
        ? rnd(-template.airLiftJitter * 0.3, template.airLiftJitter * 0.3)
        : 0;
      return this.groundY - h - lift + jitter;
    } else {
      const jitter = template.groundJitter
        ? rnd(-template.groundJitter, template.groundJitter)
        : 0;
      return Math.min(this.groundY - h, this.groundY - h + jitter);
    }
  }

  /**
   * エネミーのアニメーション属性を初期化
   * @param {Object} obstacle - 障害物オブジェクト
   * @param {Object} template - テンプレート
   */
  initEnemyAnimation(obstacle, template) {
    obstacle.currentFrame = 0;
    obstacle.frameTime = 0;
    obstacle.frameCount = template.frameCount || 4;
    obstacle.frameDelay = template.frameDelay || 0.15;
    obstacle.loop = template.loop !== undefined ? template.loop : true;
  }

  /**
   * パターンベースで障害物を生成
   */
  spawnPattern() {
    const pattern = pickWeighted(this.patternPool, "weight");
    const baseX = this.nextObsX;
    let maxWidth = 0;

    for (const obstacleData of pattern.obstacles) {
      const template = OBJECT_TEMPLATES[obstacleData.templateIndex];
      if (!template) continue;

      const w = template.w;
      const x = baseX + obstacleData.offsetX;
      const baseLift = obstacleData.liftOffset ? -obstacleData.liftOffset : 0;
      const y = this.calculateY(template, obstacleData.type, baseLift);

      const obstacle = {
        x,
        y,
        w,
        h: template.h,
        img: template.img,
        drawOffsetX: template.drawOffsetX || 0,
        kind: obstacleData.type || "ground",
        isEnemy: template.isEnemy || false,
      };

      // エネミーの場合、アニメーション属性を初期化
      if (obstacle.isEnemy) {
        this.initEnemyAnimation(obstacle, template);
      }

      this.obstacles.push(obstacle);

      maxWidth = Math.max(maxWidth, obstacleData.offsetX + w);
    }

    // パターン全体の幅 + 基本ギャップ
    this.nextObsX +=
      maxWidth + rnd(CONFIG.OBSTACLE_GAP_MIN, CONFIG.OBSTACLE_GAP_MAX);
  }

  /**
   * 単一障害物を生成（エネミーはパターン化）
   */
  spawnSingleObstacle() {
    // エネミーを生成する場合は、必ず足場とセットで生成
    const spawnEnemy = Math.random() < 0.15; // 敵の生成確率
    const enemyTemplate = OBJECT_TEMPLATES.find((t) => t.isEnemy);

    if (spawnEnemy && enemyTemplate) {
      // エネミーは必ず足場の上に配置
      const useAir = Math.random() < 0.5;
      const pool = useAir ? this.airPool : this.groundPool;
      const platformTemplate =
        pool[Math.floor(Math.random() * Math.min(2, pool.length))];

      if (!platformTemplate) return;

      // 足場を生成
      const platformW = platformTemplate.w;
      const platformH = platformTemplate.h;
      const platformY = this.calculateY(
        platformTemplate,
        useAir ? "air" : "ground"
      );

      this.obstacles.push({
        x: this.nextObsX,
        y: platformY,
        w: platformW,
        h: platformH,
        img: platformTemplate.img,
        drawOffsetX: platformTemplate.drawOffsetX || 0,
        kind: useAir ? "air" : "ground",
        isEnemy: false,
      });

      // エネミーを足場の上に配置
      const enemyW = enemyTemplate.w;
      const enemyH = enemyTemplate.h;
      const enemyX = this.nextObsX + (platformW - enemyW) / 2; // 中央配置
      const enemyY = platformY - enemyH; // 足場の上

      const enemy = {
        x: enemyX,
        y: enemyY,
        w: enemyW,
        h: enemyH,
        img: enemyTemplate.img,
        drawOffsetX: enemyTemplate.drawOffsetX || 0,
        kind: useAir ? "air" : "ground",
        isEnemy: true,
      };

      this.initEnemyAnimation(enemy, enemyTemplate);
      this.obstacles.push(enemy);

      this.nextObsX +=
        platformW + rnd(CONFIG.OBSTACLE_GAP_MIN, CONFIG.OBSTACLE_GAP_MAX);
    } else {
      // 通常の障害物（足場のみ）
      const useAir = this.airPool.length && Math.random() < CONFIG.AIR_RATE;
      const pool = useAir ? this.airPool : this.groundPool;
      const objConfig = pickWeighted(pool);

      const w = objConfig.w;
      const h = objConfig.h;
      const y = this.calculateY(objConfig, useAir ? "air" : "ground");

      this.obstacles.push({
        x: this.nextObsX,
        y,
        w,
        h,
        img: objConfig.img,
        drawOffsetX: objConfig.drawOffsetX || 0,
        kind: useAir ? "air" : "ground",
        isEnemy: false,
      });

      this.nextObsX +=
        rnd(CONFIG.OBSTACLE_GAP_MIN, CONFIG.OBSTACLE_GAP_MAX) *
        (0.92 + Math.random() * 0.35);
    }
  }

  /**
   * 地面セグメントを生成
   * @param {number} currentDist - 現在の距離
   * @param {number} screenWidth - 画面幅
   */
  ensureGroundSegments(currentDist, screenWidth) {
    if (!this.groundTiles.length) return;
    const targetEnd = currentDist + screenWidth + 400;

    while (this.nextGroundX < targetEnd) {
      const prevX = this.nextGroundX;

      // ランダムに穴を開ける
      if (
        this.nextGroundX > currentDist + 120 &&
        this.gapCooldown <= 0 &&
        Math.random() < CONFIG.VOID_GAP_RATE
      ) {
        const gap = rnd(CONFIG.VOID_GAP_MIN, CONFIG.VOID_GAP_MAX);
        this.nextGroundX += gap;
        this.gapCooldown = rnd(
          CONFIG.VOID_GAP_COOLDOWN_MIN,
          CONFIG.VOID_GAP_COOLDOWN_MAX
        );
        this.gapCooldown = Math.max(0, this.gapCooldown);
        continue;
      }

      const tile = pickWeighted(this.groundTiles);
      this.groundSegments.push({
        x: this.nextGroundX,
        y: this.groundY,
        w: tile.w,
        h: tile.h,
        img: tile.img,
        drawOffsetX: tile.drawOffsetX || 0,
      });

      const baseGap = tile.w > 140 ? rnd(20, 60) : rnd(-12, 12);
      this.nextGroundX += tile.w + baseGap;

      const advanced = this.nextGroundX - prevX;
      if (advanced > 0) {
        this.gapCooldown = Math.max(0, this.gapCooldown - advanced);
      }
    }
  }

  /**
   * 画面外の障害物を削除
   * @param {number} currentDist - 現在の距離
   */
  cullObstacles(currentDist) {
    const leftCullX = currentDist - 300;
    let write = 0;
    for (let i = 0; i < this.obstacles.length; i++) {
      const o = this.obstacles[i];
      if (o.x > leftCullX) this.obstacles[write++] = o;
    }
    this.obstacles.length = write;
  }

  /**
   * 画面外の地面セグメントを削除
   * @param {number} currentDist - 現在の距離
   */
  cullGround(currentDist) {
    const leftCullX = currentDist - 400;
    let write = 0;
    for (let i = 0; i < this.groundSegments.length; i++) {
      const g = this.groundSegments[i];
      if (g.x + g.w > leftCullX) this.groundSegments[write++] = g;
    }
    this.groundSegments.length = write;
  }

  /**
   * 衝突判定
   * @param {import('./Player.js').Player} player - プレイヤー
   * @param {number} worldX - ワールド座標X
   * @returns {boolean} 衝突したかどうか
   */
  checkCollisions(player, worldX) {
    const py = player.y;
    const pw = player.w;
    const ph = player.h;

    for (const o of this.obstacles) {
      // if (rectsOverlap(worldX, py, pw, ph, o.x, o.y, o.w, o.h)) {
      //   return true;
      // }
    }
    return false;
  }

  /**
   * プレイヤー攻撃の当たり判定（敵のみ破壊）
   * @param {{x:number,y:number,w:number,h:number}} hitbox - 攻撃判定（ワールド座標）
   * @returns {number} 破壊できた敵の数
   */
  hitEnemies(hitbox) {
    let removed = 0;
    let write = 0;

    for (let i = 0; i < this.obstacles.length; i++) {
      const o = this.obstacles[i];
      const hit =
        o.isEnemy &&
        rectsOverlap(
          hitbox.x,
          hitbox.y,
          hitbox.w,
          hitbox.h,
          o.x,
          o.y,
          o.w,
          o.h
        );

      if (hit) {
        removed++;
        continue;
      }

      this.obstacles[write++] = o;
    }

    this.obstacles.length = write;
    return removed;
  }

  /**
   * 地面セグメントを描画
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {number} distance - スクロール距離
   * @param {number} playerX - プレイヤーX座標
   * @param {number} screenWidth - 画面幅
   * @param {boolean} debugMode - デバッグモード
   */
  drawGroundSegments(ctx, distance, playerX, screenWidth, debugMode = false) {
    for (const g of this.groundSegments) {
      const sx = g.x - distance + playerX + (g.drawOffsetX || 0);
      if (sx + g.w < -120 || sx > screenWidth + 120) continue;

      const img = this.imageLoader.load(g.img);
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, sx, g.y, g.w, g.h);
      } else {
        ctx.fillStyle = "rgba(0,0,0,.65)";
        ctx.fillRect(sx, g.y, g.w, g.h);
      }

      // デバッグ枠
      if (debugMode) {
        ctx.strokeStyle = "rgba(0,255,0,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, g.y, g.w, g.h);
      }
    }
  }

  /**
   * 障害物を描画
   * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
   * @param {number} distance - スクロール距離
   * @param {number} playerX - プレイヤーX座標
   * @param {number} screenWidth - 画面幅
   * @param {boolean} debugMode - デバッグモード
   */
  drawObstacles(ctx, distance, playerX, screenWidth, debugMode = false) {
    for (const o of this.obstacles) {
      const sx = o.x - distance + playerX + (o.drawOffsetX || 0);
      if (sx + o.w < -80 || sx > screenWidth + 80) continue;

      const img = this.imageLoader.load(o.img);
      if (img.complete && img.naturalWidth > 0) {
        // エネミーの場合、スプライトアニメーション描画（プレイヤーと同じパターン）
        if (o.isEnemy && o.frameCount > 0) {
          // スプライトシートから正確にフレーム切り出し（元画像サイズを使用）
          const frameWidth = img.naturalWidth / o.frameCount;
          const frameHeight = img.naturalHeight;
          const sourceX = o.currentFrame * frameWidth;

          ctx.drawImage(
            img,
            sourceX, // スプライトシートのX
            0, // スプライトシートのY
            frameWidth, // 切り出す幅
            frameHeight, // 切り出す高さ
            sx, // 描画先X
            o.y, // 描画先Y
            o.w, // 描画幅
            o.h // 描画高さ
          );
        } else {
          // 通常の障害物
          ctx.drawImage(img, sx, o.y, o.w, o.h);
        }
      } else {
        ctx.fillStyle = "rgba(0,0,0,.75)";
        ctx.fillRect(sx, o.y, o.w, o.h);
      }

      // 空中障害物マーカー
      if (o.kind === "air" && !o.isEnemy) {
        ctx.fillStyle = "rgba(255,93,108,.90)";
        ctx.fillRect(sx, o.y, o.w, 3);
      }

      // エネミーマーカー（デバッグ用）
      if (o.isEnemy && debugMode) {
        ctx.fillStyle = "rgba(255,0,255,0.3)";
        ctx.fillRect(sx, o.y, o.w, o.h);
      }

      // デバッグ枠
      if (debugMode) {
        ctx.strokeStyle = o.isEnemy
          ? "rgba(255,0,255,0.8)"
          : "rgba(255,255,0,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, o.y, o.w, o.h);
      }
    }
  }
}
