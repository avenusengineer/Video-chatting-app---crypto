/*
  Warnings:

  - A unique constraint covering the columns `[authorId,userId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Report_authorId_userId_key` ON `Report`(`authorId`, `userId`);
