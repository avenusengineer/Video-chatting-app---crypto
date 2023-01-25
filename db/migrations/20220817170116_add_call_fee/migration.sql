/*
  Warnings:

  - Made the column `price` on table `Call` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `Call` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Call` ADD COLUMN `fee` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `price` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `duration` DOUBLE NOT NULL DEFAULT 0;
