import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk", // webhookエンドポイントを認証対象から除外
  "/public-articles(.*)", // 未ログインでも閲覧できる公開記事ページ
  "/blog(.*)", // ブログ個別ページは公開にする（続きを読むからログインを要求しない）
  "/api/blog(.*)", // /api/blog の全エンドポイントを未認証でアクセス可能にする（個別投稿の取得等）
  "/api/blog/public(.*)", // 公開 API を認証対象から除外
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
