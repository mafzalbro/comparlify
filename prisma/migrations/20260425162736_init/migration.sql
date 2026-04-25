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

-- CreateTable
CREATE TABLE `AffiliateClick` (
    `id` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `referrer` TEXT NOT NULL,
    `userAgent` TEXT NOT NULL,
    `device` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AffiliateClick_platformId_idx`(`platformId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ForumCategory_name_key`(`name`),
    UNIQUE INDEX `ForumCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumTopic` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `ForumTopic_authorId_idx`(`authorId`),
    INDEX `ForumTopic_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumPost` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `ForumPost_authorId_idx`(`authorId`),
    INDEX `ForumPost_topicId_idx`(`topicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comparison` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `introduction` TEXT NOT NULL,
    `content` LONGTEXT NULL,
    `conclusion` TEXT NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `platformAId` VARCHAR(191) NOT NULL,
    `platformBId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastVerifiedAt` DATETIME(3) NULL,
    `categoryId` VARCHAR(191) NULL,

    UNIQUE INDEX `Comparison_slug_key`(`slug`),
    INDEX `Comparison_platformAId_idx`(`platformAId`),
    INDEX `Comparison_platformBId_idx`(`platformBId`),
    INDEX `Comparison_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fact` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `platformAValue` VARCHAR(191) NOT NULL,
    `platformBValue` VARCHAR(191) NOT NULL,
    `comparisonId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastVerifiedAt` DATETIME(3) NULL,

    INDEX `Fact_comparisonId_idx`(`comparisonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `comparisonId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Faq_comparisonId_idx`(`comparisonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteContent` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'TEXTAREA', 'MARKDOWN') NOT NULL DEFAULT 'TEXT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SiteContent_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PostCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComparisonCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ComparisonCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `dataAiHint` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `previousId` VARCHAR(191) NULL,
    `nextId` VARCHAR(191) NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    UNIQUE INDEX `Post_previousId_key`(`previousId`),
    UNIQUE INDEX `Post_nextId_key`(`nextId`),
    INDEX `Post_authorId_idx`(`authorId`),
    INDEX `Post_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `authorId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,

    INDEX `Comment_authorId_idx`(`authorId`),
    INDEX `Comment_postId_idx`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookmark` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NULL,
    `comparisonId` VARCHAR(191) NULL,

    UNIQUE INDEX `Bookmark_userId_postId_comparisonId_key`(`userId`, `postId`, `comparisonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalDocument` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LegalDocument_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` ENUM('PENDING', 'SENDING', 'SENT') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,
    `excludedUserIds` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `sentAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,

    INDEX `EmailRecipient_campaignId_idx`(`campaignId`),
    INDEX `EmailRecipient_userId_idx`(`userId`),
    UNIQUE INDEX `EmailRecipient_campaignId_userId_key`(`campaignId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Subscription_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Image` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `authorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsArticle` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `dataAiHint` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `NewsArticle_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('NEW_USER_REGISTERED', 'COMMENT_APPROVED', 'NEW_COMMENT_AWAITING_APPROVAL', 'NEW_FORUM_CONTENT') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Platform` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `rating` DOUBLE NULL,
    `easeOfUse` DOUBLE NULL,
    `featuresRating` DOUBLE NULL,
    `support` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastVerifiedAt` DATETIME(3) NULL,
    `pros` JSON NULL,
    `cons` JSON NULL,
    `affiliateLink` VARCHAR(191) NULL,
    `dealDescription` VARCHAR(191) NULL,
    `videoHostingIncluded` BOOLEAN NULL,
    `transactionFeePercent` DOUBLE NULL,
    `flatMonthlyFee` DOUBLE NULL,

    UNIQUE INDEX `Platform_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `FeatureCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FeatureCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feature` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Feature_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlatformFeature` (
    `platformId` VARCHAR(191) NOT NULL,
    `featureId` VARCHAR(191) NOT NULL,
    `hasFeature` BOOLEAN NOT NULL,
    `details` VARCHAR(191) NULL,

    INDEX `PlatformFeature_featureId_idx`(`featureId`),
    PRIMARY KEY (`platformId`, `featureId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roiSnapshots` JSON NULL,
    `churnSnapshots` JSON NULL,
    `adSnapshots` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchProfile` (
    `id` VARCHAR(191) NOT NULL,
    `revenue` DOUBLE NOT NULL,
    `studentCount` INTEGER NOT NULL,
    `technicalSkill` INTEGER NOT NULL,
    `requiredFeatures` JSON NOT NULL,
    `monthlyBudget` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MatchProfile_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserStack` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationUrl` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NULL,

    INDEX `UserStack_userId_idx`(`userId`),
    INDEX `UserStack_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StackPlatform` (
    `id` VARCHAR(191) NOT NULL,
    `stackId` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    INDEX `StackPlatform_stackId_idx`(`stackId`),
    INDEX `StackPlatform_platformId_idx`(`platformId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tool` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `Icon` VARCHAR(191) NOT NULL,
    `category` ENUM('ContentCreation', 'Marketing', 'CurriculumDesign', 'SEO', 'Productivity', 'EngagementInteraction') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `prompt` LONGTEXT NOT NULL,
    `inputTopicLabel` VARCHAR(191) NULL,
    `inputContextLabel` VARCHAR(191) NULL,
    `seoContent` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tool_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('USER', 'AUTHOR', 'EDITOR', 'MODERATOR', 'SUPPORT', 'ADMIN') NOT NULL DEFAULT 'USER',
    `onboarded` BOOLEAN NOT NULL DEFAULT false,
    `newsletter` BOOLEAN NOT NULL DEFAULT false,
    `suspended` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ForumTopicToPlatform` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ForumTopicToPlatform_AB_unique`(`A`, `B`),
    INDEX `_ForumTopicToPlatform_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NewsArticleToPlatform` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_NewsArticleToPlatform_AB_unique`(`A`, `B`),
    INDEX `_NewsArticleToPlatform_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlatformToPost` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PlatformToPost_AB_unique`(`A`, `B`),
    INDEX `_PlatformToPost_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
