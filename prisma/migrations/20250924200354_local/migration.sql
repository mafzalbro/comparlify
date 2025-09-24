-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('NEW_USER_REGISTERED', 'COMMENT_APPROVED', 'NEW_COMMENT_AWAITING_APPROVAL') NOT NULL;

-- CreateIndex
CREATE INDEX `Notification_userId_idx` ON `Notification`(`userId`);
