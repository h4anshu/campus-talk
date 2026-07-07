/*
  Warnings:

  - You are about to drop the column `actorId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `body` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POST_LIKED', 'COMMENT_LIKED', 'POST_COMMENTED', 'COMMENT_REPLIED', 'ANSWER_ACCEPTED', 'POST_APPROVED', 'POST_REJECTED', 'TICKET_REPLY', 'REPORT_VERIFIED', 'COLLAB_SLOT_FILLED', 'LOST_FOUND_RETURNED');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_postId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "actorId",
DROP COLUMN "isRead",
DROP COLUMN "postId",
ADD COLUMN     "actorImage" TEXT,
ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "linkUrl" TEXT,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;
