/*
  Warnings:

  - You are about to drop the column `imageHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `imageHash`,
    DROP COLUMN `imageUrl`;

-- AlterTable
ALTER TABLE `UserImage` MODIFY `order` INTEGER NOT NULL DEFAULT 0;
