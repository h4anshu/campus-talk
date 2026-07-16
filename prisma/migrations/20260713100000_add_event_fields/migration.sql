-- AddColumn eventDate, eventLocation, eventVenue to Post
ALTER TABLE "Post" ADD COLUMN "eventDate" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN "eventLocation" TEXT;
ALTER TABLE "Post" ADD COLUMN "eventVenue" TEXT;
