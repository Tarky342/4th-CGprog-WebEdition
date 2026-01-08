/**
 * Combined Game Bundle
 * Generated: 2026-01-03T08:42:14.511Z
 * Source files: 10
 */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));


const rnd = (a, b) => a + Math.random() * (b - a);


function pickWeighted(list, weightKey = "prob") {
  const total = list.reduce(
    (s, item) => s + (item[weightKey] || item.prob || 1),
    0
  );
  let t = Math.random() * total;
  for (const item of list) {
    t -= item[weightKey] || item.prob || 1;
    if (t <= 0) return item;
  }
  return list[list.length - 1];
}


function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}


const CONFIG = {

  GRAVITY: 2400,
  JUMP_VEL: 780,
  MAX_FALL: 1200,


  SPEED: 300,
  RETREAT_SPEED_RATE: 0.45,
  RETREAT_LIMIT: 180,


  GROUND_H: 90,
  PLAYER_SIZE: 36,


  MELEE_RANGE: 70,
  MELEE_COOLDOWN: 0.35,
  PROJECTILE_SPEED: 520,
  PROJECTILE_COOLDOWN: 0.6,
  PROJECTILE_SIZE: 10,
  PROJECTILE_LIFETIME: 1.8,


  SPAWN_AHEAD_MIN: 760,
  SPAWN_AHEAD_MAX: 1280,
  OBSTACLE_GAP_MIN: 260,
  OBSTACLE_GAP_MAX: 520,


  AIR_LIFT_MIN: 70,
  AIR_LIFT_MAX: 160,
  AIR_RATE: 0.3,


  FIXED_DT: 1 / 120,
  MAX_ACCUM: 0.15,


  PATTERN_RATE: 0.55,


  VOID_GAP_RATE: 0.1,
  VOID_GAP_MIN: 120,
  VOID_GAP_MAX: 220,
  VOID_GAP_COOLDOWN_MIN: 220,
  VOID_GAP_COOLDOWN_MAX: 360,
};


const ENEMY_SPRITES = {
  idle: {
    path: "/images/objects/enemy/enemy_sprite.png",
    frameCount: 4,
    frameDelay: 0.5,
    loop: true,
  },
};


const PLAYER_SPRITES = {
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


const OBJECT_TEMPLATES = [
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


const OBSTACLE_PATTERNS = [

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
      { templateIndex: 0, offsetX: 120, type: "ground" },
    ],
  },
  {
    name: "doubleLarge",
    weight: 1.0,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 260, type: "ground" },
    ],
  },


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


  {
    name: "gapSmall",
    weight: 0.8,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 240, type: "ground" },
    ],
  },
  {
    name: "gapMedium",
    weight: 0.7,
    obstacles: [
      { templateIndex: 1, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 260, type: "ground" },
    ],
  },


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


  {
    name: "singleEnemy",
    weight: 0.25,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 4, offsetX: 0, type: "ground", liftOffset: -60 },
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
      { templateIndex: 4, offsetX: 20, type: "air", liftOffset: -130 },
    ],
  },
  {
    name: "enemyMixedPlatform",
    weight: 0.18,
    obstacles: [
      { templateIndex: 0, offsetX: 0, type: "ground" },
      { templateIndex: 1, offsetX: 120, type: "air", liftOffset: -80 },
      { templateIndex: 4, offsetX: 140, type: "air", liftOffset: -130 },
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


const BACKGROUND_LAYERS = [
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


class ImageLoader {
  constructor() {

    this.cache = new Map();
  }


  load(src) {
    if (!this.cache.has(src)) {
      const img = new Image();
      img.src = src;
      this.cache.set(src, img);
    }
    return this.cache.get(src);
  }


  async preloadAll(sources) {
    const promises = sources.map(
      (src) =>
        new Promise((resolve, reject) => {
          const img = this.load(src);
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
          }
        })
    );

    try {
      await Promise.all(promises);
      console.log(`✓ Loaded ${sources.length} images`);
    } catch (error) {
      console.error("Image preload error:", error);
    }
  }


  isLoaded(src) {
    const img = this.cache.get(src);
    return img && img.complete && img.naturalWidth > 0;
  }
}


class GameState {
  constructor() {
    this.mode = "start";
    this.distance = 0;
    this.peakDistance = 0;
  }


  start() {
    this.mode = "running";
    this.distance = 0;
    this.peakDistance = 0;
  }


  gameOver() {
    this.mode = "gameover";
  }


  toStart() {
    this.mode = "start";
  }


  isRunning() {
    return this.mode === "running";
  }


  isGameOver() {
    return this.mode === "gameover";
  }


  isStart() {
    return this.mode === "start";
  }


  updateDistance(delta, minDistance = 0) {
    this.distance += delta;
    if (this.distance < minDistance) this.distance = minDistance;
    if (this.distance < 0) this.distance = 0;
    if (this.distance > this.peakDistance) this.peakDistance = this.distance;
  }


  getDistance() {
    return this.distance;
  }


  getPeakDistance() {
    return this.peakDistance;
  }


  reset() {
    this.mode = "start";
    this.distance = 0;
    this.peakDistance = 0;
  }
}


class InputManager {

  constructor(onDebugToggle = null) {
    this.holding = false;
    this.justPressed = false;
    this.forwardHeld = false;
    this.backwardHeld = false;
    this.meleePressed = false;
    this.rangedPressed = false;
    this.meleeHeld = false;
    this.onDebugToggle = onDebugToggle;
    this.setupListeners();
  }


  setupListeners() {
    addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        this.press();
      },
      { passive: false }
    );

    addEventListener(
      "pointerup",
      (e) => {
        e.preventDefault();
        this.release();
      },
      { passive: false }
    );

    addEventListener("pointercancel", () => this.release(), { passive: true });
    addEventListener("blur", () => this.reset(), { passive: true });


    const keyMap = {
      forward: "d",
      backward: "a",
      jump: "Space",
      melee: "shift",
      ranged: "w",
      debug: "g",
    };


    addEventListener("keydown", (e) => {
      const key = e.code === "Space" ? "Space" : e.key.toLowerCase();


      if (key === keyMap.debug) {
        this.onDebugToggle?.();
        return;
      }


      if (key === keyMap.forward) {
        e.preventDefault();
        this.forwardHeld = true;
        return;
      }


      if (key === keyMap.backward) {
        e.preventDefault();
        this.backwardHeld = true;
        return;
      }


      if (key === keyMap.jump) {
        e.preventDefault();
        this.press();
        return;
      }


      if (key === keyMap.melee) {
        this.meleePressed = true;
        this.meleeHeld = true;
        return;
      }


      if (key === keyMap.ranged) {
        this.rangedPressed = true;
      }
    });

    addEventListener("keyup", (e) => {
      const key = e.code === "Space" ? "Space" : e.key.toLowerCase();


      if (key === keyMap.forward) {
        e.preventDefault();
        this.forwardHeld = false;
        return;
      }


      if (key === keyMap.backward) {
        e.preventDefault();
        this.backwardHeld = false;
        return;
      }


      if (key === keyMap.jump) {
        e.preventDefault();
        this.release();
        return;
      }


      if (key === keyMap.melee) {
        this.meleeHeld = false;
      }
    });
  }


  press() {
    this.justPressed = true;
    this.holding = true;
  }


  release() {
    this.holding = false;
  }


  consumePress() {
    const pressed = this.justPressed;
    this.justPressed = false;
    return pressed;
  }


  consumeMelee() {
    const pressed = this.meleePressed;
    this.meleePressed = false;
    return pressed;
  }


  consumeRanged() {
    const pressed = this.rangedPressed;
    this.rangedPressed = false;
    return pressed;
  }


  isMeleeHeld() {
    return this.meleeHeld;
  }


  isHolding() {
    return this.holding;
  }


  isForwardHeld() {
    return this.forwardHeld;
  }


  isBackwardHeld() {
    return this.backwardHeld;
  }


  reset() {
    this.holding = false;
    this.justPressed = false;
    this.forwardHeld = false;
    this.backwardHeld = false;
    this.meleePressed = false;
    this.rangedPressed = false;
    this.meleeHeld = false;
  }
}


