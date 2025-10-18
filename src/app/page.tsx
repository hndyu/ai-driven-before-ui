'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PostList } from '@/components/PostList';
import { PostDetail } from '@/components/PostDetail';
import { PostForm } from '@/components/PostForm';
import { Modal } from '@/components/UI';
import { Post } from '@/types/blog';
import { deletePost } from '@/lib/api';

export default function Home() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      // 削除後、詳細表示の場合は一覧に戻る
      if (currentView === 'detail' && selectedPostId === postId) {
        setCurrentView('list');
        setSelectedPostId(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  const handlePostSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingPost(null);
    // 一覧表示に戻る
    setCurrentView('list');
  };

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPostId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header onCreatePost={handleCreatePost} />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* メインコンテンツエリア */}
          <div className="lg:col-span-3">
            {currentView === 'list' ? (
              <PostList
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onCreatePost={handleCreatePost}
                onPostClick={handlePostClick}
              />
            ) : (
              selectedPostId && (
                <PostDetail
                  postId={selectedPostId}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  onBackToList={handleBackToList}
                />
              )
            )}
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 My Blog. All rights reserved.</p>
            <p className="mt-2 text-sm">Powered by Next.js & Tailwind CSS</p>
          </div>
        </div>
      </footer>

      {/* 新規投稿モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新規投稿"
        size="lg"
      >
        <PostForm
          onSuccess={handlePostSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        title="投稿を編集"
        size="lg"
      >
        {editingPost && (
          <PostForm
            post={editingPost}
            onSuccess={handlePostSuccess}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingPost(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
