/**
 * ユーティリティ関数群
 */

/**
 * 値を指定範囲にクランプ
 * @param {number} v - 値
 * @param {number} a - 最小値
 * @param {number} b - 最大値
 * @returns {number} クランプされた値
 */
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * 指定範囲の乱数を生成
 * @param {number} a - 最小値
 * @param {number} b - 最大値
 * @returns {number} 乱数
 */
export const rnd = (a, b) => a + Math.random() * (b - a);

/**
 * 重み付きランダム選択
 * @template T
 * @param {Array<T & {prob?: number, weight?: number}>} list - 選択肢リスト
 * @param {string} [weightKey="prob"] - 重みプロパティ名（"prob"または"weight"）
 * @returns {T} 選択された要素
 */
export function pickWeighted(list, weightKey = "prob") {
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

/**
 * 矩形の重なり判定
 * @param {number} ax - A矩形のX座標
 * @param {number} ay - A矩形のY座標
 * @param {number} aw - A矩形の幅
 * @param {number} ah - A矩形の高さ
 * @param {number} bx - B矩形のX座標
 * @param {number} by - B矩形のY座標
 * @param {number} bw - B矩形の幅
 * @param {number} bh - B矩形の高さ
 * @returns {boolean} 重なっているかどうか
 */
export function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
