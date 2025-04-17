import type { BacklogActivity, BacklogChange, ProjectActivitiesMap } from "./types.js";

/**
 * アクティビティタイプに対応するラベル定義
 */
interface ActivityTypeLabels {
  created: string;
  updated: string;
  commented: string;
  bulkUpdated: string;
  defaultAction: string;
}

/**
 * レポート内で使用する文字列リソース
 */
interface ReportResources {
  noActivities: string;
  changeTitle: string;
  noneValue: string;
  byUser: string;
  activityTypes: ActivityTypeLabels;
}

/**
 * 日本語リソース
 */
const jaResources: ReportResources = {
  noActivities: "この日の作業記録はありません。",
  changeTitle: "変更内容:",
  noneValue: "(なし)",
  byUser: "by",
  activityTypes: {
    created: "🆕 作成",
    updated: "✏️ 更新",
    commented: "💬 コメント",
    bulkUpdated: "📝 一括更新",
    defaultAction: "⚙️ アクション"
  }
};

/**
 * 英語リソース
 */
const enResources: ReportResources = {
  noActivities: "No activities for this day.",
  changeTitle: "Changes:",
  noneValue: "(none)",
  byUser: "by",
  activityTypes: {
    created: "🆕 Created",
    updated: "✏️ Updated",
    commented: "💬 Commented",
    bulkUpdated: "📝 Bulk updated",
    defaultAction: "⚙️ Action"
  }
};

/**
 * 言語リソースマップ
 */
const resourcesMap: Record<string, ReportResources> = {
  ja: jaResources,
  en: enResources
};

/**
 * テンプレートインターフェース
 * 各種コンテンツのフォーマット方法を定義
 */
export interface ReportTemplate {
  /**
   * アクティビティなしの場合のメッセージ
   */
  formatNoActivities(): string;
  
  /**
   * プロジェクトヘッダー
   */
  formatProjectHeader(projectKey: string, projectName: string): string;
  
  /**
   * アクティビティヘッダー
   */
  formatActivityHeader(prefix: string, summary: string, keyId: number): string;
  
  /**
   * コメント内容
   */
  formatComment(content: string): string;
  
  /**
   * 変更内容のヘッダー
   */
  formatChangesHeader(): string;
  
  /**
   * 変更内容の1行
   */
  formatChangeLine(field: string, oldValue: string | null, newValue: string | null): string;
  
  /**
   * 作成情報
   */
  formatCreationInfo(time: string, username: string): string;
  
  /**
   * アクティビティ間の区切り
   */
  formatSeparator(): string;
  
  /**
   * レポート全体のラッピング
   */
  wrapReport(content: string): string;
}

/**
 * マークダウンテンプレート
 */
export class MarkdownTemplate implements ReportTemplate {
  constructor(
    private resources: ReportResources
  ) {}
  
  formatNoActivities(): string {
    return this.resources.noActivities;
  }
  
  formatProjectHeader(projectKey: string, projectName: string): string {
    return `## ${projectKey}: ${projectName}\n\n`;
  }
  
  formatActivityHeader(prefix: string, summary: string, keyId: number): string {
    return `### ${prefix}: ${summary} (#${keyId})\n`;
  }
  
  formatComment(content: string): string {
    return `\n${content}\n\n`;
  }
  
  formatChangesHeader(): string {
    return `**${this.resources.changeTitle}**\n\n`;
  }
  
  formatChangeLine(field: string, oldValue: string | null, newValue: string | null): string {
    const oldText = oldValue || this.resources.noneValue;
    const newText = newValue || this.resources.noneValue;
    return `- ${field}: ${oldText} → ${newText}\n`;
  }
  
  formatCreationInfo(time: string, username: string): string {
    return `*${time} ${this.resources.byUser} ${username}*\n\n`;
  }
  
  formatSeparator(): string {
    return "---\n\n";
  }
  
  wrapReport(content: string): string {
    return content;
  }
}

/**
 * シンプルテキストテンプレート
 */
export class TextTemplate implements ReportTemplate {
  constructor(
    private resources: ReportResources
  ) {}
  
  formatNoActivities(): string {
    return this.resources.noActivities;
  }
  
  formatProjectHeader(projectKey: string, projectName: string): string {
    return `[${projectKey}] ${projectName}\n\n`;
  }
  
