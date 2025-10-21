import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Fail fast on server start if env is missing
  console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE_KEY || "");
const prisma = new PrismaClient();

export const POST = async (req: Request) => {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ message: "Expected multipart/form-data" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    // optional postId can be sent along with the upload to associate image with a post
    const postIdRaw = formData.get("postId") as string | null;
    const postId = postIdRaw ? parseInt(postIdRaw, 10) : undefined;
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Get file extension and create UUID-based filename
    const originalExt = (file as File).name.split('.').pop()?.toLowerCase() || '';
    const uuid = crypto.randomUUID();
    const filename = `${uuid}${originalExt ? `.${originalExt}` : ''}`;

    const bucket = "images";

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, fileBuffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ message: "Upload failed", error }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);

    // If a postId was provided, update the corresponding post.imageUrl in the database
    if (postId) {
      try {
        // Ensure the request is authenticated and the user owns the post
        const userId = await getCurrentUserId();
        if (!userId) {
          return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
        }

        await prisma.$connect();

        const existing = await prisma.post.findFirst({ where: { id: postId, authorId: userId } });
        if (!existing) {
          await prisma.$disconnect();
          return NextResponse.json({ message: "投稿が見つからないか権限がありません" }, { status: 404 });
        }

        const updated = await prisma.post.update({ where: { id: postId }, data: { imageUrl: publicUrl } });
        await prisma.$disconnect();

        return NextResponse.json({ message: "Success", publicUrl, post: updated }, { status: 201 });
      } catch (dbErr) {
        console.error("DB update error:", dbErr);
        try {
          await prisma.$disconnect();
        } catch {
          // ignore
        }
        return NextResponse.json({ message: "Upload succeeded but DB update failed", publicUrl, error: dbErr }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Success", publicUrl }, { status: 201 });
  } catch (err) {
    console.error("Upload POST error:", err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({ message: "Use POST to upload a file" }, { status: 200 });
};
