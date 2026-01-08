/**
 * AudioManagerクラス
 * ゲームの音声（BGM、効果音）を管理
 */
export class AudioManager {
  constructor() {
    // 音声ファイルのパス
    this.sounds = {
      bgm: new Audio("sounds/BGM.mp3"),
      jump: new Audio("sounds/jumping.mp3"),
      step: new Audio("sounds/Step.mp3"),
      idle: new Audio("sounds/idle.mp3"),
      dead: new Audio("sounds/dead.mp3"),
    };

    // BGMはループ設定
    this.sounds.bgm.loop = true;
    this.sounds.idle.loop = true;

    // 音量設定
    this.sounds.bgm.volume = 0.3;
    this.sounds.jump.volume = 0.4;
    this.sounds.step.volume = 0.3;
    this.sounds.idle.volume = 0.2;
    this.sounds.dead.volume = 0.5;

    // ミュート状態
    this.muted = false;

    // 現在再生中のBGM
    this.currentBGM = null;
  }

  /**
   * BGMを再生
   * @param {string} key - サウンドキー（'bgm'など）
   */
  playBGM(key = "bgm") {
    if (this.muted) return;

    const sound = this.sounds[key];
    if (!sound) return;

    // 既存のBGMを停止
    if (this.currentBGM && this.currentBGM !== sound) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
    }

    this.currentBGM = sound;

    // 再生を試みる（ユーザーインタラクション後のみ動作）
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("BGM auto-play prevented:", error);
      });
    }
  }

  /**
   * BGMを停止
   */
  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
  }

  /**
   * 効果音を再生
   * @param {string} key - サウンドキー
   */
  play(key) {
    if (this.muted) return;

    const sound = this.sounds[key];
    if (!sound) return;

    // BGM以外は最初から再生（重複再生可能）
    if (key !== "bgm" && key !== "idle") {
      const clone = sound.cloneNode();
      clone.volume = sound.volume;
      const playPromise = clone.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Sound play prevented:", error);
        });
      }
    } else {
      sound.currentTime = 0;
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Sound play prevented:", error);
        });
      }
    }
  }

  /**
   * 効果音を停止
   * @param {string} key - サウンドキー
   */
  stop(key) {
    const sound = this.sounds[key];
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
  }

  /**
   * すべての音声を停止
   */
  stopAll() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.currentBGM = null;
  }

  /**
   * ミュート切り替え
   */
  toggleMute() {
    this.muted = !this.muted;

    if (this.muted) {
      this.stopAll();
    }

    return this.muted;
  }

  /**
   * ミュート状態を設定
   * @param {boolean} muted
   */
  setMute(muted) {
    this.muted = muted;

    if (this.muted) {
      this.stopAll();
    }
  }

  /**
   * 音量を設定
   * @param {string} key - サウンドキー
   * @param {number} volume - 音量（0.0〜1.0）
   */
  setVolume(key, volume) {
    const sound = this.sounds[key];
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume));
    }
  }
}
