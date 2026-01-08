/**
 * ゲーム状態管理クラス
 */
export class GameState {
  constructor() {
    this.mode = "start"; // "start" | "running" | "gameover"
    this.distance = 0;
    this.peakDistance = 0;
  }

  /**
   * ゲームを開始
   */
  start() {
    this.mode = "running";
    this.distance = 0;
    this.peakDistance = 0;
  }

  /**
   * ゲームオーバー
   */
  gameOver() {
    this.mode = "gameover";
  }

  /**
   * スタート画面に戻る
   */
  toStart() {
    this.mode = "start";
  }

  /**
   * ゲーム実行中かチェック
   */
  isRunning() {
    return this.mode === "running";
  }

  /**
   * ゲームオーバー状態かチェック
   */
  isGameOver() {
    return this.mode === "gameover";
  }

  /**
   * スタート画面かチェック
   */
  isStart() {
    return this.mode === "start";
  }

  /**
   * 距離を更新
   */
  updateDistance(delta, minDistance = 0) {
    this.distance += delta;
    if (this.distance < minDistance) this.distance = minDistance;
    if (this.distance < 0) this.distance = 0;
    if (this.distance > this.peakDistance) this.peakDistance = this.distance;
  }

  /**
   * 距離を取得
   */
  getDistance() {
    return this.distance;
  }

  /**
   * これまで到達した最大距離を取得
   */
  getPeakDistance() {
    return this.peakDistance;
  }

  /**
   * リセット
   */
  reset() {
    this.mode = "start";
    this.distance = 0;
    this.peakDistance = 0;
  }
}
