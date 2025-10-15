'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/UI';
import Link from 'next/link';

interface HeaderProps {
    onCreatePost?: () => void;
}

export default function Header({ onCreatePost }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* ロゴ・タイトル */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
                                My Blog
                            </Link>
                        </h1>
                    </div>

                    {/* ナビゲーション */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                        >
                            ホーム
                        </Link>
                        <Link
                            href="/about"
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                        >
                            このブログについて
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                        >
                            お問い合わせ
                        </Link>
                    </nav>

                    {/* アクションエリア */}
                    <div className="flex items-center space-x-4">
                        {onCreatePost && (
                            <Button
                                onClick={onCreatePost}
                                variant="primary"
                                size="sm"
                                className="hidden sm:inline-flex"
                            >
                                新規投稿
                            </Button>
                        )}

                        {/* ユーザーボタン */}
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* モバイルメニュー */}
            <div className="md:hidden border-t border-gray-200">
                <div className="px-4 py-2 space-y-1">
                    <Link
                        href="/"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        ホーム
                    </Link>
                    <Link
                        href="/about"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        このブログについて
                    </Link>
                    <Link
                        href="/contact"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        お問い合わせ
                    </Link>
                    {onCreatePost && (
                        <button
                            onClick={onCreatePost}
                            className="block w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 font-medium"
                        >
                            新規投稿
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
