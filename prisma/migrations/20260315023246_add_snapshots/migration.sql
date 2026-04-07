-- AlterTable
ALTER TABLE `project` ADD COLUMN `adSnapshots` JSON NULL,
    ADD COLUMN `churnSnapshots` JSON NULL;
