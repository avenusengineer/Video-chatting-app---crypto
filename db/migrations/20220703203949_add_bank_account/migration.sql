-- CreateTable
CREATE TABLE `BankAccount` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `accountMask` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `countryCode` VARCHAR(2) NULL,
    `currency` VARCHAR(191) NULL,

    UNIQUE INDEX `BankAccount_accountId_key`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
