// compile-multi.js - 複数ファイルをまとめてトランスパイル
const fs = require("fs");
const path = require("path");

// ソースコードのディレクトリ
const SOURCE_DIR = path.join(__dirname, "src", "modules");
const OUTPUT_DIR = path.join(__dirname, "src");
const OUTPUT_FILE = "combined-bundle.js";

// ファイル順序（依存関係を考慮）
const FILES = [
  "utils.js",
  "config.js",
  "ImageLoader.js",
  "GameState.js",
  "InputManager.js",
  "BackgroundManager.js",
  "ObstacleManager.js",
  "Player.js",
  "Game.js",
  "StartScreen.js",
];

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🚀 マルチファイル統合トランスパイラ");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// 1. 全ファイルを読み込んで結合
let combinedCode = "";
let fileCount = 0;
let allExports = new Set();
let allImports = [];

FILES.forEach((file) => {
  const filePath = path.join(SOURCE_DIR, file);
  try {
    let code = fs.readFileSync(filePath, "utf8");
    console.log(`✓ 読み込み: ${file} (${code.length} chars)`);

    // import文を削除（複数行対応）
    code = code.replace(
      /import\s+[\s\S]*?from\s+['"].*?['"];?\s*/gm,
      (match) => {
        allImports.push(match.trim());
        return `/* ${match.replace(/\n/g, " ").trim()} */\n`;
      }
    );

    // exportされているシンボルを記録（削除前に）
    const exportClassMatches = code.matchAll(/export\s+class\s+(\w+)/g);
    for (const match of exportClassMatches) {
      allExports.add(match[1]);
    }
    const exportFuncMatches = code.matchAll(
      /export\s+(?:const|let|var|function)\s+(\w+)/g
    );
    for (const match of exportFuncMatches) {
      allExports.add(match[1]);
    }
    const exportDefaultMatches = code.matchAll(
      /export\s+default\s+(?:class|function)?\s*(\w+)/g
    );
    for (const match of exportDefaultMatches) {
      if (match[1]) allExports.add(match[1]);
    }

    // export文を削除
    code = code.replace(/^export\s+/gm, "");
    code = code.replace(/^export\s+default\s+/gm, "");

    combinedCode += `\n// ========== ${file} ==========\n`;
    combinedCode += code;
    combinedCode += "\n";
    fileCount++;
  } catch (e) {
    console.log(`⚠️  スキップ: ${file} - ${e.message}`);
  }
});

console.log(
  `\n📦 統合完了: ${fileCount} ファイル (${combinedCode.length} chars)`
);

// 1.5 完璧なコメント削除処理
function removeComments(code) {
  let result = "";
  let i = 0;

  while (i < code.length) {
    // 文字列リテラル内をスキップ
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i];
      result += code[i];
      i++;
      // エスケープ文字を考慮して文字列を処理
      while (i < code.length) {
        if (code[i] === "\\") {
          result += code[i] + (code[i + 1] || "");
          i += 2;
        } else if (code[i] === quote) {
          result += code[i];
          i++;
          break;
        } else {
          result += code[i];
          i++;
        }
      }
    }
    // 複数行コメント
    else if (code[i] === "/" && code[i + 1] === "*") {
      // コメント開始をスキップ
      i += 2;
      // コメント終了まで進める
      while (i < code.length - 1) {
        if (code[i] === "*" && code[i + 1] === "/") {
          i += 2;
          break;
        }
        i++;
      }
    }
    // 単一行コメント
    else if (code[i] === "/" && code[i + 1] === "/") {
      // 行末までスキップ
      while (i < code.length && code[i] !== "\n") {
        i++;
      }
      // 改行は保持
      if (code[i] === "\n") {
        result += "\n";
        i++;
      }
    }
    // その他の文字
    else {
      result += code[i];
      i++;
    }
  }

  return result;
}

let cleanedCode = removeComments(combinedCode);
const originalLength = combinedCode.length;

// 空行と余分な空白の整理
cleanedCode = cleanedCode
  .split("\n")
  .map((line) => line.trimEnd()) // 行末の空白を削除
  .filter((line, idx, arr) => {
    // 3行以上連続する空行は2行に圧縮
    if (line === "" && arr[idx - 1] === "" && arr[idx - 2] === "") {
      return false;
    }
    return true;
  })
  .join("\n");

// 先頭と末尾の空白を削除
cleanedCode = cleanedCode.trim();

console.log(
  `\n✂️  コメント削除: ${originalLength} → ${
    cleanedCode.length
  } chars (${Math.round(
    (1 - cleanedCode.length / originalLength) * 100
  )}% 削減)`
);

// 2. ES6モジュールとしてエクスポート
const wrappedCode = `/**
 * Combined Game Bundle
 * Generated: ${new Date().toISOString()}
 * Source files: ${fileCount}
 */

${cleanedCode}

// ES6モジュールとしてエクスポート
${Array.from(allExports)
  .map((name) => `export { ${name} };`)
  .join("\n")}
`;

// 3. 統合されたファイルを保存
const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
fs.writeFileSync(outputPath, wrappedCode);
console.log(`\n✓ 統合ファイル作成: ${OUTPUT_FILE}`);
console.log(`   パス: ${outputPath}`);

// 4. 統計情報
console.log("\n📊 統計:");
console.log(`   • ソースファイル: ${fileCount}`);
console.log(`   • 削除されたimport文: ${allImports.length}`);
console.log(`   • エクスポートされたシンボル: ${allExports.size}`);
console.log(`   • 総コードサイズ: ${wrappedCode.length} chars`);
console.log(
  `   • コメント削除率: ${Math.round(
    (1 - cleanedCode.length / originalLength) * 100
  )}%`
);

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ 完了！");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
