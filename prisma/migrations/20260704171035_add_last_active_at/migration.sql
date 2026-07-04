-- DropIndex
DROP INDEX "Post_searchVector_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveAt" TIMESTAMP(3);
