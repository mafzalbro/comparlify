/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `linkedin` VARCHAR(191) NULL,
    ADD COLUMN `twitter` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `TopicVote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,

    INDEX `TopicVote_topicId_idx`(`topicId`),
    UNIQUE INDEX `TopicVote_userId_topicId_key`(`userId`, `topicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostVote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,

    INDEX `PostVote_postId_idx`(`postId`),
    UNIQUE INDEX `PostVote_userId_postId_key`(`userId`, `postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
