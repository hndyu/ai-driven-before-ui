import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';
import type { WebhookEvent } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Webhookの検証とユーザーデータの処理
export async function POST(req: NextRequest) {
    try {
        // Webhookの署名を検証するためのヘッダーを取得
        const svix_id = req.headers.get('svix-id');
        const svix_timestamp = req.headers.get('svix-timestamp');
        const svix_signature = req.headers.get('svix-signature');

        // 必要なヘッダーが存在しない場合はエラー
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Missing svix headers');
            return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
        }

        // リクエストボディを取得
        const body = await req.text();

        // Webhookの署名を検証
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
        let evt: WebhookEvent;

        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            }) as WebhookEvent;
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // イベントタイプを取得
        const eventType = evt.type;
        console.log(`Received webhook event: ${eventType}`);

        // ユーザー作成イベントを処理
        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            try {
                // データベースにユーザーを追加
                const user = await prisma.user.create({
                    data: {
                        id: id,
                        email: email_addresses[0]?.email_address || '',
                        firstName: first_name || null,
                        lastName: last_name || null,
                        imageUrl: image_url || null,
                    },
                });

                console.log('User created in database:', user);
                return NextResponse.json({ message: 'User created successfully', user }, { status: 200 });
            } catch (dbError) {
                console.error('Database error:', dbError);
                return NextResponse.json({ error: 'Failed to create user in database' }, { status: 500 });
            }
        }

        // ユーザー更新イベントを処理
        if (eventType === 'user.updated') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            try {
                // データベースのユーザー情報を更新
                const user = await prisma.user.update({
                    where: { id: id },
                    data: {
                        email: email_addresses[0]?.email_address || '',
                        firstName: first_name || null,
                        lastName: last_name || null,
                        imageUrl: image_url || null,
                        updatedAt: new Date(),
                    },
                });

                console.log('User updated in database:', user);
                return NextResponse.json({ message: 'User updated successfully', user }, { status: 200 });
            } catch (dbError) {
                console.error('Database error:', dbError);
                return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 });
            }
        }

        // ユーザー削除イベントを処理
        if (eventType === 'user.deleted') {
            const { id } = evt.data;

            if (!id) {
                return NextResponse.json({ error: 'User ID not found in webhook data' }, { status: 400 });
            }

            try {
                // データベースからユーザーを削除
                await prisma.user.delete({
                    where: { id: id },
                });

                console.log('User deleted from database:', id);
                return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
            } catch (dbError) {
                console.error('Database error:', dbError);
                return NextResponse.json({ error: 'Failed to delete user from database' }, { status: 500 });
            }
        }

        // 処理対象外のイベントタイプ
        console.log(`Unhandled event type: ${eventType}`);
        return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
