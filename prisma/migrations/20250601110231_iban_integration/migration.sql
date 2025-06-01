/*
  Warnings:

  - Added the required column `iban` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `iban` VARCHAR(255) NOT NULL;
