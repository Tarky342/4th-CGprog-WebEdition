/**
 * 画像ローダークラス
 * 画像のキャッシュとプリロードを管理
 */
export class ImageLoader {
  constructor() {
    /** @type {Map<string, HTMLImageElement>} */
    this.cache = new Map();
  }

  /**
   * 画像を読み込む（キャッシュから取得または新規作成）
   * @param {string} src - 画像パス
   * @returns {HTMLImageElement} 画像要素
   */
  load(src) {
    if (!this.cache.has(src)) {
      const img = new Image();
      img.src = src;
      this.cache.set(src, img);
    }
    return this.cache.get(src);
  }

  /**
   * 複数の画像を一括プリロード
   * @param {string[]} sources - 画像パスの配列
   * @returns {Promise<void>} プリロード完了のPromise
   */
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

  /**
   * 画像が読み込み済みかチェック
   * @param {string} src - 画像パス
   * @returns {boolean} 読み込み完了状態
   */
  isLoaded(src) {
    const img = this.cache.get(src);
    return img && img.complete && img.naturalWidth > 0;
  }
}
