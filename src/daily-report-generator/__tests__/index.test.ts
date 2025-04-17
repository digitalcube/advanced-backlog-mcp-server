import { describe, it, expect } from 'vitest';
import * as index from '../index.js';

describe('インデックスエクスポート', () => {
  it('フィルター関連の定数とクラスがエクスポートされていること', () => {
    // 定数
    expect(index.MILESTONE_FIELDS).toBeDefined();
    expect(index.ASSIGNEE_FIELDS).toBeDefined();
    
    // フィルタークラス
    expect(index.CommentFilter).toBeDefined();
    expect(index.MeaningfulChangeFilter).toBeDefined();
    expect(index.OrFilter).toBeDefined();
    expect(index.AndFilter).toBeDefined();
    expect(index.NotFilter).toBeDefined();
  });
  
  it('レポートジェネレーター関連のクラスがエクスポートされていること', () => {
    expect(index.MarkdownReportGenerator).toBeDefined();
    expect(index.TemplateReportGenerator).toBeDefined();
    expect(index.MarkdownTemplate).toBeDefined();
    expect(index.TextTemplate).toBeDefined();
    expect(index.HtmlTemplate).toBeDefined();
    expect(index.DefaultDateFormatter).toBeDefined();
  });
  
  it('サービス関連のクラスがエクスポートされていること', () => {
    expect(index.BacklogActivityService).toBeDefined();
  });
  
  it('各エクスポートされたクラスがインスタンス化できること', () => {
    // フィルター
    expect(new index.CommentFilter()).toBeInstanceOf(index.CommentFilter);
    expect(new index.MeaningfulChangeFilter()).toBeInstanceOf(index.MeaningfulChangeFilter);
    expect(new index.OrFilter([])).toBeInstanceOf(index.OrFilter);
    expect(new index.AndFilter([])).toBeInstanceOf(index.AndFilter);
    expect(new index.NotFilter(new index.CommentFilter())).toBeInstanceOf(index.NotFilter);
    
    // レポートジェネレーター
    expect(new index.MarkdownReportGenerator()).toBeInstanceOf(index.MarkdownReportGenerator);
    expect(new index.TemplateReportGenerator()).toBeInstanceOf(index.TemplateReportGenerator);
    expect(new index.DefaultDateFormatter()).toBeInstanceOf(index.DefaultDateFormatter);
  });
}); 