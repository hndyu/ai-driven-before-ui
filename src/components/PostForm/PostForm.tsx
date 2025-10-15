'use client';

import React, { useState, useEffect } from 'react';
import { Post, CreatePostData, UpdatePostData } from '@/types/blog';
import { createPost, updatePost } from '@/lib/api';
import { Input, Button } from '@/components/UI';

interface PostFormProps {
    post?: Post;
    onSuccess: (post: Post) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function PostForm({ post, onSuccess, onCancel, isSubmitting = false }: PostFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                description: post.description,
            });
        }
    }, [post]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = 'タイトルは必須です';
        } else if (formData.title.length > 100) {
            newErrors.title = 'タイトルは100文字以内で入力してください';
        }

        if (!formData.description.trim()) {
            newErrors.description = '内容は必須です';
        } else if (formData.description.length > 5000) {
            newErrors.description = '内容は5000文字以内で入力してください';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            let result: Post;

            if (post) {
                // 更新
                const updateData: UpdatePostData = {
                    id: post.id,
                    title: formData.title,
                    description: formData.description,
                };
                result = await updatePost(updateData);
            } else {
                // 新規作成
                const createData: CreatePostData = {
                    title: formData.title,
                    description: formData.description,
                };
                result = await createPost(createData);
            }

            onSuccess(result);
        } catch (error) {
            console.error('Error saving post:', error);
            alert(post ? '投稿の更新に失敗しました' : '投稿の作成に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // エラーをクリア
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <Input
                label="タイトル"
                type="text"
                value={formData.title}
                onChange={(value) => handleInputChange('title', value)}
                placeholder="投稿のタイトルを入力してください"
                required
                className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
            )}

            {/* 内容 */}
            <Input
                label="内容"
                type="textarea"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="投稿の内容を入力してください"
                required
                rows={8}
                className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
            )}

            {/* 文字数カウンター */}
            <div className="text-sm text-gray-500 text-right">
                <span className={formData.title.length > 100 ? 'text-red-500' : ''}>
                    タイトル: {formData.title.length}/100
                </span>
                <span className="ml-4">
                    内容: {formData.description.length}/5000
                </span>
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading || isSubmitting}
                >
                    キャンセル
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || isSubmitting}
                >
                    {loading ? '保存中...' : (post ? '更新' : '作成')}
                </Button>
            </div>
        </form>
    );
}
