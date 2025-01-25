/*
  Warnings:

  - Added the required column `roomId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
