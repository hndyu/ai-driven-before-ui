# Clerk Webhook設定ガイド

## 必要な環境変数

以下の環境変数を `.env.local` ファイルに設定してください：

```env
# Clerk設定
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# データベース設定（Supabase PostgreSQL）
DATABASE_URL="postgresql://username:password@host:port/database"

# その他の環境変数
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Clerk Webhookの設定手順

1. **Clerk Dashboardにアクセス**
   - [Clerk Dashboard](https://dashboard.clerk.com/) にログイン

2. **Webhookエンドポイントの作成**
   - 左サイドバーの「Webhooks」をクリック
   - 「Add Endpoint」をクリック
   - エンドポイントURL: `https://yourdomain.com/api/webhooks/clerk`
   - イベントを選択:
     - `user.created`
     - `user.updated`
     - `user.deleted`

3. **Webhook Secretの取得**
   - 作成したWebhookの詳細ページで「Signing Secret」をコピー
   - この値を `CLERK_WEBHOOK_SECRET` 環境変数に設定

## データベースマイグレーション

Prismaスキーマを更新した後、以下のコマンドを実行してください：

```bash
# マイグレーションファイルを生成
npx prisma migrate dev --name add_user_model

# Prismaクライアントを再生成
npx prisma generate
```

## 動作確認

1. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

2. **Webhookのテスト**
   - Clerk DashboardのWebhook詳細ページで「Send test event」をクリック
   - コンソールログでWebhookの受信を確認

3. **ユーザー登録のテスト**
   - アプリケーションでユーザー登録を実行
   - データベースにユーザーデータが追加されることを確認

## トラブルシューティング

### よくある問題

1. **Webhook署名検証エラー**
   - `CLERK_WEBHOOK_SECRET` が正しく設定されているか確認
   - Webhook URLが正確か確認

2. **データベース接続エラー**
   - `DATABASE_URL` が正しく設定されているか確認
   - Supabaseの接続設定を確認

3. **Prismaクライアントエラー**
   - `npx prisma generate` を実行してクライアントを再生成
   - マイグレーションが完了しているか確認

## セキュリティ考慮事項

- Webhookエンドポイントは署名検証により保護されています
- 本番環境ではHTTPSを使用してください
- 環境変数は適切に管理し、機密情報を漏洩させないでください
