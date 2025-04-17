// Backlogのアクティビティ関連の型定義をインポート
import type { BacklogActivity, BacklogChange } from "./types.js";

// 除外対象のフィールド名の定数
// 期限日関連のフィールド名（Backlogの実装によって異なる可能性があるため複数指定）
export const MILESTONE_FIELDS = ['milestone', 'limitDate', 'dueDate', 'period', 'date', '期限日'];
// 担当者関連のフィールド名
export const ASSIGNEE_FIELDS = ['assigner', 'assignee', '担当者', '担当'];

/**
 * アクティビティフィルタのインターフェース
 * 全てのフィルタはこのインターフェースを実装する
 */
export interface ActivityFilter {
  /**
   * アクティビティをフィルタリングする
   * @param activity バックログアクティビティ
   * @returns true: 条件に一致する, false: 条件に一致しない
   */
  filter(activity: BacklogActivity): boolean;
}

/**
 * コメントが存在するアクティビティをフィルタリングするクラス
 */
export class CommentFilter implements ActivityFilter {
  /**
   * コメントが存在し、内容が空でないアクティビティのみを通過させる
   */
  filter(activity: BacklogActivity): boolean {
    return !!(activity.content.comment && activity.content.comment.content.trim());
  }
}

/**
 * 意味のある変更（期限日や担当者のみの変更ではない）アクティビティをフィルタリングするクラス
 */
export class MeaningfulChangeFilter implements ActivityFilter {
  /**
   * @param milestoneFields 期限日関連のフィールド名
   * @param assigneeFields 担当者関連のフィールド名
   */
  constructor(
    private milestoneFields: string[] = MILESTONE_FIELDS,
    private assigneeFields: string[] = ASSIGNEE_FIELDS
  ) {}

  /**
   * 意味のある変更があるアクティビティのみを通過させる
   */
  filter(activity: BacklogActivity): boolean {
    if (!activity.content.changes || activity.content.changes.length === 0) {
      return false;
    }

    // 無意味な変更（期限日・担当者のみ）かチェック
    return !this.isNonMeaningfulChange(activity.content.changes);
  }

  /**
   * 無意味な変更（期限日や担当者のみの変更）かどうかをチェックする
   * @private
   */
  private isNonMeaningfulChange(changes: BacklogChange[]): boolean {
    // 変更がない場合はfalse
    if (!changes || changes.length === 0) {
      return false;
    }
    
    // 変更が1つのみの場合
    if (changes.length === 1) {
      const field = changes[0].field;
      const fieldText = changes[0].field_text || '';
      
      // 期限日または担当者の変更のみの場合はtrue
      return this.isFieldInList(field, fieldText, this.milestoneFields) || 
             this.isFieldInList(field, fieldText, this.assigneeFields);
    }
    
    // 複数の変更がある場合は、全て無意味な変更かチェック
    // 全ての変更が期限日だけ、または担当者だけの場合はtrue
    const onlyMilestoneChanges = changes.every((change: BacklogChange) => {
      return this.isFieldInList(change.field, change.field_text || '', this.milestoneFields);
    });
    
    const onlyAssigneeChanges = changes.every((change: BacklogChange) => {
      return this.isFieldInList(change.field, change.field_text || '', this.assigneeFields);
    });
    
    // いずれかが完全に当てはまる場合は無意味な変更とみなす
    return onlyMilestoneChanges || onlyAssigneeChanges;
  }

  /**
   * フィールド名がリスト内に含まれるかチェックする
   * @private
   */
  private isFieldInList(field: string, fieldText: string, fieldList: string[]): boolean {
    return fieldList.includes(field) || fieldList.includes(fieldText);
  }
}

/**
 * OR条件のフィルタ
 * 複数のフィルタのいずれかを満たすアクティビティを通過させる
 */
export class OrFilter implements ActivityFilter {
  /**
   * @param filters フィルタのリスト
   */
  constructor(private filters: ActivityFilter[]) {}

  /**
   * いずれかのフィルタに一致する場合にtrueを返す
   */
  filter(activity: BacklogActivity): boolean {
    return this.filters.some(filter => filter.filter(activity));
  }
}

/**
 * AND条件のフィルタ
 * 全てのフィルタを満たすアクティビティのみを通過させる
 */
export class AndFilter implements ActivityFilter {
  /**
   * @param filters フィルタのリスト
   */
  constructor(private filters: ActivityFilter[]) {}

  /**
   * 全てのフィルタに一致する場合にtrueを返す
   */
  filter(activity: BacklogActivity): boolean {
    return this.filters.every(filter => filter.filter(activity));
  }
}

/**
 * NOT条件のフィルタ
 * 指定したフィルタの結果を反転させる
 */
export class NotFilter implements ActivityFilter {
  /**
   * @param filter 対象のフィルタ
   */
  constructor(private filterToNegate: ActivityFilter) {}

  /**
   * フィルタの結果を反転させる
   */
  filter(activity: BacklogActivity): boolean {
    return !this.filterToNegate.filter(activity);
  }
} 