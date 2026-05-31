/*
  Warnings:

  - A unique constraint covering the columns `[productId,date]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Stock` MODIFY `date` DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Stock_productId_date_key` ON `Stock`(`productId`, `date`);
