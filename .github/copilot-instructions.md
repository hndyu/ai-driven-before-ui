## このリポジトリでの AI エージェント向け短縮ガイド

目的: エージェントが素早く安全に貢献できるよう、このプロジェクト特有の構造、パターン、注意点を短くまとめます。

- プロジェクト概要: Next.js (app router) + Prisma + Clerk を使ったブログアプリ。フロントは `src/app` と `src/components`、サーバー API は `src/app/api/**` に配置。

- 主要ファイル（参照例）:

  - `package.json` — 開発/ビルドコマンド (`dev`, `build` は `prisma generate && next build --turbopack`)。
  - `prisma/schema.prisma` — データモデル (`Post`, `User`)。`User.id` は Clerk のユーザー ID（string）。
  - `src/app/api/blog/route.ts`、`src/app/api/blog/[id]/route.ts` — REST API 実装（`NextResponse` と `PrismaClient` を使用）。
  - `src/app/api/webhooks/clerk/route.ts` — Svix を使った Clerk webhook の受信・検証と DB 更新。
  - `src/lib/auth.ts` — `auth()`（`@clerk/nextjs/server`）をラップした `getCurrentUserId`。サーバー側でこれを使ってユーザー ID を取得する。
  - `src/lib/api.ts` — フロント側が呼ぶ API ラッパー (`/api/blog`) の具体例（`fetchPosts`, `createPost`, `updatePost`, `deletePost`）。

- アーキテクチャとデータフロー（短く）:

  1. フロント（`src/app` の client components）は `src/lib/api.ts` の関数経由で `/api/blog` を呼ぶ。
  2. API ルートは `PrismaClient` を作成し、`main()` で接続、処理後に `$disconnect()` している（各リクエストで接続/切断するパターン）。
  3. 認証は Clerk。サーバー側で `getCurrentUserId()` を呼び、`authorId` に Clerk の `userId` を保存する設計。
  4. 外部イベント（ユーザー作成/更新/削除）は `src/app/api/webhooks/clerk/route.ts` が Svix 署名で検証し DB を更新する。

- コードパターンと注意点（具体例）:

  - API ルート内で `req.url.split('/blog/')[1]` による id 抽出が行われている（既存コードを変更する際は影響範囲を確認）。参照: `src/app/api/blog/[id]/route.ts`。
  - フロントは `API_BASE_URL = '/api/blog'` を直接利用。関数名は `fetchPosts`, `fetchPost`, `createPost`, `updatePost`, `deletePost`。
  - Prisma モデル: `Post.authorId: String` と `Post.author: User` リレーションがある。参照: `prisma/schema.prisma`。
  - 認証チェックは API 内で `getCurrentUserId()` を呼んで行っている（未認証時に 401 を返す）。参照: `src/app/api/blog/route.ts`。

- 開発ワークフロー（必須コマンド）:

  - ローカル開発: `npm run dev`（`next dev --turbopack`）
  - ビルド: `npm run build`（内部で `prisma generate` を実行）
  - linter: `npm run lint`
  - 環境変数: `DATABASE_URL`, `CLERK_WEBHOOK_SECRET` 等が必須（webhook をローカルでテストする場合は Svix 用シークレットを設定）。

- 安全ルール（必ず守る）:

  - テクノロジーのバージョン（`package.json`）を勝手に上げないこと（ルールファイルに明記）。
  - UI/UX（レイアウト・スタイル）の不意な変更は禁止。スタイル変更が必要なら事前に提案して承認を得る。
  - 重大な設計変更（認証フロー、DB スキーマ、API 仕様）は必ず提案 → 承認のフローを踏む。

- レビュー時に有用な簡単なチェックリスト:
  - 変更箇所が `src/app/api/**` の API 仕様に影響する場合、フロント (`src/lib/api.ts`) と互換性を保てるか確認。
  - Prisma のスキーマ変更は `prisma/migrations` の整合性を確認し、`prisma generate` / `migrate` の手順を記載する。
  - Webhook 処理を追加/変更する場合、Svix 署名検証のヘッダー名（`svix-id`, `svix-timestamp`, `svix-signature`）を壊していないか確認。

--

主要コンポーネント参照（拡張）:

以下は `docs/components.md` の要点を要約した、エージェント向けのコンポーネントリファレンスです。Home (`src/app/page.tsx`) が状態のソース（selectedPostId, editingPost, モーダル開閉）となり、子コンポーネントへ props とコールバックを渡す設計です。