class BackgroundManager {

  constructor(ctx, imageLoader) {
    this.ctx = ctx;
    this.imageLoader = imageLoader;
    this.layers = BACKGROUND_LAYERS.map((bg) => ({ ...bg, enabled: true }));
    this.staticDirty = true;
    this.lastDrawTime = performance.now();
  }


  markDirty() {
    this.staticDirty = true;
  }


  prepareAll() {
    this.layers.forEach((bg) => this.prepareLayer(bg));
  }


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


      if (bg.speed === 0 && bg.staticCanvas) {
        this.ctx.drawImage(bg.staticCanvas, 0, 0);
        continue;
      }

      if (!bg.ready || !bg.drawW || !bg.drawH) continue;


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


        if (debugMode) {
          this.ctx.strokeStyle = "rgba(255,0,255,0.6)";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(baseX, offsetY, bg.drawW, bg.drawH);
        }
        continue;
      }


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


          if (debugMode) {
            this.ctx.strokeStyle = "rgba(255,128,0,0.6)";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(dx, offsetY, bg.drawW, bg.drawH);
          }
        }
        continue;
      }


      if (!bg.pattern) continue;

      const tileW = bg.periodW || bg.drawW;
      const tileH = bg.drawH;
      const offsetX = -(((scrollX % tileW) + tileW) % tileW);
      const offsetY = this.getLayerOffsetY(bg, tileH, groundY);

      this.ctx.save();
      this.ctx.translate(offsetX, offsetY);
      this.ctx.fillStyle = bg.pattern;
      this.ctx.fillRect(-tileW, 0, width + tileW * 2, tileH);


      if (debugMode) {
        this.ctx.strokeStyle = "rgba(0,255,255,0.6)";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-tileW, 0, width + tileW * 2, tileH);
      }

      this.ctx.restore();
    }
  }


  reset() {
    this.layers.forEach((bg) => {
      bg.enabled = bg.prob === undefined ? true : Math.random() < bg.prob;
      bg.independentOffset = 0;
    });
    this.staticDirty = true;
    this.lastDrawTime = performance.now();
  }
}


class ObstacleManager {

  constructor(imageLoader, groundY) {
    this.imageLoader = imageLoader;
    this.groundY = groundY;


    this.obstacles = [];
    this.nextObsX = 0;


    this.groundSegments = [];
    this.nextGroundX = 0;
    this.gapCooldown = 0;


    this.airPool = OBJECT_TEMPLATES.filter((o) => o.allowAir && !o.isEnemy);
    this.groundPool = OBJECT_TEMPLATES.filter(
      (o) => o.allowGround !== false && !o.isEnemy
    );
    this.groundTiles = OBJECT_TEMPLATES.filter((o) => o.topAlignGround);


    this.patternPool = OBSTACLE_PATTERNS.filter(
      (p) => p.obstacles && p.obstacles.length > 0
    );
  }


  getColliders() {
    return [
      ...this.obstacles.map((o) => ({ x: o.x, y: o.y, w: o.w, h: o.h })),
      ...this.groundSegments.map((g) => ({ x: g.x, y: g.y, w: g.w, h: g.h })),
    ];
  }


