import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { main } from "../route";
import { getCurrentUserId } from "@/lib/auth";
import { postInputSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export const GET = async (req: Request) => {
  console.log("GET");

  try {
    const id: number = parseInt(req.url.split("/blog/")[1]);

    await main(); // DB接続を確実に行う

    // 投稿者情報も含めて取得
    const post = await prisma.post.findFirst({
      where: { id },
      include: {
        author: true, // 投稿者の情報も含める
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Success", post }, { status: 200 });
  } catch (err) {
    console.error("GET [id] エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

export const PUT = async (req: Request) => {
  try {
    // 認証されたユーザーIDを取得
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const id: number = parseInt(req.url.split("/blog/")[1]);
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

    const { title, description, imageUrl } = parsed.data as any;

    await main(); // DB接続を確実に行う

    // 投稿の所有者かチェック
    const existingPost = await prisma.post.findFirst({
      where: { id, authorId: userId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { message: "投稿が見つからないか、権限がありません" },
        { status: 404 }
      );
    }

    const post = await prisma.post.update({
      data: {
        title,
        description,
        ...(imageUrl ? { imageUrl } : {}),
      },
      where: { id },
      include: {
        author: true, // 投稿者の情報も含める
      },
    });

    return NextResponse.json({ message: "Success", post }, { status: 200 });
  } catch (err) {
    console.error("PUT エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

export const DELETE = async (req: Request) => {
  try {
    // 認証されたユーザーIDを取得
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const id: number = parseInt(req.url.split("/blog/")[1]);

    await main(); // DB接続を確実に行う

    // 投稿の所有者かチェック
    const existingPost = await prisma.post.findFirst({
      where: { id, authorId: userId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { message: "投稿が見つからないか、権限がありません" },
        { status: 404 }
      );
    }

    const post = await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Success", post }, { status: 200 });
  } catch (err) {
    console.error("DELETE エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
