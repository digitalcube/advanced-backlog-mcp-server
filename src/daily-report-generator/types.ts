/**
 * Backlogアクティビティの変更内容
 */
export interface BacklogChange {
    field: string;
    field_text?: string;
    new_value: string | null;
    old_value: string | null;
    type: string;
  }
  
  /**
   * Backlogコメント
   */
  export interface BacklogComment {
    id: number;
    content: string;
  }
  
  /**
   * Backlogコンテンツ
   */
  export interface BacklogContent {
    id: number;
    key_id: number;
    summary: string;
    description: string | null;
    comment?: BacklogComment;
    changes?: BacklogChange[];
    attachments?: any[];
    shared_files?: any[];
    external_file_links?: any[];
  }
  
  /**
   * Backlogプロジェクト
   */
  export interface BacklogProject {
    id: number;
    projectKey: string;
    name: string;
    chartEnabled?: boolean;
    useResolvedForChart?: boolean;
    subtaskingEnabled?: boolean;
    projectLeaderCanEditProjectLeader?: boolean;
    useWiki?: boolean;
    useDocument?: boolean;
    useFileSharing?: boolean;
    useWikiTreeView?: boolean;
    useOriginalImageSizeAtWiki?: boolean;
    textFormattingRule?: string;
    archived?: boolean;
    displayOrder?: number;
    useDevAttributes?: boolean;
  }
  
  /**
   * Backlogユーザー
   */
  export interface BacklogUser {
    id: number;
    userId: string;
    name: string;
    roleType: number;
    lang: string;
    mailAddress: string;
    nulabAccount: {
      nulabId: string;
      name: string;
      uniqueId: string;
      iconUrl?: string;
    };
    keyword: string;
    lastLoginTime: string;
  }
  
  /**
   * Backlogアクティビティ
   */
  export interface BacklogActivity {
    id: number;
    project: BacklogProject;
    type: number;
    content: BacklogContent;
    notifications?: any[];
    createdUser: BacklogUser;
    created: string;
  }
  
  /**
   * プロジェクト別アクティビティのマップ型
   */
  export type ProjectActivitiesMap = Record<string, BacklogActivity[]>;
  
  /**
   * アクティビティ取得結果
   */
  export interface ActivityResult {
    date: string;
    activities: BacklogActivity[];
    groupedByProject: ProjectActivitiesMap;
    report: string;
  } 