/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Account_userId_idx` ON `Account`;

-- DropIndex
DROP INDEX `Comment_authorId_idx` ON `Comment`;

-- DropIndex
DROP INDEX `Comment_postId_idx` ON `Comment`;

-- DropIndex
DROP INDEX `Comparison_platformAId_idx` ON `Comparison`;

-- DropIndex
DROP INDEX `Comparison_platformBId_idx` ON `Comparison`;

-- DropIndex
DROP INDEX `FAQ_comparisonId_idx` ON `FAQ`;

-- DropIndex
DROP INDEX `Fact_comparisonId_idx` ON `Fact`;

-- DropIndex
DROP INDEX `Feature_categoryId_idx` ON `Feature`;

-- DropIndex
DROP INDEX `Post_authorId_idx` ON `Post`;

-- DropIndex
DROP INDEX `Session_userId_idx` ON `Session`;

-- DropIndex
DROP INDEX `Subscription_userId_idx` ON `Subscription`;

-- DropIndex
DROP INDEX `VerificationToken_token_key` ON `VerificationToken`;

-- AlterTable
ALTER TABLE `Comment` MODIFY `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `FAQ` MODIFY `answer` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Post` MODIFY `description` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Subscription` DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `Bookmark` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `contentType` ENUM('POST', 'COMPARISON') NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Bookmark_userId_contentType_contentId_key`(`userId`, `contentType`, `contentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('NEW_USER', 'COMMENT_APPROVED') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feature` ADD CONSTRAINT `Feature_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `FeatureCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlatformFeature` ADD CONSTRAINT `PlatformFeature_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlatformFeature` ADD CONSTRAINT `PlatformFeature_featureId_fkey` FOREIGN KEY (`featureId`) REFERENCES `Feature`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comparison` ADD CONSTRAINT `Comparison_platformAId_fkey` FOREIGN KEY (`platformAId`) REFERENCES `Platform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comparison` ADD CONSTRAINT `Comparison_platformBId_fkey` FOREIGN KEY (`platformBId`) REFERENCES `Platform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fact` ADD CONSTRAINT `Fact_comparisonId_fkey` FOREIGN KEY (`comparisonId`) REFERENCES `Comparison`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FAQ` ADD CONSTRAINT `FAQ_comparisonId_fkey` FOREIGN KEY (`comparisonId`) REFERENCES `Comparison`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_previousId_fkey` FOREIGN KEY (`previousId`) REFERENCES `Post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_post_fkey` FOREIGN KEY (`contentId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_comparison_fkey` FOREIGN KEY (`contentId`) REFERENCES `Comparison`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
