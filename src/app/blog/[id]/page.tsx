import React from "react";
import PostDetail from "@/components/PostDetail/PostDetail";

interface PageProps {
  params: { id: string };
}

export default async function PostPage({ params }: PageProps) {
  const id = parseInt(params.id, 10);

  if (Number.isNaN(id)) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <p className="text-center text-red-600">無効な投稿 ID です</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      {/* Client コンポーネントで投稿をフェッチして表示 */}
      <PostDetail postId={id} />
    </main>
  );
}
