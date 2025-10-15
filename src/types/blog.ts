// ブログ投稿の型定義
export interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
}

// API レスポンスの型定義
export interface ApiResponse<T> {
    message: string;
    posts?: T[];
    post?: T;
    err?: any;
}

// 投稿一覧取得用のレスポンス型
export interface PostsResponse {
    message: string;
    posts: Post[];
}

// 単一投稿取得用のレスポンス型
export interface PostResponse {
    message: string;
    post: Post;
}

// ブログ作成・更新用の型定義
export interface CreatePostData {
    title: string;
    description: string;
}

export interface UpdatePostData extends CreatePostData {
    id: number;
}
