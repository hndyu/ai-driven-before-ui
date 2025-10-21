"use client";

import React, { useState, useEffect } from "react";
import { Post, CreatePostData, UpdatePostData } from "@/types/blog";
import { createPost, updatePost } from "@/lib/api";
import { Input, Button } from "@/components/UI";
// @ts-expect-error: Clerk types not required in this environment, avoid build break
import { useUser } from "@clerk/nextjs";
import { postInputSchema } from "@/lib/schemas";

interface PostFormProps {
  post?: Post;
  onSuccess: (post: Post) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PostForm({
  post,
  onSuccess,
  onCancel,
  isSubmitting = false,
}: PostFormProps) {
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
      });
      if ((post as any).imageUrl) {
        // no-op: existing cover image URL is managed server-side; we don't prefill file input
      }
    }
  }, [post]);

  const validateForm = () => {
    const result = postInputSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }

    // フィールドごとのエラーメッセージに変換
    const zodErrors: { [key: string]: string } = {};
    const issues = result.error.issues;
    issues.forEach((issue) => {
      const key = (issue.path[0] as string) || "_form";
      // 既にエラーがある場合は最初のメッセージを残す
      if (!zodErrors[key]) zodErrors[key] = issue.message;
    });

    setErrors(zodErrors);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 認証チェック
    if (!isLoaded) {
      alert("認証情報を読み込み中です。しばらくお待ちください。");
      return;
    }

    if (!user) {
      alert("投稿するにはログインが必要です。");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let result: Post;
      let imageUrl: string | undefined = undefined;

      // If a file was selected, upload it first
      // If a file was selected, upload it first
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.publicUrl;
      }

      if (post) {
        // 更新
        const updateData: UpdatePostData = {
          id: post.id,
          title: formData.title,
          description: formData.description,
          authorId: user.id, // 認証されたユーザーIDを設定
          imageUrl,
        };
        result = await updatePost(updateData);
      } else {
        // 新規作成
        const createData: CreatePostData = {
          title: formData.title,
          description: formData.description,
          authorId: user.id, // 認証されたユーザーIDを設定
          imageUrl,
        };
        result = await createPost(createData);
      }

      onSuccess(result);
    } catch (error) {
      console.error("Error saving post:", error);
      alert(post ? "投稿の更新に失敗しました" : "投稿の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タイトル */}
      <Input
        label="タイトル"
        type="text"
        value={formData.title}
        onChange={(value) => handleInputChange("title", value)}
        placeholder="投稿のタイトルを入力してください"
        required
        className={errors.title ? "border-red-500" : ""}
      />
      {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

      {/* 内容 */}
      <Input
        label="内容"
        type="textarea"
        value={formData.description}
        onChange={(value) => handleInputChange("description", value)}
        placeholder="投稿の内容を入力してください"
        required
        rows={8}
        className={errors.description ? "border-red-500" : ""}
      />
      {errors.description && (
        <p className="text-red-500 text-sm">{errors.description}</p>
      )}

      {/* 文字数カウンター */}
      <div className="text-sm text-gray-500 text-right">
        <span className={formData.title.length > 100 ? "text-red-500" : ""}>
          タイトル: {formData.title.length}/100
        </span>
        <span className="ml-4">内容: {formData.description.length}/5000</span>
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
          カバー画像（任意）
        </label>
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            setSelectedFile(f || null);
          }}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2 bg-white"
        />
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
          {loading ? "保存中..." : post ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  );
}
