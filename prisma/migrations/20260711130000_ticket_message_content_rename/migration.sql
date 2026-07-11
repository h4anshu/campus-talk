-- Rename TicketMessage.body -> content to match the fixed message contract
ALTER TABLE "TicketMessage" RENAME COLUMN "body" TO "content";
