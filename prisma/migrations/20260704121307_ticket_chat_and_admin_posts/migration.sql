-- DropForeignKey
ALTER TABLE "TicketMessage" DROP CONSTRAINT "TicketMessage_ticketId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "priority" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "openedByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TicketMessage" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
