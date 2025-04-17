# Backlog アクティビティレポートジェネレーター

このモジュールは、Backlog API から取得したアクティビティを整形し、様々なフォーマットでレポートを生成するための機能を提供します。

## 主な機能

- **フィルタリング**: 無意味なアクティビティを除外し、実際の作業内容のみを抽出
- **複数フォーマット対応**: Markdown、プレーンテキスト、HTML形式でのレポート出力
- **多言語対応**: 日本語/英語のレポート生成
- **カスタマイズ可能**: テンプレートやフィルターのカスタマイズが簡単

## インストール

```bash
# 例：npmでインストールする場合
npm install backlog-activity-reporter
```

## 基本的な使い方

### サービスを使用して直接アクティビティを取得・レポート生成

```typescript
import { BacklogActivityService } from './backlog/index.js';
import * as backlogjs from 'backlog-js';

// Backlog API クライアントを初期化
const backlog = new backlogjs.Backlog({
  host: 'your-space.backlog.jp',
  apiKey: 'your-api-key'
});

// サービスを初期化
const service = new BacklogActivityService(backlog);

// 特定の日付のアクティビティを取得してレポート生成
const result = await service.getMeaningfulActivities(userId, '2023-04-01');

// 結果には以下が含まれます
console.log(result.date);        // 日付
console.log(result.activities);  // フィルタリングされたアクティビティ一覧
console.log(result.report);      // 生成されたレポート
```

### レポート形式のカスタマイズ

```typescript
import { BacklogActivityService, TemplateReportGenerator } from './backlog/index.js';

// Markdownレポート（英語）
const service = new BacklogActivityService(backlog, {
  reportConfig: {
    language: 'en',
    templateType: 'markdown'
  }
});

// または後から設定を変更
service.configureReport({
  language: 'ja',
  templateType: 'html'
});

// レポート生成結果を取得
const result = await service.getMeaningfulActivities(userId, '2023-04-01');
```

### フィルターのカスタマイズ

```typescript
import { 
  BacklogActivityService, 
  CommentFilter, 
  MeaningfulChangeFilter,
  OrFilter 
} from './backlog/index.js';

// コメントのみを含めるフィルター
const commentOnlyFilter = new CommentFilter();

// 意味のある変更とコメントを含めるフィルター（デフォルト）
const defaultFilter = new OrFilter([
  new CommentFilter(),
  new MeaningfulChangeFilter()
]);

// コンストラクタで設定
const service = new BacklogActivityService(backlog, {
  filter: commentOnlyFilter
});

// または後から変更
service.setFilter(defaultFilter);
```

## 高度な使い方

### カスタムテンプレートの作成

独自のテンプレートを作成することで、出力形式を完全にカスタマイズできます。

```typescript
import { 
  ReportTemplate, 
  TemplateReportGenerator, 
  type ReportGeneratorConfig 
} from './backlog/index.js';

// カスタムテンプレート実装
class CSVTemplate implements ReportTemplate {
  constructor(private resources: any) {}
  
  formatNoActivities(): string {
    return "No activities";
  }
  
  formatProjectHeader(projectKey: string, projectName: string): string {
    return `"${projectKey}","${projectName}"\n`;
  }
  
  // 他のメソッドも実装...
  
  wrapReport(content: string): string {
    return "Project,Name,Type,Summary,Comment\n" + content;
  }
}

// カスタムテンプレートの使用
const config: ReportGeneratorConfig = {
  customTemplate: new CSVTemplate(/* リソースオブジェクト */)
};

const generator = new TemplateReportGenerator(config);
// または
const service = new BacklogActivityService(backlog, { reportConfig: config });
```

### 日付フォーマッターのカスタマイズ

```typescript
import { DateFormatter } from './backlog/index.js';

class ISODateFormatter implements DateFormatter {
  formatTime(dateString: string): string {
    return new Date(dateString).toISOString();
  }
}

const service = new BacklogActivityService(backlog, {
  reportConfig: {
    dateFormatter: new ISODateFormatter()
  }
});
```

### フィルターの組み合わせ

複雑なフィルタリング条件を作成できます。

```typescript
import { 
  CommentFilter, 
  MeaningfulChangeFilter, 
  AndFilter, 
  NotFilter 
} from './backlog/index.js';

// コメントがあり、かつ意味のある変更のないアクティビティ
const complexFilter = new AndFilter([
  new CommentFilter(),
  new NotFilter(new MeaningfulChangeFilter())
]);

const service = new BacklogActivityService(backlog, {
  filter: complexFilter
});
```

## インターフェース解説

### アクティビティフィルター

- `ActivityFilter`: フィルターの基本インターフェース
- `CommentFilter`: コメントのあるアクティビティを通過させる
- `MeaningfulChangeFilter`: 意味のある変更のあるアクティビティを通過させる
- `OrFilter`, `AndFilter`, `NotFilter`: 複合フィルター

### レポートテンプレート

- `ReportTemplate`: テンプレートの基本インターフェース
- `MarkdownTemplate`: マークダウン形式出力
- `TextTemplate`: プレーンテキスト形式出力
- `HtmlTemplate`: HTML形式出力

### レポートジェネレーター

- `ReportGenerator`: ジェネレーターの基本インターフェース
- `TemplateReportGenerator`: テンプレートベースのレポートジェネレーター

### 設定オプション

- `ReportGeneratorConfig`: レポート生成設定
  - `language`: 言語設定（'ja'または'en'）
  - `templateType`: テンプレートタイプ（'markdown', 'text', 'html'）
  - `customTemplate`: カスタムテンプレート
  - `dateFormatter`: 日付フォーマッター

## 設計原則

このモジュールは以下の設計原則に基づいて実装されています：

- **OCP (開放閉鎖原則)**: 既存コードを変更せずに拡張可能
- **DIP (依存性逆転の原則)**: 具象クラスではなくインターフェースに依存
- **SRP (単一責任の原則)**: 各クラスは明確に定義された責任を持つ
- **ISP (インターフェース分離の原則)**: 特化したインターフェースを利用

## コントリビューション

バグ報告や機能追加のリクエストは、GitHub Issues で受け付けています。
プルリクエストも歓迎します。

## ライセンス

MIT 