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
node scripts/sea.js  # SEAバイナリの生成
```

ビルドが成功すると、`dist`ディレクトリに以下のファイルが生成されます：
- `backlog-sea` - 実行可能なSEAバイナリ
- `backlog-sea.blob` - SEAブロブファイル
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
7. `dist/backlog-sea`ファイルをドラッグ＆ドロップしてアップロード
   - macOS用とWindows用に別々のバイナリを用意する場合は、ファイル名を変更（例：`backlog-sea-macos`、`backlog-sea-win.exe`）
8. 「Publish release」ボタンをクリック

## ユーザーのインストール方法

リリースページから配布されたバイナリをインストールする方法をユーザーに案内します：

### macOSユーザー向け

```bash
# リリースページからダウンロードしたバイナリを実行可能にする
chmod +x backlog-sea

# PATHの通ったディレクトリに移動（オプション）
sudo mv backlog-sea /usr/local/bin/backlog

# 実行
backlog
```

### Windowsユーザー向け

```
1. リリースページからbacklog-sea-win.exeをダウンロード
2. 任意のディレクトリに保存
3. コマンドプロンプトまたはPowerShellから実行
   > path\to\backlog-sea-win.exe
```

## リリース自動化（オプション）

GitHub Actionsを使用してリリースプロセスを自動化することも可能です。以下の手順で設定できます：

1. `.github/workflows/release.yml`ファイルを作成
2. ワークフローを設定して、タグプッシュ時に自動的にビルドとリリースを行う
3. クロスプラットフォームビルドを設定して、各OS向けバイナリを生成

詳細な設定方法については、GitHub Actionsのドキュメントを参照してください。 