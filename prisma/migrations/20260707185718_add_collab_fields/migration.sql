-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "collabContact" TEXT,
ADD COLUMN     "collabDeadline" TIMESTAMP(3),
ADD COLUMN     "collabFilledSlots" INTEGER DEFAULT 0,
ADD COLUMN     "collabIsClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "collabProjectType" TEXT,
ADD COLUMN     "collabSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "collabTotalSlots" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banner" TEXT;
