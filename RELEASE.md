# Backlogアプリケーションのリリース方法

このドキュメントでは、Backlogアプリケーションのビルドとリリース配布方法について説明します。

## リリース準備

### 1. バージョン更新

リリース前に`package.json`のバージョンを更新します：

```bash
# package.jsonのバージョンを手動で更新するか、npm versionコマンドを使用
npm version patch  # パッチバージョンを上げる
npm version minor  # マイナーバージョンを上げる
npm version major  # メジャーバージョンを上げる
```

### 2. SEAバイナリのビルド

```bash
# 必要なパッケージをインストール
npm install

# ビルドスクリプトを実行
npm run build      # TypeScriptのビルド

# macOS向けビルド
node scripts/sea-mac.js

# Windows向けビルド
node scripts/sea-windows.js
```

ビルドが成功すると、以下のディレクトリとファイルが生成されます：

#### macOS向け（`dist/macos`ディレクトリ）
- `advanced-backlog-mcp` - macOS用実行可能なSEAバイナリ
- `advanced-backlog-mcp.blob` - SEAブロブファイル
- `sea-bundle.js` - バンドルされたJavaScriptファイル
- `sea-config.json` - SEA設定ファイル

#### Windows向け（`dist/windows`ディレクトリ）
- `advanced-backlog-mcp.exe` - Windows用実行可能なSEAバイナリ
- `advanced-backlog-mcp.blob` - SEAブロブファイル
- `sea-bundle.js` - バンドルされたJavaScriptファイル
- `sea-config.json` - SEA設定ファイル

## GitHubリリースの作成

### 1. 変更をコミットしてプッシュ

```bash
git add .
git commit -m "Release vX.Y.Z"
git push origin main
```

### 2. Gitタグを作成

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

### 3. GitHubリリースの作成

1. GitHubリポジトリページにアクセス
2. 「Releases」タブをクリック
3. 「Draft a new release」ボタンをクリック
4. 作成したタグを選択（例：`vX.Y.Z`）
5. リリースタイトルを入力（例：「Backlog v1.0.0」）
6. リリースノートを記入（変更点や新機能などを説明）
7. ビルドされたバイナリをドラッグ＆ドロップしてアップロード
   - macOS用: `dist/macos/advanced-backlog-mcp`
   - Windows用: `dist/windows/advanced-backlog-mcp.exe`
8. 「Publish release」ボタンをクリック

## ユーザーのインストール方法

リリースページから配布されたバイナリをインストールする方法をユーザーに案内します：

### macOSユーザー向け

TBD

### Windowsユーザー向け

TBD

## リリース自動化（オプション）

GitHub Actionsを使用してリリースプロセスを自動化することも可能です。以下の手順で設定できます：

1. `.github/workflows/release.yml`ファイルを作成
2. ワークフローを設定して、タグプッシュ時に自動的にビルドとリリースを行う
3. クロスプラットフォームビルドを設定して、各OS向けバイナリを生成

詳細な設定方法については、GitHub Actionsのドキュメントを参照してください。 