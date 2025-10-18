"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/blog";
import { fetchPost } from "@/lib/api";
import { Card, Button } from "@/components/UI";

interface PostDetailProps {
  postId: number;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: number) => void;
  onBackToList?: () => void;
}

export default function PostDetail({
  postId,
  onEditPost,
  onDeletePost,
  onBackToList,
}: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPost = await fetchPost(postId);
      setPost(fetchedPost);
    } catch (err) {
      setError("投稿の読み込みに失敗しました");
      console.error("Error loading post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この投稿を削除してもよろしいですか？")) {
      return;
    }

    try {
      if (onDeletePost) {
        await onDeletePost(postId);
      }
    } catch (err) {
      alert("投稿の削除に失敗しました");
      console.error("Error deleting post:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              投稿が見つかりません
            </h3>
            <p className="text-gray-500 mb-4">
              {error || "指定された投稿は存在しません"}
            </p>
            <Button
              onClick={() => {
                if (onBackToList) return onBackToList();
                router.push("/public-articles");
              }}
              variant="outline"
            >
              戻る
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 投稿ヘッダー */}
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <time>{formatDate(post.date)}</time>
              <span>ID: {post.id}</span>
              {post.author && (
                <span className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{post.author.firstName || post.author.email}</span>
                </span>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-2 ml-4">
            {onEditPost && (
              <Button onClick={() => onEditPost(post)} variant="outline">
                編集
              </Button>
            )}
            {onDeletePost && (
              <Button onClick={handleDelete} variant="danger">
                削除
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 投稿内容 */}
      <Card>
        <article className="prose prose-lg prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {post.description}
          </div>
        </article>
      </Card>

      {/* ナビゲーション */}
      <Card>
        <div className="flex justify-between items-center">
          <Button
            onClick={() => {
              if (onBackToList) return onBackToList();
              router.push("/public-articles");
            }}
            variant="outline"
          >
            ← 一覧に戻る
          </Button>

          <div className="flex space-x-4 text-sm text-gray-500">
            <span>投稿日: {formatDate(post.date)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
