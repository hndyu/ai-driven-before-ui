"use client";

import React, { useEffect, useState } from 'react';
import { Post } from '@/types/blog';
import { Card } from '@/components/UI';
import PostList from '@/components/PostList/PostList';

export default function PublicArticlesPage() {
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
            const res = await fetch('/api/blog/public');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || '投稿の取得に失敗しました');
            }

            setPosts(data.posts || []);
        } catch (err) {
            console.error('Error loading public posts:', err);
            setError('投稿の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">公開記事一覧</h1>
                </div>

                {loading && (
                    <div className="space-y-4">
                        <Card>
                            <div className="animate-pulse p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </Card>
                    </div>
                )}

                {error && (
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-red-600">{error}</p>
                        </div>
                    </Card>
                )}

                {!loading && !error && (
                    // PostList は未ログイン時に空配列を表示するため
                    // ここでは直接レンダリングするカスタムロジックを使う
                    <div className="space-y-6">
                        {posts.length === 0 ? (
                            <Card>
                                <div className="text-center py-12">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">公開されている投稿がありません</h3>
                                    <p className="text-gray-500">まだ投稿がありません。</p>
                                </div>
                            </Card>
                        ) : (
                            posts.map((post) => (
                                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <article>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <time>{new Date(post.date).toLocaleDateString('ja-JP')}</time>
                                                    {post.author && <span>{post.author.firstName || post.author.email}</span>}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <a className="text-blue-600 hover:text-blue-700" href={`/blog/${post.id}`}>続きを読む →</a>
                                            </div>
                                        </div>
                                        <div className="prose prose-gray max-w-none">
                                            <p className="text-gray-700 line-clamp-3">{post.description}</p>
                                        </div>
                                    </article>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
