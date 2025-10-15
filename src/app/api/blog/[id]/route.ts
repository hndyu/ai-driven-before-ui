import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { main } from "../route";


const prisma = new PrismaClient();

export const GET = async (req: Request, res: Response) => {
    console.log("GET");

    try {
        const id: number = parseInt(req.url.split("/blog/")[1]);

        await main(); // DB接続を確実に行う

        const post = await prisma.post.findFirst({ where: { id } });

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

export const PUT = async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.url.split("/blog/")[1]);
        const { title, description } = await req.json();

        await main(); // DB接続を確実に行う

        const post = await prisma.post.update({
            data: { title, description },
            where: { id }
        });

        return NextResponse.json({ message: "Success", post }, { status: 200 });
    } catch (err) {
        console.error("PUT エラー:", err);
        return NextResponse.json({ message: "Error", err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export const DELETE = async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.url.split("/blog/")[1]);

        await main(); // DB接続を確実に行う

        const post = await prisma.post.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Success", post }, { status: 200 });
    } catch (err) {
        console.error("DELETE エラー:", err);
        return NextResponse.json({ message: "Error", err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}