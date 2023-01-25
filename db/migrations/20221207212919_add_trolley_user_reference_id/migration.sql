-- AlterTable
ALTER TABLE `User` ADD COLUMN `trolleyReferenceId` VARCHAR(191) NULL,
    ADD COLUMN `trolleySubmittedAt` DATETIME(3) NULL;
