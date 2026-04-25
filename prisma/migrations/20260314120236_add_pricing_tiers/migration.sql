-- AlterTable
ALTER TABLE `comparison` ADD COLUMN `lastVerifiedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `fact` ADD COLUMN `lastVerifiedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `platform` ADD COLUMN `affiliateLink` VARCHAR(191) NULL,
    ADD COLUMN `cons` JSON NULL,
    ADD COLUMN `dealDescription` VARCHAR(191) NULL,
    ADD COLUMN `flatMonthlyFee` DOUBLE NULL,
    ADD COLUMN `lastVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `pros` JSON NULL,
    ADD COLUMN `transactionFeePercent` DOUBLE NULL,
    ADD COLUMN `videoHostingIncluded` BOOLEAN NULL;

-- CreateTable
CREATE TABLE `PricingTier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `monthlyPrice` DOUBLE NOT NULL,
    `annualPriceMonthlyEquivalent` DOUBLE NULL,
    `transactionFeePercent` DOUBLE NULL,
    `isPopular` BOOLEAN NOT NULL DEFAULT false,
    `features` JSON NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PricingTier_platformId_idx`(`platformId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AffiliateClick` (
    `id` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `referrer` TEXT NOT NULL,
    `userAgent` TEXT NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AffiliateClick_platformId_idx`(`platformId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlatformToPost` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PlatformToPost_AB_unique`(`A`, `B`),
    INDEX `_PlatformToPost_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NewsArticleToPlatform` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_NewsArticleToPlatform_AB_unique`(`A`, `B`),
    INDEX `_NewsArticleToPlatform_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ForumTopicToPlatform` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ForumTopicToPlatform_AB_unique`(`A`, `B`),
    INDEX `_ForumTopicToPlatform_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
