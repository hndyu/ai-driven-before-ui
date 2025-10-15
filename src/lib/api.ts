import { Post, ApiResponse, CreatePostData, UpdatePostData, PostsResponse, PostResponse } from '@/types/blog';

const API_BASE_URL = '/api/blog';

// 全投稿を取得
export async function fetchPosts(): Promise<Post[]> {
    try {
        const response = await fetch(API_BASE_URL);
        const data: PostsResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '投稿の取得に失敗しました');
        }

        return data.posts || [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

// 特定の投稿を取得
export async function fetchPost(id: number): Promise<Post> {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const data: PostResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '投稿の取得に失敗しました');
        }

        return data.post;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
}

// 新しい投稿を作成
export async function createPost(postData: CreatePostData): Promise<Post> {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        const data: PostResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '投稿の作成に失敗しました');
        }

        return data.post;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// 投稿を更新
export async function updatePost(postData: UpdatePostData): Promise<Post> {
    try {
        const response = await fetch(`${API_BASE_URL}/${postData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: postData.title,
                description: postData.description,
            }),
        });

        const data: PostResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '投稿の更新に失敗しました');
        }

        return data.post;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

// 投稿を削除
export async function deletePost(id: number): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        const data: ApiResponse<Post> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '投稿の削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}
