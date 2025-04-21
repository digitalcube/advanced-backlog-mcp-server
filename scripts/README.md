# Single Executable Application (SEA) ビルド手順

このディレクトリには、Backlog MCPサーバーをNode.jsの[Single Executable Application (SEA)](https://nodejs.org/api/single-executable-applications.html)機能を使用して単一の実行可能ファイルにビルドするためのスクリプトが含まれています。

## 前提条件

- Node.js v21.0.0以上がインストールされていること
- 必要な依存パッケージ：`esbuild`と`postject`（package.jsonのdevDependenciesに追加するか、直接インストール）
- macOSユーザーは`codesign`ツールが使用可能であること（標準でインストール済み）
- 標準ビルド（`npm run build`）が完了していること

## スクリプトの説明

このディレクトリには以下のスクリプトが含まれています：

- `sea-mac.js` - macOS環境でSEAをビルドするためのスクリプト
- `sea-windows.js` - Windows環境でSEAをビルドするためのスクリプト

## 使用方法

### macOS環境での実行

```bash
# まず標準ビルドを実行
npm run build

# macOS用実行ファイルを生成
node ./scripts/sea-mac.js
```

### Windows環境での実行

```bash
# まず標準ビルドを実行
npm run build

# Windows用実行ファイルを生成
node ./scripts/sea-windows.js
```

## 生成されるファイル

ビルドプロセスが完了すると、以下のファイルが`dist`ディレクトリに生成されます：

- macOS: `backlog-sea` (実行ファイル)
- Windows: `backlog-sea.exe` (実行ファイル)

## package.jsonへの追加例

以下のようにpackage.jsonのscriptsセクションに追加することで、npm経由で実行できるようになります：

```json
"scripts": {
  "build:sea:mac": "node ./scripts/sea-mac.js",
  "build:sea:win": "node ./scripts/sea-windows.js"
}
```

## 参考

- [Node.js Single Executable Applications ドキュメント](https://nodejs.org/api/single-executable-applications.html)
- [MCPサーバーをexeにする記事](https://qiita.com/moritalous/items/6e02bcbf976d2e0c43d6)