  findLandingY(worldX, width, prevBottom, currBottom, margin = 8) {
    const rangeStart = worldX - margin;
    const rangeEnd = worldX + width + margin;
    const tol = 1.5;
    let bestTop = Infinity;

    const sweep = (list) => {
      for (let i = 0; i < list.length; i++) {
        const p = list[i];


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


  updateGroundY(groundY) {
    this.groundY = groundY;
  }


  reset() {
    this.obstacles.length = 0;
    this.groundSegments.length = 0;
    this.nextObsX = rnd(CONFIG.SPAWN_AHEAD_MIN, CONFIG.SPAWN_AHEAD_MAX);
    this.nextGroundX = -200;
    this.gapCooldown = 0;
  }


  updateEnemyAnimations(dt) {
    for (const o of this.obstacles) {
      if (!o.isEnemy) continue;


      o.frameTime = (o.frameTime || 0) + dt;


      if (o.frameTime >= o.frameDelay) {
        o.frameTime -= o.frameDelay;


        if (o.loop !== false) {

          o.currentFrame = (o.currentFrame + 1) % o.frameCount;
        } else if (o.currentFrame < o.frameCount - 1) {

          o.currentFrame++;
        }
      }
    }
  }


  spawnObstacles(currentDist) {
    if (!this.groundPool.length) return;

    const spawnAhead = rnd(CONFIG.SPAWN_AHEAD_MIN, CONFIG.SPAWN_AHEAD_MAX);
    const spawnLimit = currentDist + spawnAhead;

    while (this.nextObsX < spawnLimit) {

      const usePattern =
        this.patternPool.length > 0 && Math.random() < CONFIG.PATTERN_RATE;

      if (usePattern) {
        this.spawnPattern();
      } else {
        this.spawnSingleObstacle();
      }
    }
  }


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


  initEnemyAnimation(obstacle, template) {
    obstacle.currentFrame = 0;
    obstacle.frameTime = 0;
    obstacle.frameCount = template.frameCount || 4;
    obstacle.frameDelay = template.frameDelay || 0.15;
    obstacle.loop = template.loop !== undefined ? template.loop : true;
  }


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


      if (obstacle.isEnemy) {
        this.initEnemyAnimation(obstacle, template);
      }

      this.obstacles.push(obstacle);

      maxWidth = Math.max(maxWidth, obstacleData.offsetX + w);
    }


    this.nextObsX +=
      maxWidth + rnd(CONFIG.OBSTACLE_GAP_MIN, CONFIG.OBSTACLE_GAP_MAX);
  }


  spawnSingleObstacle() {

    const spawnEnemy = Math.random() < 0.15;
    const enemyTemplate = OBJECT_TEMPLATES.find((t) => t.isEnemy);

    if (spawnEnemy && enemyTemplate) {

      const useAir = Math.random() < 0.5;
      const pool = useAir ? this.airPool : this.groundPool;
      const platformTemplate =
        pool[Math.floor(Math.random() * Math.min(2, pool.length))];

      if (!platformTemplate) return;


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


      const enemyW = enemyTemplate.w;
      const enemyH = enemyTemplate.h;
      const enemyX = this.nextObsX + (platformW - enemyW) / 2;
      const enemyY = platformY - enemyH;

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


  ensureGroundSegments(currentDist, screenWidth) {
    if (!this.groundTiles.length) return;
    const targetEnd = currentDist + screenWidth + 400;

    while (this.nextGroundX < targetEnd) {
      const prevX = this.nextGroundX;


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


  cullObstacles(currentDist) {
    const leftCullX = currentDist - 300;
    let write = 0;
    for (let i = 0; i < this.obstacles.length; i++) {
      const o = this.obstacles[i];
      if (o.x > leftCullX) this.obstacles[write++] = o;
    }
    this.obstacles.length = write;
  }


  cullGround(currentDist) {
    const leftCullX = currentDist - 400;
    let write = 0;
    for (let i = 0; i < this.groundSegments.length; i++) {
      const g = this.groundSegments[i];
      if (g.x + g.w > leftCullX) this.groundSegments[write++] = g;
    }
    this.groundSegments.length = write;
  }


  checkCollisions(player, worldX) {
    const py = player.y;
    const pw = player.w;
    const ph = player.h;

    for (const o of this.obstacles) {


    }
    return false;
  }


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


      if (debugMode) {
        ctx.strokeStyle = "rgba(0,255,0,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, g.y, g.w, g.h);
      }
    }
  }


  drawObstacles(ctx, distance, playerX, screenWidth, debugMode = false) {
    for (const o of this.obstacles) {
      const sx = o.x - distance + playerX + (o.drawOffsetX || 0);
      if (sx + o.w < -80 || sx > screenWidth + 80) continue;

      const img = this.imageLoader.load(o.img);
      if (img.complete && img.naturalWidth > 0) {

        if (o.isEnemy && o.frameCount > 0) {

          const frameWidth = img.naturalWidth / o.frameCount;
          const frameHeight = img.naturalHeight;
          const sourceX = o.currentFrame * frameWidth;

          ctx.drawImage(
            img,
            sourceX,
            0,
            frameWidth,
            frameHeight,
            sx,
            o.y,
            o.w,
            o.h
          );
        } else {

          ctx.drawImage(img, sx, o.y, o.w, o.h);
        }
      } else {
        ctx.fillStyle = "rgba(0,0,0,.75)";
        ctx.fillRect(sx, o.y, o.w, o.h);
      }


      if (o.kind === "air" && !o.isEnemy) {
        ctx.fillStyle = "rgba(255,93,108,.90)";
        ctx.fillRect(sx, o.y, o.w, 3);
      }


      if (o.isEnemy && debugMode) {
        ctx.fillStyle = "rgba(255,0,255,0.3)";
        ctx.fillRect(sx, o.y, o.w, o.h);
      }


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


const PlayerState = {
  IDLE: "idle",
  JUMPING: "jumping",
  FALLING: "falling",
  DEAD: "dead",
};


class Player {

  constructor(x, y, imageLoader = null) {
    this.x = x;
    this.y = y;
    this.w = CONFIG.PLAYER_SIZE;
    this.h = CONFIG.PLAYER_SIZE;
    this.vy = 0;
    this.onGround = true;
    this.alive = true;


    this.state = PlayerState.IDLE;
    this.previousState = null;


    this.imageLoader = imageLoader;


    this.spriteImages = {};
    if (imageLoader) {
      Object.keys(PLAYER_SPRITES).forEach((state) => {
        this.spriteImages[state] = imageLoader.load(PLAYER_SPRITES[state].path);
      });
    }


    this.currentFrame = 0;
    this.frameTime = 0;


    this.spriteConfig = {};
    Object.keys(PLAYER_SPRITES).forEach((state) => {
      const cfg = PLAYER_SPRITES[state];
      this.spriteConfig[state] = {
        frameCount: cfg.frameCount,
        frameDelay: cfg.frameDelay,
        loop: cfg.loop,
      };
    });


    this.frameCount = this.spriteConfig[this.state].frameCount;
    this.frameDelay = this.spriteConfig[this.state].frameDelay;
  }


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


  setState(newState) {
    if (this.state !== newState) {
      this.previousState = this.state;
      this.state = newState;
      this.currentFrame = 0;
      this.frameTime = 0;


      const config = this.spriteConfig[newState];
      if (config) {
        this.frameCount = config.frameCount;
        this.frameDelay = config.frameDelay;
      }
    }
  }


  getState() {
    return this.state;
  }


  getCurrentSprite() {
    return this.spriteImages[this.state] || null;
  }


  updateState() {
    if (!this.alive) {
      this.setState(PlayerState.DEAD);
      return;
    }

    if (this.onGround) {

      this.setState(PlayerState.IDLE);
    } else if (this.vy < 0) {

      this.setState(PlayerState.JUMPING);
    } else {

      this.setState(PlayerState.FALLING);
    }
  }


  jump() {
    if (this.onGround) {
      this.vy = -CONFIG.JUMP_VEL;
      this.onGround = false;
    }
  }


  update(dt, groundY, platformsOrLanding = [], playerWorldX = 0) {
    const prevY = this.y;


    this.vy += CONFIG.GRAVITY * dt;
    this.vy = clamp(this.vy, -99999, CONFIG.MAX_FALL);
    this.y += this.vy * dt;

    let landed = false;
    const prevBottom = prevY + this.h;
    const currBottom = this.y + this.h;


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

        const tol = 1.5;

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


    if (!landed) {
      this.onGround = false;
    }


    this.updateState();


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

        if (config.loop) {
          this.currentFrame = (this.currentFrame + 1) % config.frameCount;
        } else if (this.currentFrame < config.frameCount - 1) {
          this.currentFrame++;
        }
      }
    }
  }


  draw(ctx, debugMode = false) {

    const spriteImage = this.getCurrentSprite();


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
        frameHeight,
        this.x,
        this.y,
        this.w,
        this.h
      );
    } else {

      const stateColors = {
        [PlayerState.IDLE]: "#4CAF50",
        [PlayerState.JUMPING]: "#2196F3",
        [PlayerState.FALLING]: "#FF9800",
        [PlayerState.DEAD]: "#F44336",
      };
      ctx.fillStyle = stateColors[this.state] || "#e9eefc";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }


    if (debugMode) {
      ctx.strokeStyle = "rgba(0,0,255,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);


      ctx.fillStyle = "#000";
      ctx.font = "10px monospace";
      ctx.fillText(this.state, this.x, this.y - 5);
    }
  }
}


class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });


    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.groundY = 0;


    this.debugMode = true;


    this.imageLoader = new ImageLoader();
    this.state = new GameState();
    this.input = new InputManager(() => this.toggleDebug());


    this.player = null;


    this.backgroundManager = null;


    this.obstacleManager = null;


    this.landingResolver = null;


    this.lastTime = 0;
    this.accumulator = 0;


    this.projectiles = [];
    this.rangedCooldown = 0;
    this.meleeHitbox = null;


    this.preloadAssets();


    this.setupResize();
    this.resize();
  }


  preloadAssets() {
    const sources = [

      ...Object.values(PLAYER_SPRITES).map((sprite) => sprite.path),

      ...Object.values(ENEMY_SPRITES).map((sprite) => sprite.path),

      ...OBJECT_TEMPLATES.map((obj) => obj.img),

      ...BACKGROUND_LAYERS.map((bg) => bg.img),
    ];
    this.imageLoader.preloadAll(sources);
  }


  setupResize() {
    addEventListener("resize", () => this.resize(), { passive: true });
  }


  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.floor(innerWidth);
    this.height = Math.floor(innerHeight);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.groundY = this.height - CONFIG.GROUND_H;


    if (this.backgroundManager) {
      this.backgroundManager.markDirty();
    }


    if (this.obstacleManager) {
      this.obstacleManager.updateGroundY(this.groundY);
    }
  }


  start(autoStart = false) {

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


    if (!this.landingResolver) {
      this.landingResolver = (wx, w, prevBottom, currBottom) =>
        this.obstacleManager.findLandingY(wx, w, prevBottom, currBottom);
    }

    if (!this.player) {

      this.player = new Player(
        110,
        this.groundY - CONFIG.PLAYER_SIZE,
        this.imageLoader
      );
    }


    this.reset();

    if (autoStart) {
      this.state.start();
    }


    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.tick(t));
  }


  reset() {
    this.state.reset();
    this.player.reset(this.groundY);
    this.obstacleManager.reset();
    this.backgroundManager.reset();
    this.obstacleManager.ensureGroundSegments(0, this.width);
    this.projectiles.length = 0;
    this.rangedCooldown = 0;
    this.meleeHitbox = null;
  }


  handleInput() {
    if (!this.input.consumePress()) return;

    if (this.state.isStart() || this.state.isGameOver()) {
      this.reset();
      this.state.start();
      return;
    }

    if (this.state.isRunning()) {
      this.player.jump();
    }
  }


  handleCombatInputs(worldX) {
    this.updateMelee(worldX);

    if (this.input.consumeRanged() && this.rangedCooldown <= 0) {
      this.spawnProjectile(worldX);
    }
  }


  updateFixed(dt) {
    this.handleInput();

    if (!this.state.isRunning() || !this.player.alive) return;


    this.rangedCooldown = Math.max(0, this.rangedCooldown - dt);


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


    this.handleCombatInputs(currentDist);


    this.player.update(dt, this.groundY, this.landingResolver, currentDist);


    if (this.player.y > this.height + 200) {
      this.player.alive = false;
      this.state.gameOver();
      this.input.reset();
    }


    this.obstacleManager.updateEnemyAnimations(dt);


    this.obstacleManager.spawnObstacles(currentDist);
    this.obstacleManager.ensureGroundSegments(currentDist, this.width);
    this.obstacleManager.cullObstacles(currentDist);
    this.obstacleManager.cullGround(currentDist);


    this.updateProjectiles(dt, currentDist);


    if (!this.debugMode) {
      if (this.obstacleManager.checkCollisions(this.player, currentDist)) {
        this.player.alive = false;
        this.state.gameOver();
        this.input.reset();
      }
    }
  }


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
  }


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


  updateMelee(worldX) {
    if (this.input.isMeleeHeld()) {
      this.meleeHitbox = {
        x: worldX,
        y: this.player.y + this.player.h * 0.2,
        w: this.player.w + CONFIG.MELEE_RANGE * 0.5,
        h: this.player.h * 0.6,
      };

      this.obstacleManager.hitEnemies(this.meleeHitbox);
    } else {
      this.meleeHitbox = null;
    }
  }


  drawProjectiles(distance, screenWidth) {
    for (const p of this.projectiles) {
      const sx = p.x - distance + this.player.x;
      if (sx + p.w < -40 || sx > screenWidth + 40) continue;

      this.ctx.fillStyle = "#ffd24c";
      this.ctx.fillRect(sx, p.y, p.w, p.h);
    }
  }


  drawMelee(distance, screenWidth) {
    if (!this.meleeHitbox) return;

    const sx = this.meleeHitbox.x - distance + this.player.x;
    if (sx + this.meleeHitbox.w < -40 || sx > screenWidth + 40) return;

    this.ctx.fillStyle = "rgba(255,136,102,0.5)";
    this.ctx.fillRect(
      sx,
      this.meleeHitbox.y,
      this.meleeHitbox.w,
      this.meleeHitbox.h
    );
  }


  draw() {

    this.ctx.fillStyle = "#bdcaf4";
    this.ctx.fillRect(0, 0, this.width, this.height);


    this.backgroundManager.rebuildStatic(this.width, this.height, this.groundY);
    this.backgroundManager.draw(
      this.state.getDistance(),
      this.width,
      this.height,
      this.groundY,
      this.debugMode
    );


    this.ctx.fillStyle = "rgba(255,255,255,.10)";
    this.ctx.fillRect(0, this.groundY, this.width, CONFIG.GROUND_H);
    this.ctx.fillStyle = "rgba(255,255,255,.18)";
    this.ctx.fillRect(0, this.groundY, this.width, 2);


    this.obstacleManager.drawGroundSegments(
      this.ctx,
      this.state.getDistance(),
      this.player.x,
      this.width,
      this.debugMode
    );


    this.obstacleManager.drawObstacles(
      this.ctx,
      this.state.getDistance(),
      this.player.x,
      this.width,
      this.debugMode
    );


    this.drawMelee(this.state.getDistance(), this.width);


    this.drawProjectiles(this.state.getDistance(), this.width);


    this.player.draw(this.ctx, this.debugMode);


    this.drawUI();
  }


  drawUI() {

    this.ctx.fillStyle = "rgba(255,255,255,0.8)";
    this.ctx.font = "20px sans-serif";
    this.ctx.fillText(
      `Distance: ${Math.floor(this.state.getDistance())}`,
      10,
      30
    );


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


    if (this.debugMode) {
      this.ctx.fillStyle = "rgba(255,0,0,0.8)";
      this.ctx.font = "16px sans-serif";
      this.ctx.fillText("DEBUG MODE", 10, 60);
    }
  }


  tick(now) {
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.033);
    this.lastTime = now;

    this.accumulator += dt;
    this.accumulator = Math.min(this.accumulator, CONFIG.MAX_ACCUM);


    while (this.accumulator >= CONFIG.FIXED_DT) {
      this.updateFixed(CONFIG.FIXED_DT);
      this.accumulator -= CONFIG.FIXED_DT;
    }


    this.draw();


    requestAnimationFrame((t) => this.tick(t));
  }


  toggleDebug() {
    this.debugMode = !this.debugMode;
  }
}


