-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_roomId_fkey";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
