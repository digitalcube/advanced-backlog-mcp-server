import * as backlogjs from 'backlog-js';
import type { ActivityResult, BacklogActivity } from "./types.js";
import { CommentFilter, MeaningfulChangeFilter, OrFilter } from "./filters.js";
import type { ActivityFilter } from "./filters.js";
import { MarkdownReportGenerator, TemplateReportGenerator } from "./generators.js";
import type { ReportGenerator, ReportGeneratorConfig } from "./generators.js";

/**
 * Backlogアクティビティサービス設定
 */
export interface BacklogActivityServiceConfig {
  /**
   * カスタムフィルタ
   */
  filter?: ActivityFilter;
  
  /**
   * レポート設定
   */
  reportConfig?: ReportGeneratorConfig;
  
  /**
   * カスタムレポートジェネレータ
   */
  reportGenerator?: ReportGenerator;
}

/**
 * Backlogアクティビティサービス
 * OCPの原則に従い、フィルタやレポート生成機能の変更・拡張に柔軟に対応
 */
export class BacklogActivityService {
  private filter: ActivityFilter;
  private reportGenerator: ReportGenerator;

  /**
   * コンストラクタ
   * @param backlog Backlog APIクライアント
   * @param config サービス設定
   */
  constructor(
    private backlog: backlogjs.Backlog,
    config: BacklogActivityServiceConfig = {}
  ) {
    // デフォルトはコメントか意味のある変更があるもの
    this.filter = config.filter || new OrFilter([
      new CommentFilter(),
      new MeaningfulChangeFilter()
    ]);
    
    if (config.reportGenerator) {
      this.reportGenerator = config.reportGenerator;
    } else {
      // 新しいテンプレートジェネレータを使用
      this.reportGenerator = new TemplateReportGenerator(config.reportConfig || {});
    }
  }

  /**
   * フィルタを設定
   * @param filter 設定するフィルタ
   */
  setFilter(filter: ActivityFilter): void {
    this.filter = filter;
  }

  /**
   * レポートジェネレータを設定
   * @param generator 設定するレポートジェネレータ
   */
  setReportGenerator(generator: ReportGenerator): void {
    this.reportGenerator = generator;
  }
  
  /**
   * レポート設定を変更
   * @param config レポート設定
   */
  configureReport(config: ReportGeneratorConfig): void {
    if ('configure' in this.reportGenerator) {
      this.reportGenerator.configure(config);
    } else {
      // configurableでない場合は警告
      console.warn('このレポートジェネレータは設定変更に対応していません');
    }
  }

  /**
   * 特定日付のアクティビティを取得
   * @param userId ユーザーID
   * @param date 日付（YYYY-MM-DD形式の文字列）
   * @returns アクティビティ結果
   */
  async getMeaningfulActivities(userId: number, date: string): Promise<ActivityResult> {
    const formattedDate = (date ? new Date(date) : new Date()).toISOString().split('T')[0];
    
    // アクティビティを取得
    const activities = await this.backlog.getUserActivities(userId, {
      count: 100 // より多くのアクティビティを取得
    });
    
    // 特定の日のアクティビティだけをフィルタリング
    const dayActivities = activities.filter((activity: any) => {
      const activityDate = activity.created.split('T')[0];
      return activityDate === formattedDate;
    });
    
    // バックログのAPIから返されるオブジェクトの型が一致しない可能性があるため、
    // 型キャストして処理を続行
    const typedDayActivities = dayActivities as unknown as BacklogActivity[];
    
    // 重要なアクティビティをフィルタリング
    const meaningfulActivities = typedDayActivities.filter(activity => this.filter.filter(activity));
    
    // プロジェクト別にグループ化
    const groupedByProject = this.groupByProject(meaningfulActivities);
    
    // レポート生成
    const report = this.reportGenerator.generate(meaningfulActivities);
    
    return {
      date: formattedDate,
      activities: meaningfulActivities,
      groupedByProject,
      //report
    } as any;
  }

  /**
   * プロジェクト別にアクティビティをグループ化
   * @private
   * @param activities アクティビティリスト
   * @returns プロジェクトキーをキーとするアクティビティマップ
   */
  private groupByProject(activities: BacklogActivity[]): Record<string, BacklogActivity[]> {
    const groupedByProject: Record<string, BacklogActivity[]> = {};
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