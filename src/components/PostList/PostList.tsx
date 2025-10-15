'use client';

import React, { useState, useEffect } from 'react';
import { Post } from '@/types/blog';
import { fetchPosts } from '@/lib/api';
import { Card, Button } from '@/components/UI';

interface PostListProps {
    onEditPost?: (post: Post) => void;
    onDeletePost?: (postId: number) => void;
    onCreatePost?: () => void;
    onPostClick?: (postId: number) => void;
}

export default function PostList({ onEditPost, onDeletePost, onCreatePost, onPostClick }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedPosts = await fetchPosts();
            setPosts(fetchedPosts);
        } catch (err) {
            setError('投稿の読み込みに失敗しました');
            console.error('Error loading posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        if (!confirm('この投稿を削除してもよろしいですか？')) {
            return;
        }

        try {
            if (onDeletePost) {
                await onDeletePost(postId);
            }
            // 投稿リストを再読み込み
            await loadPosts();
        } catch (err) {
            alert('投稿の削除に失敗しました');
            console.error('Error deleting post:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">投稿一覧</h2>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">投稿一覧</h2>
                </div>
                <Card>
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={loadPosts} variant="outline">
                            再読み込み
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">投稿一覧</h2>
                {onCreatePost && (
                    <Button onClick={onCreatePost} variant="primary">
                        新規投稿
                    </Button>
                )}
            </div>

            {/* 投稿リスト */}
            {posts.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">投稿がありません</h3>
                        <p className="text-gray-500 mb-4">最初の投稿を作成してみましょう</p>
                        {onCreatePost && (
                            <Button onClick={onCreatePost} variant="primary">
                                新規投稿を作成
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
                            <article>
                                {/* 投稿ヘッダー */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                            <button
                                                onClick={() => onPostClick?.(post.id)}
                                                className="text-left hover:text-blue-600 transition-colors duration-200 w-full"
                                            >
                                                {post.title}
                                            </button>
                                        </h3>
                                        <time className="text-sm text-gray-500">
                                            {formatDate(post.date)}
                                        </time>
                                    </div>

                                    {/* アクションボタン */}
                                    <div className="flex space-x-2 ml-4">
                                        {onEditPost && (
                                            <Button
                                                onClick={() => onEditPost(post)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                編集
                                            </Button>
                                        )}
                                        {onDeletePost && (
                                            <Button
                                                onClick={() => handleDelete(post.id)}
                                                variant="danger"
                                                size="sm"
                                            >
                                                削除
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* 投稿内容 */}
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-700 line-clamp-3">
                                        {post.description}
                                    </p>
                                </div>

                                {/* フッター */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => onPostClick?.(post.id)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                                        >
                                            続きを読む →
                                        </button>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>ID: {post.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
