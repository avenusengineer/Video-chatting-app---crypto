/*
  Warnings:

  - You are about to drop the `VeriffData` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `kycReferenceKey` VARCHAR(191) NULL,
    ADD COLUMN `kycSubmittedAt` DATETIME(3) NULL;

-- DropTable
DROP TABLE `VeriffData`;
