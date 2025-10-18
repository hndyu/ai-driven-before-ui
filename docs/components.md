# Components reference — PostForm / PostList / PostDetail

このファイルは `src/components` の主要コンポーネント（投稿関連）の props とデータフローを簡潔にまとめたものです。

## 概要

親コンポーネント: `src/app/page.tsx`（Home）が状態（selectedPostId, editingPost, モーダルの開閉）を保持し、以下の子コンポーネントに props とコールバックを渡します。

Home
├─> PostList
├─> PostDetail
└─> PostForm (モーダル)

---

## PostList

- ファイル: `src/components/PostList/PostList.tsx`
- Props:
  - `onEditPost?: (post: Post) => void`
  - `onDeletePost?: (postId: number) => void`
  - `onCreatePost?: () => void`
  - `onPostClick?: (postId: number) => void`
- 内部:
  - `fetchPosts()` を使って投稿一覧を取得し内部 state に保持
  - 編集: `onEditPost(post)` をコール
  - 削除: `onDeletePost(postId)` を呼び成功後に `loadPosts()` で再読み込み
  - クリック: `onPostClick(post.id)` を呼ぶ
- 注意:
  - API は `post.author` を含める（`include: { author: true }`）

---

## PostDetail

- ファイル: `src/components/PostDetail/PostDetail.tsx`
- Props:
  - `postId: number`
  - `onEditPost?: (post: Post) => void`
  - `onDeletePost?: (postId: number) => void`
  - `onBackToList?: () => void`
- 内部:
  - `fetchPost(postId)` で単一投稿を取得
  - 編集: `onEditPost(post)` を呼ぶ
  - 削除: `onDeletePost(postId)` を呼ぶ
  - 戻る: `onBackToList()` を呼ぶ
- 注意:
  - 日付表示はローカルで `toLocaleDateString('ja-JP')` を使っている

---

## PostForm

- ファイル: `src/components/PostForm/PostForm.tsx`
- Props:
  - `post?: Post` (編集時に渡す)
  - `onSuccess: (post: Post) => void` (作成/更新成功時)
  - `onCancel: () => void`
  - `isSubmitting?: boolean`
- 内部:
  - `useUser()`（Clerk）で `user.id` を取得して `authorId` に設定
  - バリデーション（title <= 100, description <= 5000）
  - 新規: `createPost(createData)`、編集: `updatePost(updateData)` を呼ぶ
  - 成功: `onSuccess(result)` を呼び親がモーダルを閉じて一覧更新などを行う
- 注意:
  - クライアント側で `useUser()` を使うが、サーバー側 API は必ず `getCurrentUserId()` で再検証する

---

## 典型的なシーケンス

1. 作成: Home がモーダルを開く → PostForm で `createPost()` → 成功で `onSuccess` → 親が `loadPosts()`
2. 編集: PostList/PostDetail が `onEditPost(post)` を呼ぶ → Home がモーダルと `editingPost` をセット → PostForm が `updatePost()` を呼ぶ
3. 削除: PostList/PostDetail が `onDeletePost(postId)` を呼ぶ（親が `deletePost()` を呼び一覧を更新）

---

## 開発者向けメモ

- 親が状態を管理する（子はコールバックでイベントを伝える）
- フロントでのユーザー確認は UX 的なチェックで、最終的な権限は API 側で検証する
- API ルートの変更（パスやレスポンス形）を行う場合は `src/lib/api.ts` と整合性を必ず保つ

---

（このファイルは自動生成された要約です。補足や形式の要望があれば教えてください。）

---

## Header

- ファイル: `src/components/Header/Header.tsx`
- Props:
  - `onCreatePost?: () => void` — 新規投稿ボタンのコールバック（Home がモーダルを開くために使う）
- 内部:
  - `UserButton`（Clerk）を使ったログイン/アカウント UI
  - 幅広いナビゲーションリンク（/, /about, /contact）を表示
  - モバイルでは折りたたみメニューを表示し、`onCreatePost` をブロック UI として提供する
- 注意:
  - ボタンに渡される `onCreatePost` は親がモーダル制御を行うことを前提としている

---

## Sidebar

- ファイル: `src/components/Sidebar/Sidebar.tsx`
- Props:
  - `className?: string` — レイアウト用の追加クラス
- 内部:
  - `Card` を複数利用してプロフィール、最近の投稿、カテゴリ、アーカイブ、タグクラウドを表示
  - 現在は静的データ（サンプル）を使用しているが、将来的には API から取得する想定
- 注意:
  - サイドバー内の投稿リンクは `/posts/{id}` 形式の href を生成している（ルーティングに合わせて更新が必要）

---

## UI コンポーネント

以下は共通 UI コンポーネントの仕様（`src/components/UI`）です。小さな再利用コンポーネントであり、UI の一貫性を保つために変更は慎重に行ってください。

- Button (`src/components/UI/Button.tsx`)

  - Props: `children`, `onClick?`, `type?`, `variant?: 'primary'|'secondary'|'danger'|'outline'`, `size?: 'sm'|'md'|'lg'`, `disabled?`, `className?`
  - 役割: 色・サイズ・状態をプロップで切り替える単純なラッパー

- Card (`src/components/UI/Card.tsx`)

  - Props: `children`, `className?`, `padding?: 'sm'|'md'|'lg'`, `shadow?: 'sm'|'md'|'lg'`
  - 役割: 白背景のパネル。内部に他コンテンツを包むための汎用コンポーネント。

- Input (`src/components/UI/Input.tsx`)

  - Props: `label?`, `type?: 'text'|'email'|'password'|'textarea'`, `value`, `onChange`, `placeholder?`, `required?`, `disabled?`, `className?`, `rows?`
  - 役割: テキスト入力・テキストエリアを扱う再利用可能コンポーネント。ラベル付きでエラースタイルは props によって付与される。

- Modal (`src/components/UI/Modal.tsx`)
  - Props: `isOpen`, `onClose`, `title`, `children`, `size?: 'sm'|'md'|'lg'|'xl'`
  - 内部: Escape キーで閉じるイベントを処理し、開いている間は body のスクロールを無効にする。背景クリックで `onClose` を呼び出す。
  - 注意: Modal はクライアントコンポーネントであるため、Server Components から直接呼び出す場合はラップが必要になることがある。

---

（追加でドキュメント化したいコンポーネントがあれば教えてください）