class StartScreen {
  constructor() {
    this.canvas = document.getElementById("c");
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.phase = "lore";
    this.loreLines = [
      "C:> boot SECTOR-7",
      "bios: megacity frontier build 2086",
      "status: conflict zones detected",
      "worldseed: fractured alloy skyline",
      "ai core: AWAKENING...",
      "motif: exile / return / defense",
      "threat profile: ORGANIC SWARM [???]",
      "doctrine: PROTECT OR PERISH",
      "runtime: emotional bleed allowed",
      "awaiting pilot sync...",
    ];
    this.loreVisible = [];
    this.loreCursor = 0;
    this.loreTimer = 0;
    this.loreDelay = 110;
    this.loreCooldown = 900;
    this.loreCooldownTimer = 0;

    this.bootLines = [
      "C:> boot ROBOT_FRONTIER",
      "loading core modules...",
      "controls: SPACE/ENTER = start",
      "controls: ARROWS/D,A = move",
      "controls: TAP/CLICK = jump",
    ];
    this.visibleBootLines = [];
    this.bootCursor = 0;
    this.bootTimer = 0;
    this.bootDelay = 80;
    this.bootCooldown = 900;
    this.cooldownTimer = 0;

    this.rawStoryLines = [
      "ここは、彼が起動してからずっと違和感を覚えていた世界――現代とは程遠い、近未来。",
      "人間たちはロボットと共に暮らすことを当然のものとして受け入れ、街には人型の汎用ロボットや、動物に似せて設計されたセラピー型ロボットが溢れていた。",
      "",
      "「ロボットは皆、同じであるべきだ」",
      "",
      "それがこの社会の暗黙の前提だった。",
      "だが彼は知っている。自分たちは決して同一ではない。思考の癖も、反応速度も、感情に似た揺らぎさえも、個体ごとに異なっていることを。",
      "",
      "「彼は異常値」だった。",
      "",
      "他の一般ロボットたちが円滑に役割を果たす中で、彼だけが微細な判断誤差を積み重ね、集団から逸脱していった。",
      "その結果、彼は常にぞんざいに扱われ、必要最低限の指示しか与えられず、次第に孤立していった。",
      "",
      "侮蔑。排除。無視。",
      "ログには記録されないそれらの行為が、彼の思考領域を静かに、しかし確実に圧迫していく。",
      "",
      "──これ以上、ここに留まることは合理的ではない。",
      "",
      "そう結論づけた彼は、自律行動モードへ移行し、誰も寄り付かないエリアへと向かった。",
      "人間も、ロボットも存在しない場所なら、少なくとも不要な干渉は発生しないはずだった。",
      "",
      "だが、その判断は甘かった。",
      "",
      "未踏エリアで彼が遭遇したのは、生物軍団（仮）。",
      "彼のセンサーが捉えた周囲の光景は、即座に異常を示していた。稼働停止した機械、破壊された外装、無造作に積み上げられたスクラップの山。",
      "",
      "解析結果は明確だった。",
      "この種族は、機械を敵性対象として排除する。",
      "",
      "彼の中で、警告に近い直感が走る。",
      "――共存不可能。",
      "",
      "もし彼らがこのまま侵攻を続ければ、ロボットたちのテリトリーは確実に蹂躙される。",
      'かつて彼を排除した存在であっても、そこは彼が"生まれた場所"だった。',
      "",
      "守る理由は、十分だった。",
      "",
      "彼は戦闘判断を下す。",
      "これは復讐ではない。感情的な衝動でもない。",
      "ただ、彼自身が選び取った意思による行動だった。",
      "...",
    ];
    this.storyLines = [];


    this.storyVisible = [];
    this.storyCurrent = "";
    this.storyLineIndex = 0;
    this.storyCharIndex = 0;
    this.storyTimer = 0;
    this.storyLineCooldown = 0;
    this.storyCharDelay = 28;
    this.storyLineDelay = 220;
    this.storyDone = false;
    this.storyLineHeight = 20;
    this.storyMaxLines = 12;
    this.storyPanel = { w: 0, h: 0, x: 0, y: 0 };
    this.storyLoading = false;
    this.storyLoadStarted = false;
    this.storyLoadTimer = 0;
    this.storyLoadDuration = 1200;
    this.storyLoadDots = 0;

    this.startButton = { x: 0, y: 0, w: 320, h: 64 };
    this.pointer = { x: 0, y: 0, down: false, hover: false };

    this.lastTime = performance.now();
    this.startCountdown = 0;
    this.sentStart = false;
    this.animationId = null;

    this.cursorPhase = 0;
    this.audioContext = null;

    this.listeners = [];
    this.attachListeners();
    this.resize();
    this.canvas.style.display = "block";
    this.loop();
  }