  formatActivityHeader(prefix: string, summary: string, keyId: number): string {
    return `${prefix}: ${summary} (#${keyId})\n`;
  }
  
  formatComment(content: string): string {
    return `\n${content}\n\n`;
  }
  
  formatChangesHeader(): string {
    return `${this.resources.changeTitle}\n`;
  }
  
  formatChangeLine(field: string, oldValue: string | null, newValue: string | null): string {
    const oldText = oldValue || this.resources.noneValue;
    const newText = newValue || this.resources.noneValue;
    return `* ${field}: ${oldText} → ${newText}\n`;
  }
  
  formatCreationInfo(time: string, username: string): string {
    return `${time} ${this.resources.byUser} ${username}\n\n`;
  }
  
  formatSeparator(): string {
    return "----------\n\n";
  }
  
  wrapReport(content: string): string {
    return content;
  }
}

/**
 * HTMLテンプレート
 */
export class HtmlTemplate implements ReportTemplate {
  constructor(
    private resources: ReportResources
  ) {}
  
  formatNoActivities(): string {
    return `<p>${this.resources.noActivities}</p>`;
  }
  
  formatProjectHeader(projectKey: string, projectName: string): string {
    return `<h2>${projectKey}: ${projectName}</h2>`;
  }
  
  formatActivityHeader(prefix: string, summary: string, keyId: number): string {
    return `<h3>${prefix}: ${summary} (#${keyId})</h3>`;
  }
  
  formatComment(content: string): string {
    return `<div class="comment">${content.replace(/\n/g, '<br>')}</div>`;
  }
  
  formatChangesHeader(): string {
    return `<h4>${this.resources.changeTitle}</h4><ul>`;
  }
  
  formatChangeLine(field: string, oldValue: string | null, newValue: string | null): string {
    const oldText = oldValue || this.resources.noneValue;
    const newText = newValue || this.resources.noneValue;
    return `<li>${field}: ${oldText} → ${newText}</li>`;
  }
  
  formatCreationInfo(time: string, username: string): string {
    return `<div class="meta"><em>${time} ${this.resources.byUser} ${username}</em></div>`;
  }
  
  formatSeparator(): string {
    return `</ul><hr>`;
  }
  
  wrapReport(content: string): string {
    return `<div class="backlog-report">${content}</div>`;
  }
}

/**
 * 日付フォーマッターインターフェース
 */
export interface DateFormatter {
  /**
   * 時刻を整形
   */
  formatTime(dateString: string): string;
}

/**
 * デフォルトの日付フォーマッター
 */
export class DefaultDateFormatter implements DateFormatter {
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * レポート生成設定
 */
export interface ReportGeneratorConfig {
  /**
   * 言語（デフォルト: 'ja'）
   */
  language?: string;
  
  /**
   * テンプレートタイプ（デフォルト: 'markdown'）
   */
  templateType?: 'markdown' | 'text' | 'html';
  
  /**
   * カスタムテンプレート
   */
  customTemplate?: ReportTemplate;
  
  /**
   * 日付フォーマッター
   */
  dateFormatter?: DateFormatter;
}

/**
 * レポート生成インターフェース
 */
export interface ReportGenerator {
  /**
   * 指定したアクティビティのレポートを生成する
   * @param activities バックログアクティビティの配列
   * @returns 生成されたレポート
   */
  generate(activities: BacklogActivity[]): string;
  
  /**
   * 設定を変更する
   * @param config 新しい設定
   */
  configure(config: ReportGeneratorConfig): void;
}

/**
 * テンプレートベースのレポートジェネレーター
 */
export class TemplateReportGenerator implements ReportGenerator {
  private template: ReportTemplate;
  private resources: ReportResources;
  private dateFormatter: DateFormatter;
  
  /**
   * コンストラクタ
   * @param config レポート生成設定
   */
  constructor(config: ReportGeneratorConfig = {}) {
    this.resources = resourcesMap[config.language || 'ja'] || jaResources;
    this.dateFormatter = config.dateFormatter || new DefaultDateFormatter();
    
    if (config.customTemplate) {
      this.template = config.customTemplate;
    } else {
      switch (config.templateType || 'markdown') {
        case 'text':
          this.template = new TextTemplate(this.resources);
          break;
        case 'html':
          this.template = new HtmlTemplate(this.resources);
          break;
        case 'markdown':
        default:
          this.template = new MarkdownTemplate(this.resources);
      }
    }
  }
  
