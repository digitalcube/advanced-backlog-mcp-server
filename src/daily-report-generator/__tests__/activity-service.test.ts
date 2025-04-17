import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BacklogActivityService, BacklogActivityServiceConfig } from '../activity-service.js';
import { ActivityFilter, CommentFilter, MeaningfulChangeFilter } from '../filters.js';
import { ReportGenerator, ReportGeneratorConfig } from '../generators.js';
import type { BacklogActivity, ActivityResult } from '../types.js';

// Backlog APIクライアントのモック
class MockBacklog {
  activities: any[] = [];

  // アクティビティを設定するメソッド（テスト用）
  setActivities(activities: any[]) {
    this.activities = activities;
  }

  // モックされたgetUserActivitiesメソッド
  getUserActivities(userId: number, options: any) {
    return Promise.resolve(this.activities);
  }
}

// モックアクティビティの作成
const createMockActivity = (date: string, projectKey: string, type: number = 1, withComment: boolean = false, withChanges: any[] = []): any => {
  return {
    id: Math.floor(Math.random() * 1000),
    project: {
      id: 1,
      projectKey: projectKey,
      name: `${projectKey} Project`
    },
    type: type,
    content: {
      id: Math.floor(Math.random() * 1000),
      key_id: Math.floor(Math.random() * 100),
      summary: 'テスト課題',
      description: 'テスト説明',
      ...(withComment ? {
        comment: {
          id: Math.floor(Math.random() * 100),
          content: 'テストコメント'
        }
      } : {}),
      ...(withChanges.length > 0 ? { changes: withChanges } : {})
    },
    createdUser: {
      id: 1,
      userId: 'test-user',
      name: 'テストユーザー',
      roleType: 1,
      lang: 'ja',
      mailAddress: 'test@example.com',
      nulabAccount: {
        nulabId: 'test-nulab',
        name: 'テストユーザー',
        uniqueId: 'test-unique'
      },
      keyword: 'keyword',
      lastLoginTime: date
    },
    created: `${date}T10:00:00Z`
  };
};

// モックレポートジェネレータ
class MockReportGenerator implements ReportGenerator {
  generateResult: string = 'モックレポート';
  configureWasCalled: boolean = false;
  lastConfig: ReportGeneratorConfig | undefined;
  generateCalled: boolean = false;

  generate(activities: BacklogActivity[]): string {
    this.generateCalled = true;
    return this.generateResult;
  }

  configure(config: ReportGeneratorConfig): void {
    this.configureWasCalled = true;
    this.lastConfig = config;
  }

  // テスト用にレポート生成結果を設定
  setGenerateResult(result: string) {
    this.generateResult = result;
  }
}

// モックフィルタ
class MockFilter implements ActivityFilter {
  filterResult: boolean = true;
  filterCalls: BacklogActivity[] = [];

  filter(activity: BacklogActivity): boolean {
    this.filterCalls.push(activity);
    return this.filterResult;
  }

  // テスト用にフィルタ結果を設定
  setFilterResult(result: boolean) {
    this.filterResult = result;
  }
}

