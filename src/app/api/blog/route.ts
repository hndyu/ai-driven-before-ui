import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

export const GET = async (req: Request, res: Response) => {
    try {
        await main(); // DB接続を確実に行う
        const posts = await prisma.post.findMany({ orderBy: { date: "asc" } });
        return NextResponse.json({ message: "Success", posts }, { status: 200 });
    } catch (err) {
        console.error("GET エラー:", err);
        return NextResponse.json({ message: "Error", err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export const POST = async (req: Request, res: Response) => {
    console.log("POST");

    try {
        const { title, description } = await req.json();
        await main(); // DB接続を確実に行う
        const post = await prisma.post.create({ data: { title, description } });
        return NextResponse.json({ message: "Success", post }, { status: 201 });
    } catch (err) {
        console.error("POST エラー:", err);
        return NextResponse.json({ message: "Error", err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}