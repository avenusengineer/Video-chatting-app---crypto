/*
  Warnings:

  - You are about to drop the `_ReceivedCalls` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `participantId` to the `Call` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Call` ADD COLUMN `participantId` VARCHAR(191);

UPDATE `Call` SET `participantId` = (SELECT `B` FROM `_ReceivedCalls` WHERE `Call`.`id` = `_ReceivedCalls`.`A`);

ALTER TABLE `Call` MODIFY `participantId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_ReceivedCalls`;
