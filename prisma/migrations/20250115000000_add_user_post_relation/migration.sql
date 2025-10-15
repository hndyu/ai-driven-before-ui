-- Add authorId column to Post table with default value
ALTER TABLE "Post" ADD COLUMN "authorId" TEXT;

-- Create a default user for existing posts
INSERT INTO "User" ("id", "email", "firstName", "lastName", "imageUrl", "createdAt", "updatedAt")
VALUES ('default-user', 'default@example.com', 'デフォルト', 'ユーザー', NULL, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Update existing posts to reference the default user
UPDATE "Post" SET "authorId" = 'default-user' WHERE "authorId" IS NULL;

-- Make authorId NOT NULL after setting default values
ALTER TABLE "Post" ALTER COLUMN "authorId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE;
