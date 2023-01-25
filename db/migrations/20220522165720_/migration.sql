/*
  Warnings:

  - A unique constraint covering the columns `[sid]` on the table `Call` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sid` to the `Call` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Call` ADD COLUMN `sid` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Call_sid_key` ON `Call`(`sid`);