  /**
   * 設定を変更する
   * @param config 新しい設定
   */
  configure(config: ReportGeneratorConfig): void {
    if (config.language) {
      this.resources = resourcesMap[config.language] || this.resources;
    }
    
    if (config.dateFormatter) {
      this.dateFormatter = config.dateFormatter;
    }
    
    if (config.customTemplate) {
      this.template = config.customTemplate;
    } else if (config.templateType) {
      switch (config.templateType) {
        case 'text':
          this.template = new TextTemplate(this.resources);
          break;
        case 'html':
          this.template = new HtmlTemplate(this.resources);
          break;
        case 'markdown':
        default:
          this.template = new MarkdownTemplate(this.resources);
      }
    }
  }
  
  /**
   * アクティビティタイプからラベルを取得
   */
  private getActivityTypeLabel(type: number): string {
    switch (type) {
      case 1: return this.resources.activityTypes.created;
      case 2: return this.resources.activityTypes.updated;
      case 3: return this.resources.activityTypes.commented;
      case 14: return this.resources.activityTypes.bulkUpdated;
      default: return this.resources.activityTypes.defaultAction;
    }
  }
  
  /**
   * マークダウン形式のレポートを生成する
   * @param activities バックログアクティビティの配列
   * @returns マークダウン形式のレポート
   */
  generate(activities: BacklogActivity[]): string {
    if (activities.length === 0) {
      return this.template.formatNoActivities();
    }

    let report = "";
    
    // プロジェクト別にグループ化
    const groupedByProject = this.groupByProject(activities);
    
    // プロジェクト別にレポート生成
    Object.entries(groupedByProject).forEach(([projectKey, projectActivities]) => {
      report += this.template.formatProjectHeader(projectKey, projectActivities[0].project.name);
      
      projectActivities.forEach((activity: BacklogActivity) => {
        // アクティビティのタイプに応じたプレフィックス
        const prefix = this.getActivityTypeLabel(activity.type);
        
        // タイトルとチケット番号
        report += this.template.formatActivityHeader(prefix, activity.content.summary, activity.content.key_id);
        
        // コメントがあれば追加
        if (activity.content.comment && activity.content.comment.content) {
          report += this.template.formatComment(activity.content.comment.content);
        }
        
        // 変更内容があれば追加
        if (activity.content.changes && activity.content.changes.length > 0) {
          report += this.template.formatChangesHeader();
          activity.content.changes.forEach((change: BacklogChange) => {
            const fieldName = change.field_text || change.field;
            report += this.template.formatChangeLine(fieldName, change.old_value, change.new_value);
          });
        }
        
        // 作成時間と作成者
        const createdTime = this.dateFormatter.formatTime(activity.created);
        report += this.template.formatCreationInfo(createdTime, activity.createdUser.name);
        
        report += this.template.formatSeparator();
      });
    });
    
    return this.template.wrapReport(report);
  }
  
  /**
   * プロジェクト別にアクティビティをグループ化
   * @private
   * @param activities アクティビティリスト
   * @returns プロジェクトキーをキーとするアクティビティマップ
   */
  private groupByProject(activities: BacklogActivity[]): ProjectActivitiesMap {
    const groupedByProject: ProjectActivitiesMap = {};
    activities.forEach((activity: BacklogActivity) => {
      const projectKey = activity.project.projectKey;
      if (!groupedByProject[projectKey]) {
        groupedByProject[projectKey] = [];
      }
      groupedByProject[projectKey].push(activity);
    });
    return groupedByProject;
  }
}

/**
 * レガシーな互換性のためのマークダウンレポートジェネレータ
 * 以前のAPIとの互換性を維持するためのクラス
 */
export class MarkdownReportGenerator implements ReportGenerator {
  private templateGenerator: TemplateReportGenerator;
  
  constructor(config: ReportGeneratorConfig = {}) {
    this.templateGenerator = new TemplateReportGenerator({
      ...config,
      templateType: 'markdown'
    });
  }
  
  generate(activities: BacklogActivity[]): string {
    return this.templateGenerator.generate(activities);
  }
  
  configure(config: ReportGeneratorConfig): void {
    this.templateGenerator.configure({
      ...config,
      templateType: 'markdown'
    });
  }
} 