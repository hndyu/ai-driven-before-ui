import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET = async () => {
    try {
        await prisma.$connect();

        // 全投稿を取得（認証不要）
        const posts = await prisma.post.findMany({
            orderBy: { date: 'asc' },
            include: { author: true }
        });

        return NextResponse.json({ message: 'Success', posts }, { status: 200 });
    } catch (err) {
        console.error('GET /api/blog/public エラー:', err);
        return NextResponse.json({ message: 'Error', err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};