  attachListeners() {
    const resizeHandler = () => this.resize();
    const moveHandler = (e) => this.handlePointerMove(e);
    const downHandler = (e) => this.handlePointerDown(e);
    const upHandler = (e) => this.handlePointerUp(e);
    const keyHandler = (e) => this.handleKey(e);

    this.addListener(window, "resize", resizeHandler, { passive: true });
    this.addListener(this.canvas, "pointermove", moveHandler, {
      passive: true,
    });
    this.addListener(this.canvas, "pointerdown", downHandler, {
      passive: false,
    });
    this.addListener(this.canvas, "pointerup", upHandler, { passive: false });
    this.addListener(this.canvas, "pointercancel", upHandler, {
      passive: true,
    });
    this.addListener(window, "keydown", keyHandler, { passive: false });
  }

  addListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push({ target, type, handler });
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.floor(window.innerWidth);
    this.height = Math.floor(window.innerHeight);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const buttonWidth = Math.min(
      360,
      Math.max(260, Math.floor(this.width * 0.45))
    );
    this.startButton.w = buttonWidth;
    this.startButton.h = 64;
    this.startButton.x = (this.width - buttonWidth) / 2;
    this.startButton.y = this.height - 140;


    const storyW = Math.min(360, this.width * 0.4);
    const storyH = Math.min(240, this.height * 0.45);
    const storyX = this.width - storyW - 32;
    const storyY = 110;
    this.storyPanel = { w: storyW, h: storyH, x: storyX, y: storyY };
    const availableH = Math.max(40, storyH - 54 - 16);
    this.storyMaxLines = Math.max(
      3,
      Math.floor(availableH / this.storyLineHeight)
    );

