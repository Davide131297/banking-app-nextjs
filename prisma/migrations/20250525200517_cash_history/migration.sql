-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `receiver_balance_after` DOUBLE NULL,
    ADD COLUMN `sender_balance_after` DOUBLE NULL;
