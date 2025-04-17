import { describe, it, expect } from 'vitest';
import type { 
  BacklogActivity, 
  BacklogChange, 
  BacklogComment, 
  BacklogContent,
  BacklogProject,
  BacklogUser,
  ProjectActivitiesMap,
  ActivityResult
} from '../types.js';

describe('型定義', () => {
  it('BacklogChange型の構造が正しいこと', () => {
    const change: BacklogChange = {
      field: 'status',
      field_text: 'ステータス',
      new_value: '処理中',
      old_value: '未対応',
      type: 'standard'
    };
    
    expect(change.field).toBe('status');
    expect(change.field_text).toBe('ステータス');
    expect(change.new_value).toBe('処理中');
    expect(change.old_value).toBe('未対応');
    expect(change.type).toBe('standard');
  });
  
  it('BacklogComment型の構造が正しいこと', () => {
    const comment: BacklogComment = {
      id: 12345,
      content: 'テストコメント'
    };
    
    expect(comment.id).toBe(12345);
    expect(comment.content).toBe('テストコメント');
  });
  
  it('BacklogContent型の構造が正しいこと', () => {
    const content: BacklogContent = {
      id: 12345,
      key_id: 1,
      summary: 'テスト課題',
      description: '課題の説明',
      comment: {
        id: 1,
        content: 'コメント内容'
      },
      changes: [
        {
          field: 'status',
          new_value: '処理中',
          old_value: '未対応',
          type: 'standard'
        }
      ]
    };
    
    expect(content.id).toBe(12345);
    expect(content.key_id).toBe(1);
    expect(content.summary).toBe('テスト課題');
    expect(content.description).toBe('課題の説明');
    expect(content.comment?.content).toBe('コメント内容');
    expect(content.changes?.[0].field).toBe('status');
  });
  
  it('ProjectActivitiesMap型が正しく機能すること', () => {
    const mockUser: BacklogUser = {
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
    };
    
    const mockProject: BacklogProject = {
      id: 1,
      projectKey: 'TEST',
      name: 'テストプロジェクト'
    };
    
    const mockActivity: BacklogActivity = {
      id: 1,
      project: mockProject,
      type: 1,
      content: {
        id: 1,
        key_id: 1,
        summary: 'テスト課題',
        description: null
      },
      createdUser: mockUser,
      created: '2023-03-01T10:00:00Z'
    };
    
    const projectActivitiesMap: ProjectActivitiesMap = {
      'TEST': [mockActivity]
    };
    
    expect(projectActivitiesMap['TEST']).toBeInstanceOf(Array);
    expect(projectActivitiesMap['TEST'][0].id).toBe(1);
    expect(projectActivitiesMap['TEST'][0].project.projectKey).toBe('TEST');
  });
  
  it('ActivityResult型の構造が正しいこと', () => {
    const mockUser: BacklogUser = {
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
    };
    
    const mockProject: BacklogProject = {
      id: 1,
      projectKey: 'TEST',
      name: 'テストプロジェクト'
    };
    
    const mockActivity: BacklogActivity = {
      id: 1,
      project: mockProject,
      type: 1,
      content: {
        id: 1,
        key_id: 1,
        summary: 'テスト課題',
        description: null
      },
      createdUser: mockUser,
      created: '2023-03-01T10:00:00Z'
    };
    
    const result: ActivityResult = {
      date: '2023-03-01',
      activities: [mockActivity],
      groupedByProject: {
        'TEST': [mockActivity]
      },
      report: '日報内容'
    };
    
    expect(result.date).toBe('2023-03-01');
    expect(result.activities).toHaveLength(1);
    expect(result.groupedByProject['TEST']).toHaveLength(1);
    expect(result.report).toBe('日報内容');
  });
}); 