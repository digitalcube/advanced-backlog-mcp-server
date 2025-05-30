# Backlog MCP サーバー

これは、プロジェクト管理ツールであるBacklogとやり取りするためのModel Context Protocol (MCP) サーバーです。このサーバーは、プロジェクト、課題、Wiki、ユーザーアクティビティなどのBacklogリソースを照会および管理するためのツールを提供します。

## 機能

- Backlogスペース情報の取得
- プロジェクトの一覧表示と検索
- 課題の検索、表示、管理
- Wikiページへのアクセス
- ユーザーアクティビティと通知の表示
- ユーザー情報の取得

## 要件

- Node.js（v14以降）
- APIキーを持つBacklogアカウント

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/digitalcube/advanced-backlog-mcp-server.git
cd advanced-backlog-mcp-server

# 依存関係のインストール
npm install

# サーバーのビルド
npm run build
```

## 設定

### Claude Desktopの設定

Backlog MCPサーバーをClaude Desktopで使用するには、以下の設定ファイルを編集します：

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "advanced-backlog-mcp-server": {
      "command": "/path/to/advanced-backlog-mcp-server/build/index.js",
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

### コマンドパスの取得方法

`command`フィールドに正しいパスを設定するには、ビルド後にリポジトリディレクトリで以下のコマンドを実行します：

```bash
echo "\"$(pwd)/build/index.js\""
```

これにより、`command`フィールドに使用するパスが表示されます。

例：`"/Users/username/development/mcp-servers/advanced-backlog-mcp-server/build/index.js"`

macOSでは、以下のコマンドでクリップボードに直接コピーできます：
```bash
echo "\"$(pwd)/build/index.js\"" | pbcopy
```

変更を保存したあとは、必ずClaude DesktopやCursorアプリを再起動してください。

### APIキーの設定

APIキーはBacklogアカウント設定から取得できます。

## 使用方法

設定完了後、Claude Desktopまたはその他のMCP互換クライアントでサーバーを使用できます。

Claude Desktopでは、以下のような自然言語クエリが可能です：
- 「最近の課題をすべて表示して」
- 「Backlogスペース内のすべてのプロジェクトを一覧表示して」
- 「優先度の高い自分に割り当てられた課題を検索して」
- 「Backlogを調べて、一昨日の私がやったタスクについて取りまとめて」

## 利用可能なツール

このサーバーは以下のツールを提供しています：

- `list_backlog_recently_viewed_issues` - 最近表示された課題を一覧表示
- `list_backlog_recently_viewed_projects` - 最近表示されたプロジェクトを一覧表示
- `list_backlog_recently_viewed_wikis` - 最近表示されたWikiを一覧表示
- `list_backlog_recent_user_activities` - 特定のユーザーのアクティビティを一覧表示
- `list_backlog_daily_activities` - 特定のユーザーの特定日におけるアクティビティを取得

基本的なAPI操作については、[公式MCPサーバー](https://github.com/nulab/backlog-mcp-server/)をご利用ください。

https://github.com/nulab/backlog-mcp-server/

## デバッグ

MCPサーバーのデバッグには、MCP Inspectorを使用できます：

```bash
npm run inspector
```

これにより、ブラウザでデバッグツールにアクセスするためのURLが表示されます。

## MCPクライアントとの統合

このサーバーはMCP互換のクライアントと連携するように設計されています。クライアントのドキュメントに従って、このサーバーに接続してください。

## ライセンス

MIT 
