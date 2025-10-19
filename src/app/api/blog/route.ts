import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/auth";
import { postInputSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function main() {
  try {
    await prisma.$connect();
    console.log("データベース接続成功");
  } catch (err) {
    console.error("DB接続エラー:", err);
    throw new Error("DB接続に失敗しました");
  }
}

export const GET = async () => {
  try {
    await main(); // DB接続を確実に行う
    // 認証されたユーザーの投稿のみ取得する
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { date: "asc" },
      include: {
        author: true, // 投稿者の情報も含める
      },
    });

    return NextResponse.json({ message: "Success", posts }, { status: 200 });
  } catch (err) {
    console.error("GET エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

export const POST = async (req: Request) => {
  console.log("POST");

  try {
    // 認証されたユーザーIDを取得
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();

    // Zod によるバリデーション
    const parsed = postInputSchema.safeParse(body);
    if (!parsed.success) {
      const formatted = parsed.error.format();
      return NextResponse.json(
        { message: "入力エラー", errors: formatted },
        { status: 400 }
      );
    }

    const { title, description } = parsed.data;
    await main(); // DB接続を確実に行う

    // 投稿者IDを含めて投稿を作成
    const post = await prisma.post.create({
      data: {
        title,
        description,
        authorId: userId, // 認証されたユーザーIDを設定
      },
      include: {
        author: true, // 投稿者の情報も含める
      },
    });
    return NextResponse.json({ message: "Success", post }, { status: 201 });
  } catch (err) {
    console.error("POST エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
