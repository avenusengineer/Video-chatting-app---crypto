/*
  Warnings:

  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `bio`,
    DROP COLUMN `gender`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;