- PostList (`src/components/PostList/PostList.tsx`)

  - props: `onEditPost?: (post: Post) => void`, `onDeletePost?: (postId: number) => void`, `onCreatePost?: () => void`, `onPostClick?: (postId: number) => void`
  - 内部: マウント時に `fetchPosts()` を呼び一覧を state に保持。編集/削除は親のコールバックを利用。削除後は `loadPosts()` で再取得。
  - 注意: API は `post.author` を含める（`include: { author: true }`）。レスポンス形を変えるとフロントに影響が出る。

- PostDetail (`src/components/PostDetail/PostDetail.tsx`)

  - props: `postId: number`, `onEditPost?: (post: Post) => void`, `onDeletePost?: (postId: number) => void`, `onBackToList?: () => void`
  - 内部: `fetchPost(postId)` で単一投稿を取得。編集・削除アクションは親へ委譲。
  - 注意: 日付表示は `toLocaleDateString('ja-JP')` を使用。fetch 失敗時はエラーステートを表示する。

- PostForm (`src/components/PostForm/PostForm.tsx`)
  - props: `post?: Post`, `onSuccess: (post: Post) => void`, `onCancel: () => void`, `isSubmitting?: boolean`
  - 内部: Clerk の `useUser()` で `user.id` を取得し `authorId` をセット。バリデーション後に `createPost` または `updatePost` を呼ぶ。成功時に `onSuccess(result)` を呼ぶ。
  - 注意: フロントの `useUser()` は UX 的検証であり、権限チェックはサーバー側 (`getCurrentUserId()`) で行われる。`isSubmitting` と内部 `loading` の重複に注意。

---

その他ページレベル UI コンポーネント:

- Header (`src/components/Header/Header.tsx`)

  - props: `onCreatePost?: () => void` — 新規投稿のコールバック（Home がモーダルを開くために使う）
  - 内部: `UserButton`（Clerk）でアカウント UI を表示。デスクトップ用のナビとモバイル用の折りたたみメニューを持つ。
  - 注意: `onCreatePost` は親がモーダル開閉を制御する前提。

- Sidebar (`src/components/Sidebar/Sidebar.tsx`)
  - props: `className?: string`
  - 内部: `Card` を並べてプロフィール、最近の投稿、カテゴリ、アーカイブ、タグクラウドを表示（現状は静的サンプル）。将来的に API 取得へ差し替え可能。
  - 注意: リンクは `/posts/{id}` 形式を使っているためルーティングが変わる場合は更新が必要。

---

共通 UI コンポーネント (`src/components/UI`):

- Button (`Button.tsx`)

  - Props: `children`, `onClick?`, `type?`, `variant?: 'primary'|'secondary'|'danger'|'outline'`, `size?: 'sm'|'md'|'lg'`, `disabled?`, `className?`
  - 役割: 色・サイズ・状態でスタイルを変える汎用ボタン。

- Card (`Card.tsx`)

  - Props: `children`, `className?`, `padding?: 'sm'|'md'|'lg'`, `shadow?: 'sm'|'md'|'lg'`
  - 役割: パネル。内部コンテンツの容器として使用。

- Input (`Input.tsx`)

  - Props: `label?`, `type?: 'text'|'email'|'password'|'textarea'`, `value`, `onChange`, `placeholder?`, `required?`, `disabled?`, `className?`, `rows?`
  - 役割: 単一のラベル付き入力コンポーネント（textarea を含む）。

- Modal (`Modal.tsx`)
  - Props: `isOpen`, `onClose`, `title`, `children`, `size?: 'sm'|'md'|'lg'|'xl'`
  - 内部: Escape キーで閉じる、背景クリックで `onClose`、開いている間は body スクロールを無効化。
  - 注意: クライアントコンポーネントのため、Server Components から直接使用する場合はラップが必要。

---

典型的なシーケンス（再掲）:

1. 新規作成: Home がモーダルを開く → PostForm が `createPost()` → 成功で `onSuccess` → 親が `loadPosts()` を呼ぶ
2. 編集: PostList/PostDetail が `onEditPost(post)` → Home が編集用モーダルを開き `editingPost` を渡す → PostForm が `updatePost()` を呼ぶ
3. 削除: PostList/PostDetail が `onDeletePost(postId)` → 親が `deletePost()` を呼び一覧を更新

必要であればこのファイルをさらに更新します（例: ローカル webhook テスト手順、Prisma マイグレーション手順、コンポーネント構造図、PlantUML 図の追加）。
