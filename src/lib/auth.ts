import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

/**
 * リクエストから認証されたユーザーIDを取得する
 * @param req NextRequestオブジェクト
 * @returns ユーザーID（認証されていない場合はnull）
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { userId } = await auth();
        return userId;
    } catch (error) {
        console.error('認証エラー:', error);
        return null;
    }
}

/**
 * 認証されたユーザーが存在するかチェックする
 * @param req NextRequestオブジェクト
 * @returns 認証されているかどうか
 */
export async function isAuthenticated(req?: NextRequest): Promise<boolean> {
    const userId = await getCurrentUserId();
    return userId !== null;
}
