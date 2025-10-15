'use client';

import React from 'react';
import { Card } from '@/components/UI';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
    // サンプルデータ（実際のアプリケーションでは、APIから取得）
    const recentPosts = [
        { id: 1, title: 'Next.js 15の新機能について', date: '2024-01-15' },
        { id: 2, title: 'React 19の変更点', date: '2024-01-10' },
        { id: 3, title: 'TypeScriptのベストプラクティス', date: '2024-01-05' },
    ];

    const categories = [
        { name: '技術', count: 15 },
        { name: 'ライフスタイル', count: 8 },
        { name: '旅行', count: 5 },
        { name: '料理', count: 3 },
    ];

    const archives = [
        { month: '2024年1月', count: 12 },
        { month: '2023年12月', count: 8 },
        { month: '2023年11月', count: 15 },
        { month: '2023年10月', count: 6 },
    ];

    return (
        <aside className={`space-y-6 ${className}`}>
            {/* プロフィール */}
            <Card>
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">B</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">ブログ作者</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        技術とライフスタイルについて書いています。
                    </p>
                    <div className="flex justify-center space-x-4 text-sm text-gray-500">
                        <span>投稿数: 42</span>
                        <span>フォロワー: 1,234</span>
                    </div>
                </div>
            </Card>

            {/* 最近の投稿 */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の投稿</h3>
                <div className="space-y-3">
                    {recentPosts.map((post) => (
                        <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                            <a
                                href={`/posts/${post.id}`}
                                className="text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                            >
                                {post.title}
                            </a>
                            <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* カテゴリ */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ</h3>
                <div className="space-y-2">
                    {categories.map((category, index) => (
                        <a
                            key={index}
                            href={`/category/${category.name}`}
                            className="flex justify-between items-center text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                            <span>{category.name}</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                {category.count}
                            </span>
                        </a>
                    ))}
                </div>
            </Card>

            {/* アーカイブ */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">アーカイブ</h3>
                <div className="space-y-2">
                    {archives.map((archive, index) => (
                        <a
                            key={index}
                            href={`/archive/${archive.month}`}
                            className="flex justify-between items-center text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                            <span>{archive.month}</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                {archive.count}
                            </span>
                        </a>
                    ))}
                </div>
            </Card>

            {/* タグクラウド */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">人気のタグ</h3>
                <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'TypeScript', 'JavaScript', 'Web開発', 'プログラミング'].map((tag, index) => (
                        <a
                            key={index}
                            href={`/tag/${tag}`}
                            className="inline-block bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 px-3 py-1 rounded-full text-sm transition-colors duration-200"
                        >
                            {tag}
                        </a>
                    ))}
                </div>
            </Card>
        </aside>
    );
}
