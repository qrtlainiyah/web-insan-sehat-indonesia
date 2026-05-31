/*
  Warnings:

  - You are about to drop the column `amount` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `barangGerobak` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `barangKeluar` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `laba` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `netIncome` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `sewaArmada` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `sewaBarang` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `sewaMobil` on the `ledger` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ledger` table. All the data in the column will be lost.
  - Made the column `bonus` on table `ledger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bop` on table `ledger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `session` on table `ledger` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ledger` DROP FOREIGN KEY `Ledger_userId_fkey`;

-- AlterTable
ALTER TABLE `ledger` DROP COLUMN `amount`,
    DROP COLUMN `barangGerobak`,
    DROP COLUMN `barangKeluar`,
    DROP COLUMN `laba`,
    DROP COLUMN `netIncome`,
    DROP COLUMN `percentage`,
    DROP COLUMN `sewaArmada`,
    DROP COLUMN `sewaBarang`,
    DROP COLUMN `sewaMobil`,
    DROP COLUMN `userId`,
    ADD COLUMN `alami` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `annora` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `audiens` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `dp` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `komisiPenjadwal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `komisiPresenter` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `moringa30` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `moringa60` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `penghasilan` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `performa` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `presenterId` INTEGER NULL,
    ADD COLUMN `revenue` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `schedulerId` INTEGER NULL,
    ADD COLUMN `skl` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalBop` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `bonus` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `bop` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `session` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `Ledger_schedulerId_idx` ON `Ledger`(`schedulerId`);

-- CreateIndex
CREATE INDEX `Ledger_presenterId_idx` ON `Ledger`(`presenterId`);

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_schedulerId_fkey` FOREIGN KEY (`schedulerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_presenterId_fkey` FOREIGN KEY (`presenterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
