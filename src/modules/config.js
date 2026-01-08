/**
 * ゲーム設定定数
 * @typedef {Object} GameConfig
 */
export const CONFIG = {
  // 物琁E�E��E�ラメータ
  GRAVITY: 2400,
  JUMP_VEL: 780,
  MAX_FALL: 1200,

  // ゲーム速度
  SPEED: 300,
  RETREAT_SPEED_RATE: 0.45, // 後退は前進より遅くする
  RETREAT_LIMIT: 180, // 最高到達点から戻れる上限距離（cull安全圏内）

  // サイズ
  GROUND_H: 90,
  PLAYER_SIZE: 36,

  // 攻撃パラメータ
  MELEE_RANGE: 70,
  MELEE_COOLDOWN: 0.35,
  PROJECTILE_SPEED: 520,
  PROJECTILE_COOLDOWN: 0.6,
  PROJECTILE_SIZE: 10,
  PROJECTILE_LIFETIME: 1.8,

  // // プレイヤースプライト（旧）
  // PLAYER_SPRITE: "/images/objects/player_sprite.png",
  // PLAYER_FRAME_COUNT: 4, // スプライトシートのフレーム数

  // 障害物スポーン
  SPAWN_AHEAD_MIN: 760,
  SPAWN_AHEAD_MAX: 1280,
  OBSTACLE_GAP_MIN: 260,
  OBSTACLE_GAP_MAX: 520,

  // 空中障害物
  AIR_LIFT_MIN: 70,
  AIR_LIFT_MAX: 160,
  AIR_RATE: 0.3,

  // タイムスチE�E��E�チE
  FIXED_DT: 1 / 120,
  MAX_ACCUM: 0.15,

  // パターン生成
  PATTERN_RATE: 0.55, // パターン使用率（予測可能性嵩上げ）

  // 地面に穴を空ける頻度とサイズ
  VOID_GAP_RATE: 0.1,
  VOID_GAP_MIN: 120,
  VOID_GAP_MAX: 220,
  VOID_GAP_COOLDOWN_MIN: 220,
  VOID_GAP_COOLDOWN_MAX: 360,
};

/**
 * エネミースプライト設定
 * @typedef {Object} EnemySpriteConfig
 */
export const ENEMY_SPRITES = {
  idle: {
    path: "/images/objects/enemy/enemy_sprite.png",
    frameCount: 4,
    frameDelay: 0.5,
    loop: true,
  },
};

/**
 * プレイヤースプライト設定（状態別）
 * @typedef {Object} PlayerSpriteConfig
 */
export const PLAYER_SPRITES = {
  idle: {
    path: "/images/objects/player/idle.png",
    frameCount: 4,
    frameDelay: 0.1,
    loop: true,
  },
  jumping: {
    path: "/images/objects/player/jumping.png",
    frameCount: 2,
    frameDelay: 0.08,
    loop: true,
  },
  falling: {
    path: "/images/objects/player/falling.png",
    frameCount: 2,
    frameDelay: 0.1,
    loop: true,
  },
  dead: {
    path: "/images/objects/player/dead.png",
    frameCount: 1,
    frameDelay: 0.1,
    loop: true,
  },
};

/**
 * 障害物チE�E��E�プレーチE
 * @typedef {Object} ObjectTemplate
 */