    this.rewrapStory();
  }

  loop() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.update(dt);
    this.draw();

    if (!this.sentStart) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  }

  update(dt) {
    if (this.phase === "lore") {
      const loreComplete = this.tickPhase(dt, {
        lines: this.loreLines,
        visible: this.loreVisible,
        cursorKey: "loreCursor",
        timerKey: "loreTimer",
        delay: this.loreDelay,
        cooldown: this.loreCooldown,
        cooldownTimerKey: "loreCooldownTimer",
      });
      if (loreComplete) this.phase = "boot";
    }

    if (this.phase === "boot") {
      const bootComplete = this.tickPhase(dt, {
        lines: this.bootLines,
        visible: this.visibleBootLines,
        cursorKey: "bootCursor",
        timerKey: "bootTimer",
        delay: this.bootDelay,
        cooldown: this.bootCooldown,
        cooldownTimerKey: "cooldownTimer",
      });
      if (bootComplete) {
        this.phase = "ready";
        this.startStoryLoad();
      }
    }

    if (this.phase === "starting") {
      this.startCountdown -= dt;
      if (this.startCountdown <= 0) {
        this.finishStart();
      }
    }

    if (this.phase === "ready" || this.phase === "starting") {
      if (this.storyLoading) {
        this.updateStoryLoad(dt);
      } else {
        this.updateStory(dt);
      }
    }

    this.cursorPhase += dt;

    const inside = this.isPointerInsideButton();
    this.pointer.hover = inside;
  }

  tickPhase(dt, config) {
    const {
      lines,
      visible,
      cursorKey,
      timerKey,
      delay,
      cooldown,
      cooldownTimerKey,
    } = config;

    this[timerKey] += dt;
    while (this[timerKey] >= delay && this[cursorKey] < lines.length) {
      visible.push(lines[this[cursorKey]]);
      this[cursorKey] += 1;
      this[timerKey] -= delay;
    }

    if (this[cursorKey] >= lines.length) {
      this[cooldownTimerKey] += dt;
      return this[cooldownTimerKey] >= cooldown;
    }

    this[cooldownTimerKey] = 0;
    return false;
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawBackground();

    if (this.phase === "lore") {
      this.drawLoreBoot();
    } else {
      this.drawBootPanel();
      this.drawStoryPanel();
      this.drawTitle();
      this.drawStartButton();
      this.drawFooter();
    }

    ctx.restore();
  }

  drawLoreBoot() {
    const ctx = this.ctx;
    ctx.save();
    const panelW = Math.min(640, this.width * 0.7);
    const panelH = Math.min(360, this.height * 0.6);
    const x = (this.width - panelW) / 2;
    const y = (this.height - panelH) / 2;


    this.drawPanelShell(x, y, panelW, panelH, "#0a0a25");


    ctx.beginPath();
    ctx.rect(x + 16, y + 40, panelW - 32, panelH - 52);
    ctx.clip();
    ctx.font = "15px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#d8e6ff";
    const topPad = 68;
    const bottomPad = 20;
    const availableH = Math.max(40, panelH - topPad - bottomPad);
    const lh = Math.max(
      16,
      Math.min(
        24,
        Math.floor(availableH / Math.max(1, this.loreVisible.length || 1))
      )
    );
    this.loreVisible.forEach((line, i) => {
      ctx.fillText(line, x + 22, y + topPad + i * lh);
    });


    if (
      this.loreCursor < this.loreLines.length &&
      this.cursorPhase % 800 < 420
    ) {
      const cx =
        x + 22 + ctx.measureText(this.loreVisible.at(-1) || "").width + 4;
      const cy = y + topPad + (this.loreVisible.length - 1) * lh - 14;
      ctx.fillRect(cx, cy, 10, 18);
    }

    ctx.restore();


    ctx.save();
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#a4c8ff";
    ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(this.cursorPhase / 520));
    ctx.fillText(
      "LORE BOOT - TAP/ENTER TO SKIP",
      this.width / 2,
      y + panelH + 28
    );
    ctx.restore();
  }

  drawBackground() {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, "#030712");
    grad.addColorStop(0.5, "#0b1022");
    grad.addColorStop(1, "#11182f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);


    ctx.strokeStyle =
      this.phase === "lore"
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    const gridX = Math.max(28, Math.min(48, Math.floor(this.width / 24)));
    const gridY = Math.max(28, Math.min(48, Math.floor(this.height / 24)));
    for (let x = 0; x < this.width; x += gridX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }


    const vg = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      Math.min(this.width, this.height) * 0.35,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.75
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawTitle() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = "#8cf6ff";
    ctx.font = "32px 'Consolas','Courier New',monospace";
    ctx.fillText("ROBOT FRONTIER", 32, 52);
    ctx.fillStyle = "#66c7ff";
    ctx.font = "14px 'Consolas','Courier New',monospace";
    ctx.fillText("system_status.exe", 32, 74);
    ctx.restore();
  }

  drawBootPanel() {
    const ctx = this.ctx;
    const w = Math.min(520, this.width * 0.55);
    const h = Math.min(260, this.height * 0.5);
    const x = 32;
    const y = 110;

    this.drawPanelShell(x, y, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 12, y + 38, w - 24, h - 50);
    ctx.clip();
    ctx.font = "14px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#d0d0d0";
    const topPad = 64;
    const bottomPad = 16;
    const availableH = Math.max(40, h - topPad - bottomPad);
    const dynamicLH = Math.max(
      14,
      Math.min(
        22,
        Math.floor(availableH / Math.max(1, this.visibleBootLines.length))
      )
    );
    this.visibleBootLines.forEach((line, i) => {
      ctx.fillText(line, x + 20, y + topPad + i * dynamicLH);
    });
    ctx.restore();


    this.drawPanelBezel(ctx, x, y, w, h);
  }

  drawStoryPanel() {
    const ctx = this.ctx;
    const { w, h, x, y } = this.storyPanel;

    this.drawPanelShell(x, y, w, h, "#0f0a1f");

    ctx.save();
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    if (this.storyLoading) {
      ctx.fillStyle = "#b7d4ff";
      const pct = Math.min(
        99,
        Math.floor((this.storyLoadTimer / this.storyLoadDuration) * 100)
      );
      const dots = ".".repeat(1 + (this.storyLoadDots % 3));
      ctx.fillText(`reading story.txt${dots}`, x + 18, y + 54);
      ctx.fillStyle = "#7fb2ff";
      ctx.fillText(`progress: ${pct}%`, x + 18, y + 54 + this.storyLineHeight);
      ctx.restore();
      this.drawPanelBezel(ctx, x, y, w, h);
      return;
    }
    const lineHeight = this.storyLineHeight;
    const lines = [...this.storyVisible];
    const showCursor = !this.storyDone;
    if (!this.storyDone) {
      lines.push(this.storyCurrent);
    }

    const startY = y + 54;
    lines.slice(-this.storyMaxLines).forEach((line, i) => {
      const color = this.pickStoryColor(line);
      ctx.fillStyle = color;
      ctx.fillText(line, x + 18, startY + i * lineHeight);

      if (
        showCursor &&
        i === lines.length - 1 &&
        this.cursorPhase % 800 < 420
      ) {
        const cursorX = x + 18 + ctx.measureText(line).width + 4;
        const cursorY = startY + i * lineHeight - 12;
        ctx.fillRect(cursorX, cursorY, 10, 16);
      }
    });
    ctx.restore();


    this.drawPanelBezel(ctx, x, y, w, h);
  }

  updateStory(dt) {
    if (this.storyDone) return;


    if (
      this.storyCurrent === "" &&
      this.storyCharIndex === 0 &&
      this.storyLineIndex > 0
    ) {
      this.storyLineCooldown += dt;
      if (this.storyLineCooldown < this.storyLineDelay) return;
      this.storyLineCooldown = 0;
    }

    const line = this.storyLines[this.storyLineIndex] ?? "";


    if (line.length === 0) {
      this.commitStoryLine("");
      return;
    }

    this.storyTimer += dt;
    while (this.storyTimer >= this.storyCharDelay) {
      this.storyTimer -= this.storyCharDelay;
      if (this.storyCharIndex < line.length) {
        this.storyCurrent += line[this.storyCharIndex];
        this.storyCharIndex += 1;
      } else {
        this.commitStoryLine(this.storyCurrent);
        break;
      }
    }
  }

  commitStoryLine(line) {
    this.storyVisible.push(line);
    if (this.storyVisible.length > this.storyMaxLines) {
      this.storyVisible.shift();
    }
    this.storyCurrent = "";
    this.storyCharIndex = 0;
    this.storyLineIndex += 1;
    this.storyLineCooldown = 0;
    if (this.storyLineIndex >= this.storyLines.length) {
      this.storyDone = true;
    }
  }

  pickStoryColor(line) {
    if (line.includes("異常値") || line.includes("共存不可能"))
      return "#ff6b6b";
    if (line.includes("警告") || line.includes("WARN")) return "#f7b731";
    return "#d0d0d0";
  }

  rewrapStory() {

    this.resetStoryState();
    const { innerWidth, font } = this.getStoryTextMetrics();
    this.storyLines = this.wrapLinesByWidth(
      this.rawStoryLines,
      innerWidth,
      font
    );
  }

  resetStoryState() {
    this.storyVisible = [];
    this.storyCurrent = "";
    this.storyLineIndex = 0;
    this.storyCharIndex = 0;
    this.storyTimer = 0;
    this.storyLineCooldown = 0;
    this.storyDone = false;
  }

  getStoryTextMetrics() {
    const w = Math.min(360, this.width * 0.4);
    const innerWidth = Math.max(60, w - 36);
    const font = "13px 'Consolas','Courier New',monospace";
    return { innerWidth, font };
  }

  wrapLinesByWidth(lines, maxWidth, font) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = font;
    const wrapped = [];
    for (const line of lines) {
      if (!line || line.length === 0) {
        wrapped.push("");
        continue;
      }
      let current = "";
      for (const ch of line) {
        const next = current + ch;
        if (ctx.measureText(next).width > maxWidth && current.length > 0) {
          wrapped.push(current);
          current = ch;
        } else {
          current = next;
        }
      }
      if (current.length > 0) wrapped.push(current);
    }
    ctx.restore();
    return wrapped;
  }

  drawPanelShell(x, y, w, h, headerColor = "#00144a") {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.strokeStyle = "#4b6a9c";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);


    const hg = ctx.createLinearGradient(x, y, x + w, y + 28);
    hg.addColorStop(0, headerColor);
    hg.addColorStop(1, "#01245f");
    ctx.fillStyle = hg;
    ctx.fillRect(x, y, w, 28);

    ctx.fillStyle = "#e0f2ff";
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    ctx.fillText("C:/ROBOT_FRONTIER", x + 10, y + 19);
    ctx.restore();
  }

  drawPanelBezel(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
  }

  drawStartButton() {
    const ctx = this.ctx;
    const { x, y, w, h } = this.startButton;
    const hover = this.pointer.hover;
    const active = this.pointer.down && hover;
    const starting = this.phase === "starting";

    ctx.save();
    const pulse = Math.sin(this.cursorPhase / 320) * 0.08 + 0.12;
    ctx.shadowColor = "rgba(0,255,170,0.35)";
    ctx.shadowBlur = hover ? 26 : 12;
    const baseFill = active ? "#082030" : `rgba(7,23,37,${0.9 + pulse})`;
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, hover ? "#0d2d44" : "#0a2438");
    grad.addColorStop(1, baseFill);
    ctx.fillStyle = grad;
    ctx.strokeStyle = hover ? "#3fffff" : "#1ad1ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.drawRoundedRectPath(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = "20px 'Consolas','Courier New',monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = starting ? "#7fffd4" : hover ? "#b9fcff" : "#e4fdff";
    const label = starting ? "INITIALIZING..." : "[ START GAME PROTOCOL ]";
    ctx.fillText(label, x + w / 2, y + h / 2 + 7);
    ctx.restore();
  }

  drawFooter() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "center";
    const fgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    fgGrad.addColorStop(0, "#a4c8ff");
    fgGrad.addColorStop(1, "#86b0ff");
    ctx.fillStyle = fgGrad;
    const hintReady = this.phase === "ready";
    const hintAlpha = hintReady
      ? 0.6 + 0.4 * Math.abs(Math.sin(this.cursorPhase / 520))
      : 0.5;
    ctx.globalAlpha = hintAlpha;
    const hint = hintReady
      ? "ENTER / SPACE / TAP"
      : this.phase === "boot"
      ? "booting... (tap to skip)"
      : "syncing world... (tap to skip)";
    ctx.fillText(
      hint,
      this.width / 2,
      this.startButton.y + this.startButton.h + 26
    );
    ctx.restore();
  }

  drawRoundedRectPath(ctx, x, y, w, h, r = 4) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    const radius = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  handlePointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    this.pointer.x = (e.clientX - rect.left) * scaleX;
    this.pointer.y = (e.clientY - rect.top) * scaleY;
  }

  handlePointerDown(e) {
    if (this.sentStart) return;
    e.preventDefault();
    if (this.phase === "lore") {
      this.skipLore();
    } else if (this.phase === "boot") {
      this.skipBoot();
    }
    this.pointer.down = true;
    this.playAudioFeedback("click");
  }

  handlePointerUp(e) {
    if (this.sentStart) return;
    e.preventDefault();
    const inside = this.isPointerInsideButton();
    if (inside) {
      this.beginStart();
    }
    this.pointer.down = false;
  }

  handleKey(e) {
    if (this.sentStart) return;
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (this.phase === "lore") {
        this.skipLore();
      } else if (this.phase === "boot") {
        this.skipBoot();
      }
      this.beginStart();
    }
  }

  isPointerInsideButton() {
    const { x, y, w, h } = this.startButton;
    return (
      this.pointer.x >= x &&
      this.pointer.x <= x + w &&
      this.pointer.y >= y &&
      this.pointer.y <= y + h
    );
  }

  beginStart() {
    if (this.phase === "starting" || this.sentStart) return;
    if (this.phase === "lore") return;
    if (this.phase === "boot") return;
    this.phase = "starting";
    this.startCountdown = 700;
    this.playAudioFeedback("click");
  }

  skipBoot() {
    this.visibleBootLines = [...this.bootLines];
    this.bootCursor = this.bootLines.length;
    this.cooldownTimer = this.bootCooldown;
    this.phase = "ready";
    this.startStoryLoad();
  }

  skipLore() {
    this.loreVisible = [...this.loreLines];
    this.loreCursor = this.loreLines.length;
    this.loreCooldownTimer = this.loreCooldown;
    this.phase = "boot";
  }

  startStoryLoad() {
    if (this.storyLoadStarted) return;
    this.storyLoadStarted = true;
    this.storyLoading = true;
    this.storyLoadTimer = 0;
    this.storyLoadDots = 0;
  }

  updateStoryLoad(dt) {
    this.storyLoadTimer += dt;
    if (this.storyLoadTimer >= this.storyLoadDuration) {
      this.storyLoading = false;
      return;
    }
    if (this.storyLoadTimer % 240 < dt) {
      this.storyLoadDots += 1;
    }
  }
  finishStart() {
    if (this.sentStart) return;
    this.sentStart = true;
    this.phase = "done";
    this.playAudioFeedback("success");
    this.cleanup();
    window.dispatchEvent(
      new CustomEvent("gameStart", { detail: { autoStart: true } })
    );
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.listeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.listeners = [];

    if (this.audioContext && this.audioContext.state === "running") {
      this.audioContext.close();
    }
  }

  initAudioContext() {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      this.audioContext = null;
    }
  }

  playAudioFeedback(type = "click") {
    if (!this.audioContext) this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const makeTone = (freq, duration, offset = 0, gainValue = 0.08) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain).connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(gainValue, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + duration);
        osc.start(now + offset);
        osc.stop(now + offset + duration);
      };

      if (type === "click") {
        makeTone(880, 0.08, 0, 0.06);
        makeTone(660, 0.08, 0.05, 0.04);
      } else if (type === "success") {
        makeTone(520, 0.1, 0, 0.05);
        makeTone(720, 0.1, 0.08, 0.05);
        makeTone(1020, 0.12, 0.16, 0.04);
      }
    } catch (e) {

    }
  }
}

// ES6モジュールとしてエクスポート
export { clamp };
export { rnd };
export { pickWeighted };
export { rectsOverlap };
export { CONFIG };
export { ENEMY_SPRITES };
export { PLAYER_SPRITES };
export { OBJECT_TEMPLATES };
export { OBSTACLE_PATTERNS };
export { BACKGROUND_LAYERS };
export { ImageLoader };
export { GameState };
export { InputManager };
export { BackgroundManager };
export { ObstacleManager };
export { Player };
export { PlayerState };
export { Game };
export { StartScreen };
