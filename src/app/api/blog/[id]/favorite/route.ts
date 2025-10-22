import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// do not import main from parent route; use local prisma client connect/disconnect
import { getCurrentUserId } from "@/lib/auth";

const prisma = new PrismaClient();

export const POST = async (req: Request) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const id: number = parseInt(req.url.split("/blog/")[1]);

    await prisma.$connect();

    // 既に存在する場合は OK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).favorite.findFirst({ where: { userId, postId: id } });
    if (existing) {
      return NextResponse.json({ message: "Already favorited" }, { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fav = await (prisma as any).favorite.create({ data: { userId, postId: id } });

    return NextResponse.json({ message: "Success", favorite: fav }, { status: 201 });
  } catch (err) {
    console.error("POST favorite エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

export const DELETE = async (req: Request) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const id: number = parseInt(req.url.split("/blog/")[1]);

    await prisma.$connect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).favorite.deleteMany({ where: { userId, postId: id } });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    console.error("DELETE favorite エラー:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