export const OBJECT_TEMPLATES = [
  {
    w: 50,
    h: 50,
    img: "/images/objects/足場_特小.png",
    allowAir: true,
    allowGround: true,
    groundJitter: 12,
    airLiftJitter: 32,
    prob: 0.6,
  },
  {
    w: 80,
    h: 80,
    img: "/images/objects/足場_小.png",
    allowAir: true,
    allowGround: true,
    groundJitter: 12,
    airLiftJitter: 32,
    prob: 0.8,
  },
  {
    w: 140,
    h: 100,
    img: "/images/objects/足場_中.png",
    allowAir: false,
    allowGround: false,
    groundJitter: 30,
    drawOffsetX: 20,
    topAlignGround: true,
    prob: 1.5,
  },
  {
    w: 400,
    h: 130,
    img: "/images/objects/足場_大.png",
    allowAir: false,
    allowGround: false,
    groundJitter: -8,
    drawOffsetX: -10,
    topAlignGround: true,
    prob: 1.8,
  },
  {
    w: 40,
    h: 40,
    img: "/images/objects/enemy/enemy_sprite.png",
    allowAir: true,
    allowGround: true,
    groundJitter: 8,
    airLiftJitter: 24,
    isEnemy: true,
    frameCount: 4,
    frameDelay: 0.15,
    loop: true,
    prob: 0.5,
  },
];

/**
 * 障害物パターン定義
 * レトロゲーム風の予測可能な配置パターン
 * チE�E��E�プレート幁E [0]=40, [1]=80, [2]=140, [3]=400
 * @typedef {Object} ObstaclePattern
 */
