-- CreateEnum
CREATE TYPE "SenderRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable: add sender columns as nullable first so existing rows can be backfilled
ALTER TABLE "TicketMessage" ADD COLUMN "senderId" TEXT;
ALTER TABLE "TicketMessage" ADD COLUMN "senderName" TEXT;
ALTER TABLE "TicketMessage" ADD COLUMN "senderRole" "SenderRole";

-- Backfill senderRole straight from the old boolean
UPDATE "TicketMessage" SET "senderRole" = CASE WHEN "fromAdmin" THEN 'ADMIN'::"SenderRole" ELSE 'USER'::"SenderRole" END;

-- Backfill senderId/senderName for student-authored messages from the ticket owner
UPDATE "TicketMessage" tm
SET "senderId" = t."userId", "senderName" = u."name"
FROM "Ticket" t
JOIN "User" u ON u.id = t."userId"
WHERE tm."ticketId" = t.id AND tm."fromAdmin" = false;

-- Backfill senderId/senderName for admin-authored messages using the lazily-created Admin Office system user
UPDATE "TicketMessage" tm
SET "senderId" = u.id, "senderName" = 'Admin'
FROM "User" u
WHERE u.email = 'admin-office@campusvoice.system' AND tm."fromAdmin" = true;

-- Any admin-authored messages left unmapped (Admin Office user never created yet) get a stable placeholder id
UPDATE "TicketMessage" SET "senderId" = 'admin-office', "senderName" = 'Admin' WHERE "fromAdmin" = true AND "senderId" IS NULL;

-- Enforce NOT NULL now that every row is backfilled
ALTER TABLE "TicketMessage" ALTER COLUMN "senderId" SET NOT NULL;
ALTER TABLE "TicketMessage" ALTER COLUMN "senderName" SET NOT NULL;
ALTER TABLE "TicketMessage" ALTER COLUMN "senderRole" SET NOT NULL;

-- Drop the old boolean now that senderRole replaces it
ALTER TABLE "TicketMessage" DROP COLUMN "fromAdmin";
