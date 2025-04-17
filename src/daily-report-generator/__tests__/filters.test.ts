import { describe, it, expect } from 'vitest';
import {
  MILESTONE_FIELDS,
  ASSIGNEE_FIELDS,
  CommentFilter,
  MeaningfulChangeFilter,
  OrFilter,
  AndFilter,
  NotFilter
} from '../filters.js';
import type { BacklogActivity } from '../types.js';

// モックデータの作成ヘルパー関数
function createMockActivity(options: {
  hasComment?: boolean;
  commentContent?: string;
  changes?: Array<{
    field: string;
    field_text?: string;
    new_value: string | null;
    old_value: string | null;
    type: string;
  }>;
}): BacklogActivity {
  const {
    hasComment = false,
    commentContent = '',
    changes = []
  } = options;

  return {
    id: 1,
    project: {
      id: 1,
      projectKey: 'TEST',
      name: 'テストプロジェクト'
    },
    type: 1,
    content: {
      id: 1,
      key_id: 1,
      summary: 'テスト課題',
      description: null,
      ...(hasComment ? {
        comment: {
          id: 1,
          content: commentContent
        }
      } : {}),
      ...(changes.length > 0 ? { changes } : {})
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
      lastLoginTime: '2023-03-01T10:00:00Z'
    },
    created: '2023-03-01T10:00:00Z'
  } as BacklogActivity;
}

