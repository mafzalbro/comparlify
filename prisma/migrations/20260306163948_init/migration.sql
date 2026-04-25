-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('NEW_USER_REGISTERED', 'COMMENT_APPROVED', 'NEW_COMMENT_AWAITING_APPROVAL', 'NEW_FORUM_CONTENT') NOT NULL;

-- CreateTable
CREATE TABLE `Advertisement` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SCRIPT', 'IMAGE') NOT NULL DEFAULT 'IMAGE',
    `content` TEXT NOT NULL,
    `imageUrl` TEXT NULL,
    `linkUrl` TEXT NULL,
    `placement` ENUM('HEADER', 'SIDEBAR', 'POST_TOP', 'POST_BOTTOM', 'COMPARISON_BETWEEN', 'MOBILE_FIXED_BOTTOM') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `allowedPages` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Advertisement_placement_idx`(`placement`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
