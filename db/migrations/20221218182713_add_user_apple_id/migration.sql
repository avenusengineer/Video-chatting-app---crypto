/*
  Warnings:

  - A unique constraint covering the columns `[appleUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trolleyReferenceId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `appleUserId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_appleUserId_key` ON `User`(`appleUserId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_trolleyReferenceId_key` ON `User`(`trolleyReferenceId`);
