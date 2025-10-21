import { z } from "zod";

// クライアントとサーバーで共有する投稿入力スキーマ
export const postInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: "タイトルは必須です" })
    .max(100, { message: "タイトルは100文字以内で入力してください" }),
  description: z
    .string()
    .min(1, { message: "内容は必須です" })
    .max(5000, { message: "内容は5000文字以内で入力してください" }),
  // 任意の画像URLを許容
  imageUrl: z.string().url().optional(),
});

export type PostInput = z.infer<typeof postInputSchema>;
