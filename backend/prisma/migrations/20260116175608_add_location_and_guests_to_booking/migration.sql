-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "guests" TEXT[],
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'cal-video';