describe('フィルター', () => {
  describe('コンスタント', () => {
    it('MILESTONE_FIELDSには期限日関連のフィールド名が含まれていること', () => {
      expect(MILESTONE_FIELDS).toContain('milestone');
      expect(MILESTONE_FIELDS).toContain('limitDate');
      expect(MILESTONE_FIELDS).toContain('dueDate');
      expect(MILESTONE_FIELDS).toContain('期限日');
    });

    it('ASSIGNEE_FIELDSには担当者関連のフィールド名が含まれていること', () => {
      expect(ASSIGNEE_FIELDS).toContain('assignee');
      expect(ASSIGNEE_FIELDS).toContain('担当者');
    });
  });

  describe('CommentFilter', () => {
    const filter = new CommentFilter();

    it('コメントが存在し内容がある場合はtrueを返すこと', () => {
      const activity = createMockActivity({
        hasComment: true,
        commentContent: 'テストコメント'
      });
      expect(filter.filter(activity)).toBe(true);
    });

    it('コメントが存在しない場合はfalseを返すこと', () => {
      const activity = createMockActivity({
        hasComment: false
      });
      expect(filter.filter(activity)).toBe(false);
    });

    it('コメントが存在するが内容が空の場合はfalseを返すこと', () => {
      const activity = createMockActivity({
        hasComment: true,
        commentContent: '   ' // 空白文字のみ
      });
      expect(filter.filter(activity)).toBe(false);
    });
  });

  describe('MeaningfulChangeFilter', () => {
    const filter = new MeaningfulChangeFilter();

    it('変更が存在しない場合はfalseを返すこと', () => {
      const activity = createMockActivity({});
      expect(filter.filter(activity)).toBe(false);
    });

    it('期限日の変更のみの場合はfalseを返すこと', () => {
      const activity = createMockActivity({
        changes: [
          {
            field: 'limitDate',
            new_value: '2023-03-10',
            old_value: '2023-03-01',
            type: 'standard'
          }
        ]
      });
      expect(filter.filter(activity)).toBe(false);
    });

    it('担当者の変更のみの場合はfalseを返すこと', () => {
      const activity = createMockActivity({
        changes: [
          {
            field: 'assignee',
            new_value: 'user2',
            old_value: 'user1',
            type: 'standard'
          }
        ]
      });
      expect(filter.filter(activity)).toBe(false);
    });

    it('期限日と担当者以外の変更がある場合はtrueを返すこと', () => {
      const activity = createMockActivity({
        changes: [
          {
            field: 'status',
            new_value: '処理中',
            old_value: '未対応',
            type: 'standard'
          }
        ]
      });
      expect(filter.filter(activity)).toBe(true);
    });

    it('複数の変更があり、すべてが期限日関連の場合はfalseを返すこと', () => {
      const activity = createMockActivity({
        changes: [
          {
            field: 'limitDate',
            new_value: '2023-03-10',
            old_value: '2023-03-01',
            type: 'standard'
          },
          {
            field: 'milestone',
            new_value: 'Sprint 2',
            old_value: 'Sprint 1',
            type: 'standard'
          }
        ]
      });
      expect(filter.filter(activity)).toBe(false);
    });

    it('複数の変更があり、期限日と他の変更がある場合はtrueを返すこと', () => {
      const activity = createMockActivity({
        changes: [
          {
            field: 'limitDate',
            new_value: '2023-03-10',
            old_value: '2023-03-01',
            type: 'standard'
          },
          {
            field: 'status',
            new_value: '処理中',
            old_value: '未対応',
            type: 'standard'
          }
        ]
      });
      expect(filter.filter(activity)).toBe(true);
    });
  });

  describe('OrFilter', () => {
    it('いずれかのフィルタがtrueを返す場合はtrueを返すこと', () => {
      const commentFilter = new CommentFilter();
      const meaningfulChangeFilter = new MeaningfulChangeFilter();
      const orFilter = new OrFilter([commentFilter, meaningfulChangeFilter]);

      // コメントはあるが、意味のある変更はない
      const activity1 = createMockActivity({
        hasComment: true,
        commentContent: 'テストコメント',
        changes: [
          {
            field: 'limitDate',
            new_value: '2023-03-10',
            old_value: '2023-03-01',
            type: 'standard'
          }
        ]
      });
      expect(orFilter.filter(activity1)).toBe(true);

      // コメントはないが、意味のある変更がある
      const activity2 = createMockActivity({
        changes: [
          {
            field: 'status',
            new_value: '処理中',
            old_value: '未対応',
            type: 'standard'
          }
        ]
      });
      expect(orFilter.filter(activity2)).toBe(true);
    });

    it('すべてのフィルタがfalseを返す場合はfalseを返すこと', () => {
      const commentFilter = new CommentFilter();
      const meaningfulChangeFilter = new MeaningfulChangeFilter();
      const orFilter = new OrFilter([commentFilter, meaningfulChangeFilter]);

      // コメントもなく、意味のある変更もない
      const activity = createMockActivity({
        changes: [
          {
            field: 'limitDate',
            new_value: '2023-03-10',
            old_value: '2023-03-01',
            type: 'standard'
          }
        ]
      });
      expect(orFilter.filter(activity)).toBe(false);
    });
  });

  describe('AndFilter', () => {
    it('すべてのフィルタがtrueを返す場合はtrueを返すこと', () => {
      const commentFilter = new CommentFilter();
      const meaningfulChangeFilter = new MeaningfulChangeFilter();
      const andFilter = new AndFilter([commentFilter, meaningfulChangeFilter]);

      // コメントがあり、意味のある変更もある
      const activity = createMockActivity({
        hasComment: true,
        commentContent: 'テストコメント',
        changes: [
          {
            field: 'status',
            new_value: '処理中',
            old_value: '未対応',
            type: 'standard'
          }
        ]
      });
      expect(andFilter.filter(activity)).toBe(true);
    });

    it('いずれかのフィルタがfalseを返す場合はfalseを返すこと', () => {
      const commentFilter = new CommentFilter();
      const meaningfulChangeFilter = new MeaningfulChangeFilter();
      const andFilter = new AndFilter([commentFilter, meaningfulChangeFilter]);

      // コメントはあるが、意味のある変更はない
      const activity = createMockActivity({
        hasComment: true,
        commentContent: 'テストコメント',
        changes: [
          {
            field: 'limitDate',
            new_value: '2023-03-10',
            old_value: '2023-03-01',
            type: 'standard'
          }
        ]
      });
      expect(andFilter.filter(activity)).toBe(false);
    });
  });

  describe('NotFilter', () => {
    it('元のフィルタの結果を反転させること', () => {
      const commentFilter = new CommentFilter();
      const notFilter = new NotFilter(commentFilter);

      // コメントがある場合は元のフィルタはtrueだが、NotFilterはfalseを返す
      const activity1 = createMockActivity({
        hasComment: true,
        commentContent: 'テストコメント'
      });
      expect(commentFilter.filter(activity1)).toBe(true);
      expect(notFilter.filter(activity1)).toBe(false);

      // コメントがない場合は元のフィルタはfalseだが、NotFilterはtrueを返す
      const activity2 = createMockActivity({
        hasComment: false
      });
      expect(commentFilter.filter(activity2)).toBe(false);
      expect(notFilter.filter(activity2)).toBe(true);
    });
  });
}); 