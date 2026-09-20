-- CreateEnum for EmailType
CREATE TYPE "EmailType" AS ENUM ('APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_1H', 'MEDICATION_REMINDER', 'WEEKLY_MOOD_REPORT', 'THERAPY_TIP', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'WELCOME', 'PAYMENT_RECEIPT', 'CRISIS_SUPPORT');

-- CreateEnum for EmailLogStatus
CREATE TYPE "EmailLogStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'BOUNCED', 'COMPLAINED');

-- CreateTable EmailPreference
CREATE TABLE "EmailPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appointmentReminder1HourBefore" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminder24HoursBefore" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminderEmail" BOOLEAN NOT NULL DEFAULT true,
    "medicationRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "medicationReminderTime" TEXT NOT NULL DEFAULT '09:00',
    "weeklyMoodReport" BOOLEAN NOT NULL DEFAULT true,
    "therapyTips" BOOLEAN NOT NULL DEFAULT true,
    "communityNotifications" BOOLEAN NOT NULL DEFAULT false,
    "promotionsAndOffers" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmailLog
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "messageId" TEXT,
    "provider" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailPreference_userId_key" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailPreference_userId_idx" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- AddForeignKey
ALTER TABLE "EmailPreference" ADD CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
