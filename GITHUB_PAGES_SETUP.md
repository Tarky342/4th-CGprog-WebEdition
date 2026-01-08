# GitHub Pages デプロイ設定ガイド

## ✅ 設定完了

このプロジェクトは GitHub Pages にデプロイする準備が整いました。

- **リポジトリ**: <https://github.com/Tarky342/4th-CGprog-WebEdition>
- **デプロイ URL**: <https://tarky342.github.io/4th-CGprog-WebEdition/>
- **ユーザー名**: TarKy342
- **デプロイ方法**: GitHub Actions (自動)

## セットアップ手順

### 1. 設定内容の確認

このプロジェクトでは以下が設定されています：

#### package.json

```json
"build:ghpages": "tsc && VITE_BASE_URL=/4th-CGprog-WebEdition/ vite build"
```

#### vite.config.js

```javascript
base: process.env.VITE_BASE_URL || "./";
```

#### GitHub Actions ワークフロー

`.github/workflows/deploy.yml` が作成されています。

### 2. 必要な依存関係のインストール（初回のみ）

```bash
npm install
```

### 3. GitHub リポジトリ設定

GitHub のリポジトリ設定を以下のように変更してください：

1. <https://github.com/Tarky342/4th-CGprog-WebEdition/settings/pages> にアクセス
2. **Source** → **GitHub Actions** を選択
3. 保存

### 4. デプロイ

コードを `main` ブランチにプッシュすると、自動的にビルドとデプロイが実行されます：

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

デプロイ完了後、以下の URL でアクセス可能になります：
**<https://tarky342.github.io/4th-CGprog-WebEdition/>**

## ローカルでビルドをテスト

GitHub Pages 用のビルドをローカルで確認：

```bash
npm run build:ghpages
npm run preview
```

`http://localhost:4173/4th-CGprog-WebEdition/` でアクセスしてテスト

## トラブルシューティング

### ページが表示されない

- GitHub Actions のワークフローが正常に完了したか確認
  - <https://github.com/Tarky342/4th-CGprog-WebEdition/actions>
- Settings → Pages で GitHub Actions が選択されているか確認
- base パスが `/4th-CGprog-WebEdition/` になっているか確認

### リソースが読み込まれない

- `vite.config.js` の `base` 設定を確認
- ブラウザの開発者ツールで 404 エラーをチェック

## ファイル構成

- `.github/workflows/deploy.yml` - GitHub Actions ワークフロー
- `package.json` - ビルドスクリプト設定
- `vite.config.js` - Vite ベースパス設定
- `GITHUB_PAGES_SETUP.md` - このドキュメント

## 参考リンク

- GitHub Pages 設定: <https://github.com/Tarky342/4th-CGprog-WebEdition/settings/pages>
- GitHub Actions: <https://github.com/Tarky342/4th-CGprog-WebEdition/actions>
- デプロイされたサイト: <https://tarky342.github.io/4th-CGprog-WebEdition/>
