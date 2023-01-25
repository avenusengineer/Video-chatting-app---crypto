-- AlterTable
ALTER TABLE `User` ADD COLUMN `kycVerifiedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `VeriffData` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('APPROVED', 'RESUBMISSION_REQUESTED', 'DECLINED', 'REVIEW', 'EXPIRED', 'ABANDONED') NULL,
    `submittedAt` DATETIME(3) NULL,
    `decisionTime` DATETIME(3) NULL,
    `acceptanceTime` DATETIME(3) NULL,
    `person` JSON NULL,
    `session` JSON NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VeriffData_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
