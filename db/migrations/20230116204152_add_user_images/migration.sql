-- CreateTable
CREATE TABLE `UserImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `UserImage_userId_idx`(`userId`),
    INDEX `UserImage_url_idx`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `UserImage` (`url`, `hash`, `order`, `userId`) SELECT `imageUrl`, `imageHash`, 0, `id` FROM `User`;

-- CreateIndex
CREATE INDEX `Call_authorId_idx` ON `Call`(`authorId`);

-- CreateIndex
CREATE INDEX `Call_participantId_idx` ON `Call`(`participantId`);

-- CreateIndex
CREATE INDEX `Favorite_authorId_idx` ON `Favorite`(`authorId`);

-- CreateIndex
CREATE INDEX `Favorite_userId_idx` ON `Favorite`(`userId`);

-- CreateIndex
CREATE INDEX `Report_userId_idx` ON `Report`(`userId`);

-- CreateIndex
CREATE INDEX `Session_userId_idx` ON `Session`(`userId`);

-- CreateIndex
CREATE INDEX `Token_userId_idx` ON `Token`(`userId`);

-- CreateIndex
CREATE INDEX `Transaction_userId_idx` ON `Transaction`(`userId`);

-- CreateIndex
CREATE INDEX `UserLink_userId_idx` ON `UserLink`(`userId`);