export const OBSTACLE_PATTERNS = [
  // === 初級パターン�E�E�E�Eeight 1.0-1.2�E�E�E�E==
  {
    name: "single",
    weight: 1.4,
    obstacles: [{ templateIndex: 0, offsetX: 0, type: "ground" }],
  },
  {
    name: "singleLarge",
    weight: 1.2,
    obstacles: [{ templateIndex: 1, offsetX: 0, type: "ground" }],
  },
  {
    name: "doubleSmall",
    weight: 1.2,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 120, type: "ground" }, // 40+80間隔
    ],
  },
  {
    name: "doubleLarge",
    weight: 1.0,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 260, type: "ground" }, // 80+180間隔
    ],
  },

  // === 空中ジャンプ系�E�E�E�Eeight 0.7-0.9�E�E�E�E==
  {
    name: "airJump",
    weight: 0.75,
    obstacles: [{ templateIndex: 1, offsetX: 0, type: "air", liftOffset: -75 }],
  },
  {
    name: "doubleAir",
    weight: 0.7,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -60 },
      { templateIndex: 0, offsetX: 140, type: "air", liftOffset: -100 },
    ],
  },
  {
    name: "tripleAir",
    weight: 0.55,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -50 },
      { templateIndex: 0, offsetX: 130, type: "air", liftOffset: -90 },
      { templateIndex: 0, offsetX: 260, type: "air", liftOffset: -60 },
    ],
  },

  // === 階段パターン�E�E�E�Eeight 0.6-0.8�E�E�E�E==
  {
    name: "stairsUp",
    weight: 0.8,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -50 },
      { templateIndex: 0, offsetX: 240, type: "air", liftOffset: -100 },
    ],
  },
  {
    name: "stairsDown",
    weight: 0.8,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -100 },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -50 },
      { templateIndex: 0, offsetX: 240, type: "ground" },
    ],
  },
  {
    name: "stairsPeak",
    weight: 0.7,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -40 },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -100 },
      { templateIndex: 0, offsetX: 240, type: "air", liftOffset: -40 },
    ],
  },
  {
    name: "stairsValley",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -100 },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -40 },
      { templateIndex: 0, offsetX: 240, type: "air", liftOffset: -100 },
    ],
  },

  // === ギャチE�E�Eジャンプ系�E�E�E�Eeight 0.6-0.8�E�E�E�E==
  {
    name: "gapSmall",
    weight: 0.8,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 240, type: "ground" }, // 80+160（ジャンプ可能範囲に収める）
    ],
  },
  {
    name: "gapMedium",
    weight: 0.7,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 260, type: "ground" }, // 80+180（ジャンプ余裕を確保）
    ],
  },

  // === ジグザグパターン�E�E�E�Eeight 0.5-0.7�E�E�E�E==
  {
    name: "zigzag",
    weight: 0.7,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -70 },
      { templateIndex: 0, offsetX: 240, type: "ground" },
    ],
  },
  {
    name: "zigzagWide",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 160, type: "air", liftOffset: -80 },
      { templateIndex: 0, offsetX: 320, type: "ground" },
    ],
  },
  {
    name: "zigzagReverse",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -70 },
      { templateIndex: 0, offsetX: 120, type: "ground" },
      { templateIndex: 0, offsetX: 240, type: "air", liftOffset: -70 },
    ],
  },

  // === 高低差パターン�E�E�E�Eeight 0.5-0.7�E�E�E�E==
  {
    name: "highLow",
    weight: 0.7,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -120 },
      { templateIndex: 1, offsetX: 200, type: "ground" },
    ],
  },
  {
    name: "lowHigh",
    weight: 0.7,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 220, type: "air", liftOffset: -110 },
    ],
  },
  {
    name: "highMidLow",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -100 },
      { templateIndex: 1, offsetX: 150, type: "air", liftOffset: -60 },
      { templateIndex: 0, offsetX: 350, type: "ground" },
    ],
  },

  // === リズムパターン�E�E�E�Eeight 0.5-0.7�E�E�E�E==
  {
    name: "rhythm3Ground",
    weight: 0.7,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 120, type: "ground" },
      { templateIndex: 0, offsetX: 240, type: "ground" },
    ],
  },
  {
    name: "rhythm4Ground",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 100, type: "ground" },
      { templateIndex: 0, offsetX: 200, type: "ground" },
      { templateIndex: 0, offsetX: 300, type: "ground" },
    ],
  },
  {
    name: "rhythmAir",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -70 },
      { templateIndex: 0, offsetX: 140, type: "air", liftOffset: -70 },
      { templateIndex: 0, offsetX: 280, type: "air", liftOffset: -70 },
    ],
  },

  // === 褁E�E��E�パターン�E�E�E�Eeight 0.4-0.6�E�E�E�E==
  {
    name: "mixed1",
    weight: 0.6,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -80 },
      { templateIndex: 1, offsetX: 280, type: "ground" },
    ],
  },
  {
    name: "platformSequence",
    weight: 0.5,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 180, type: "air", liftOffset: -50 },
      { templateIndex: 0, offsetX: 300, type: "air", liftOffset: -90 },
      { templateIndex: 1, offsetX: 450, type: "ground" },
    ],
  },
  {
    name: "challenge",
    weight: 0.5,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 200, type: "air", liftOffset: -80 },
      { templateIndex: 0, offsetX: 320, type: "air", liftOffset: -120 },
      { templateIndex: 1, offsetX: 480, type: "ground" },
    ],
  },

  // === 上級パターン�E�E�E�Eeight 0.3-0.4�E�E�E�E==
  {
    name: "quickStep",
    weight: 0.4,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 100, type: "ground" },
      { templateIndex: 0, offsetX: 200, type: "air", liftOffset: -70 },
      { templateIndex: 0, offsetX: 320, type: "air", liftOffset: -110 },
    ],
  },
  {
    name: "precisionJump",
    weight: 0.4,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 280, type: "air", liftOffset: -100 },
      { templateIndex: 1, offsetX: 400, type: "ground" },
    ],
  },
  {
    name: "aerialDance",
    weight: 0.25,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -60 },
      { templateIndex: 0, offsetX: 120, type: "air", liftOffset: -100 },
      { templateIndex: 0, offsetX: 240, type: "air", liftOffset: -60 },
      { templateIndex: 0, offsetX: 360, type: "air", liftOffset: -100 },
    ],
  },
  {
    name: "intense",
    weight: 0.2,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 0, offsetX: 100, type: "air", liftOffset: -70 },
      { templateIndex: 0, offsetX: 210, type: "ground" },
      { templateIndex: 0, offsetX: 320, type: "air", liftOffset: -110 },
      { templateIndex: 0, offsetX: 440, type: "ground" },
    ],
  },

  // === エネミーパターン weight 0.15-0.25 ===
  // 敵を地面オブジェクトまたは浮遊オブジェクト上に配置
  // 注: liftOffsetは負の値で、足場の高さを基準にした相対的な位置調整
  //     エネミーの場合、足場の上に配置するためliftOffsetを指定
  {
    name: "singleEnemy",
    weight: 0.25,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 4, offsetX: 0, type: "ground", liftOffset: -60 }, // 小さい足場の上に敵を配置
    ],
  },
  {
    name: "doubleEnemy",
    weight: 0.2,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 4, offsetX: 0, type: "ground", liftOffset: -60 },
      { templateIndex: 0, offsetX: 140, type: "ground" },
      { templateIndex: 4, offsetX: 140, type: "ground", liftOffset: -60 },
    ],
  },
  {
    name: "tripleEnemy",
    weight: 0.15,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 4, offsetX: 20, type: "ground", liftOffset: -70 },
      { templateIndex: 0, offsetX: 140, type: "ground" },
      { templateIndex: 4, offsetX: 160, type: "ground", liftOffset: -70 },
      { templateIndex: 0, offsetX: 280, type: "ground" },
      { templateIndex: 4, offsetX: 300, type: "ground", liftOffset: -70 },
    ],
  },
  {
    name: "enemyOnAirPlatform",
    weight: 0.2,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "air", liftOffset: -80 },
      { templateIndex: 4, offsetX: 20, type: "air", liftOffset: -130 }, // 浮遊足場の上に敵を配置
    ],
  },
  {
    name: "enemyMixedPlatform",
    weight: 0.18,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 120, type: "air", liftOffset: -80 },
      { templateIndex: 4, offsetX: 140, type: "air", liftOffset: -130 }, // 浮遊足場の上に敵
    ],
  },
  {
    name: "enemyGroundSequence",
    weight: 0.18,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 4, offsetX: 0, type: "ground", liftOffset: -60 },
      { templateIndex: 0, offsetX: 120, type: "ground" },
      { templateIndex: 4, offsetX: 120, type: "ground", liftOffset: -60 },
      { templateIndex: 1, offsetX: 280, type: "ground" },
    ],
  },
  {
    name: "enemyAirSequence",
    weight: 0.15,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "air", liftOffset: -70 },
      { templateIndex: 4, offsetX: 0, type: "air", liftOffset: -130 },
      { templateIndex: 0, offsetX: 130, type: "air", liftOffset: -100 },
      { templateIndex: 4, offsetX: 130, type: "air", liftOffset: -160 },
    ],
  },
];

