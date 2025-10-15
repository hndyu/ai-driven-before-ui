const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateWithDefaultUser() {
    try {
        console.log('データベースマイグレーションを開始します...');

        // 既存のPostデータを取得
        const existingPosts = await prisma.post.findMany();
        console.log(`既存の投稿数: ${existingPosts.length}`);

        if (existingPosts.length > 0) {
            // デフォルトユーザーを作成（既存の投稿用）
            const defaultUser = await prisma.user.upsert({
                where: { id: 'default-user' },
                update: {},
                create: {
                    id: 'default-user',
                    email: 'default@example.com',
                    firstName: 'デフォルト',
                    lastName: 'ユーザー',
                },
            });

            console.log('デフォルトユーザーを作成しました:', defaultUser);

            // 既存のPostにauthorIdを設定
            for (const post of existingPosts) {
                await prisma.post.update({
                    where: { id: post.id },
                    data: { authorId: defaultUser.id },
                });
                console.log(`投稿 ${post.id} にデフォルトユーザーを設定しました`);
            }
        }

        console.log('マイグレーションが完了しました');
    } catch (error) {
        console.error('マイグレーションエラー:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateWithDefaultUser()
    .then(() => {
        console.log('マイグレーションが正常に完了しました');
        process.exit(0);
    })
    .catch((error) => {
        console.error('マイグレーションが失敗しました:', error);
        process.exit(1);
    });