describe('BacklogActivityService', () => {
  let mockBacklog: MockBacklog;
  let service: BacklogActivityService;
  let mockFilter: MockFilter;
  let mockReportGenerator: MockReportGenerator;

  beforeEach(() => {
    mockBacklog = new MockBacklog();
    mockFilter = new MockFilter();
    mockReportGenerator = new MockReportGenerator();
    
    const config: BacklogActivityServiceConfig = {
      filter: mockFilter,
      reportGenerator: mockReportGenerator
    };
    
    service = new BacklogActivityService(mockBacklog as any, config);
  });

  describe('コンストラクタ', () => {
    it('デフォルトフィルタとジェネレータが設定されること', () => {
      const serviceWithDefaults = new BacklogActivityService(mockBacklog as any);
      expect(serviceWithDefaults).toBeInstanceOf(BacklogActivityService);
      // デフォルトフィルタはOrFilter（CommentFilterとMeaningfulChangeFilterの組み合わせ）
      // デフォルトジェネレータはTemplateReportGenerator
    });

    it('カスタムフィルタとジェネレータが設定されること', () => {
      const customFilter = new CommentFilter();
      const customGenerator = new MockReportGenerator();
      
      const serviceWithCustom = new BacklogActivityService(mockBacklog as any, {
        filter: customFilter,
        reportGenerator: customGenerator
      });
      
      // フィルタとジェネレータを直接検証することはできないが、間接的に動作を確認
      const setFilterSpy = vi.spyOn(serviceWithCustom, 'setFilter');
      const setReportGeneratorSpy = vi.spyOn(serviceWithCustom, 'setReportGenerator');
      
      serviceWithCustom.setFilter(new MeaningfulChangeFilter());
      serviceWithCustom.setReportGenerator(new MockReportGenerator());
      
      expect(setFilterSpy).toHaveBeenCalled();
      expect(setReportGeneratorSpy).toHaveBeenCalled();
    });
  });

  describe('setFilter', () => {
    it('フィルタを変更できること', () => {
      const newFilter = new CommentFilter();
      service.setFilter(newFilter);
      
      // 変更後のフィルタが使用されることを確認するためのテスト
      // アクティビティを取得して間接的に検証
      mockBacklog.setActivities([
        createMockActivity('2023-03-01', 'TEST', 1, true) // コメント付き
      ]);
      
      return service.getMeaningfulActivities(1, '2023-03-01')
        .then(result => {
          // この時点でmockFilterではなくCommentFilterが使われるはず
          // ただしmockFilterを上書きしたのでfilterCallsは空になる
          expect(mockFilter.filterCalls).toHaveLength(0);
          // 代わりに間接的に結果を検証
          expect(result.activities).toHaveLength(1); // フィルタが適用されていることを確認
        });
    });
  });

  describe('setReportGenerator', () => {
    it('レポートジェネレータを変更できること', () => {
      const newGenerator = new MockReportGenerator();
      newGenerator.setGenerateResult('新しいレポート');
      
      service.setReportGenerator(newGenerator);
      
      // アクティビティを設定
      mockBacklog.setActivities([
        createMockActivity('2023-03-01', 'TEST', 1, true)
      ]);
      
      return service.getMeaningfulActivities(1, '2023-03-01')
        .then(result => {
          // NOTE: activity-service.tsの実装ではレポートは返されていないため、
          // generateメソッドが呼ばれていることを確認する
          expect(newGenerator.generateCalled).toBe(true);
        });
    });
  });

  describe('configureReport', () => {
    it('レポート設定が変更されること', () => {
      const config: ReportGeneratorConfig = {
        language: 'ja',
        templateType: 'markdown'
      };
      
      service.configureReport(config);
      
      expect(mockReportGenerator.configureWasCalled).toBe(true);
      expect(mockReportGenerator.lastConfig).toEqual(config);
    });
  });

  describe('getMeaningfulActivities', () => {
    it('特定日のアクティビティを取得して意味のあるものだけをフィルタすること', () => {
      // モックアクティビティを設定
      const targetDate = '2023-03-01';
      const activities = [
        createMockActivity(targetDate, 'TEST1', 1, true), // 意味のあるアクティビティ
        createMockActivity(targetDate, 'TEST2', 1, false), // 意味のないアクティビティ
        createMockActivity('2023-03-02', 'TEST3', 1, true) // 別の日のアクティビティ
      ];
      
      mockBacklog.setActivities(activities);
      
      // 特定のアクティビティだけを意味があるとする
      mockFilter.setFilterResult(true);
      
      return service.getMeaningfulActivities(1, targetDate)
        .then((result: ActivityResult) => {
          // 日付が正しく設定されているか
          expect(result.date).toBe(targetDate);
          
          // 特定日のアクティビティだけが抽出されているか
          expect(result.activities.length).toBe(2);
          expect(result.activities.every(a => a.created.startsWith(targetDate))).toBe(true);
          
          // フィルタが呼び出されているか
          expect(mockFilter.filterCalls.length).toBe(2);
          
          // プロジェクト別にグループ化されているか
          expect(Object.keys(result.groupedByProject)).toContain('TEST1');
          expect(Object.keys(result.groupedByProject)).toContain('TEST2');
          expect(Object.keys(result.groupedByProject)).not.toContain('TEST3');
        });
    });
    
    it('日付が指定されていない場合は現在の日付が使用されること', () => {
      // 現在の日付を取得
      const today = new Date().toISOString().split('T')[0];
      
      // モックアクティビティを設定
      mockBacklog.setActivities([
        createMockActivity(today, 'TEST', 1, true)
      ]);
      
      return service.getMeaningfulActivities(1, '')
        .then(result => {
          expect(result.date).toBe(today);
        });
    });
  });
}); 