/**
 * 背景レイヤー設宁E
 * @typedef {Object} BackgroundLayer
 */
export const BACKGROUND_LAYERS = [
  {
    speed: 0,
    scale: 0.36,
    img: "/images/backgrounds/背景_メイン.png",
    mode: "single",
    anchor: "center",
  },
  {
    speed: 0.15,
    scale: 0.48,
    repeatSpacing: 1.6,
    img: "/images/backgrounds/背景_飛行機_b.png",
    independent: true,
    independentSpeed: 30,
  },
  {
    speed: 0.1,
    scale: 0.2,
    repeatSpacing: 1.8,
    img: "/images/backgrounds/背景_ビル群_c.png",
    anchor: "groundTop",
    offsetY: 110,
    prob: 1.0,
    segment: true,
  },
  {
    speed: -0.35,
    scale: 0.45,
    repeatSpacing: 2,
    img: "/images/backgrounds/背景_飛行機_a.png",
    independent: true,
    independentSpeed: -50,
  },
  {
    speed: 0.3,
    scale: 0.15,
    repeatSpacing: 2.0,
    img: "/images/backgrounds/背景_ビル群_b.png",
    anchor: "groundTop",
    offsetY: 90,
    prob: 1.0,
    segment: true,
  },
  {
    speed: 0.5,
    scale: 0.25,
    repeatSpacing: 1.9,
    img: "/images/backgrounds/背景_ビル群_a.png",
    anchor: "groundTop",
    offsetY: 90,
    prob: 1.0,
    segment: true,
  },
];
