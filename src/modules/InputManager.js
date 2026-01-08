/**
 * 入力管理クラス
 * ユーザー入力を管理
 */
export class InputManager {
  /**
   * @param {Function} onDebugToggle - デバッグモード切り替え時のコールバック
   */
  constructor(onDebugToggle = null) {
    this.holding = false;
    this.justPressed = false;
    this.forwardHeld = false;
    this.backwardHeld = false;
    this.rangedPressed = false;
    this.onDebugToggle = onDebugToggle;
    this.setupListeners();
  }

  /**
   * イベントリスナーをセットアップ
   */
  setupListeners() {
    // キーマッピング定義（理論的配置：各機能に1キー）
    const keyMap = {
      forward: "d",
      backward: "a",
      jump: "Space",
      ranged: "pointer",
      debug: "g",
    };

    addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        if (keyMap.ranged === "pointer") {
          this.rangedPressed = true;
        }
      },
      { passive: false }
    );

    addEventListener(
      "pointerup",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    addEventListener("pointercancel", () => this.release(), { passive: true });
    addEventListener("blur", () => this.reset(), { passive: true });

    // キーボード入力（最適化版）
    addEventListener("keydown", (e) => {
      const key = e.code === "Space" ? "Space" : e.key.toLowerCase();

      // デバッグトグル
      if (key === keyMap.debug) {
        this.onDebugToggle?.();
        return;
      }

      // 前進
      if (key === keyMap.forward) {
        e.preventDefault();
        this.forwardHeld = true;
        return;
      }

      // 後退
      if (key === keyMap.backward) {
        e.preventDefault();
        this.backwardHeld = true;
        return;
      }

      // ジャンプ
      if (key === keyMap.jump) {
        e.preventDefault();
        this.press();
        return;
      }
    });

    addEventListener("keyup", (e) => {
      const key = e.code === "Space" ? "Space" : e.key.toLowerCase();

      // 前進解除
      if (key === keyMap.forward) {
        e.preventDefault();
        this.forwardHeld = false;
        return;
      }

      // 後退解除
      if (key === keyMap.backward) {
        e.preventDefault();
        this.backwardHeld = false;
        return;
      }

      // ジャンプ解除
      if (key === keyMap.jump) {
        e.preventDefault();
        this.release();
        return;
      }
    });
  }

  /**
   * 押下イベント
   */
  press() {
    this.justPressed = true;
    this.holding = true;
  }

  /**
   * 解放イベント
   */
  release() {
    this.holding = false;
  }

  /**
   * 押下状態を消費して取得
   */
  consumePress() {
    const pressed = this.justPressed;
    this.justPressed = false;
    return pressed;
  }

  /**
   * 遠距離攻撃の押下状態を消費して取得
   */
  consumeRanged() {
    const pressed = this.rangedPressed;
    this.rangedPressed = false;
    return pressed;
  }

  /**
   * ホールド状態を取得
   */
  isHolding() {
    return this.holding;
  }

  /**
   * 前進入力のホールド状態を取得
   */
  isForwardHeld() {
    return this.forwardHeld;
  }

  /**
   * 後退入力のホールド状態を取得
   */
  isBackwardHeld() {
    return this.backwardHeld;
  }

  /**
   * 入力状態をリセット
   */
  reset() {
    this.holding = false;
    this.justPressed = false;
    this.forwardHeld = false;
    this.backwardHeld = false;
    this.rangedPressed = false;
  }
}


