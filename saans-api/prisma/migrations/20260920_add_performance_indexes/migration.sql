-- Performance Optimization Indexes
-- These indexes improve query performance for frequently accessed data patterns

-- =============== USER INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");
CREATE INDEX IF NOT EXISTS "idx_user_created" ON "User"("createdAt");

-- =============== MOOD ENTRY INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_mood_user_date" ON "MoodEntry"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_mood_score" ON "MoodEntry"("moodScore");
CREATE INDEX IF NOT EXISTS "idx_mood_category" ON "MoodEntry"("moodCategory");

-- =============== THERAPY BOOKING INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_booking_user" ON "TherapyBooking"("userId");
CREATE INDEX IF NOT EXISTS "idx_booking_therapist" ON "TherapyBooking"("therapistId");
CREATE INDEX IF NOT EXISTS "idx_booking_scheduled" ON "TherapyBooking"("scheduledAt");
CREATE INDEX IF NOT EXISTS "idx_booking_status" ON "TherapyBooking"("status");
CREATE INDEX IF NOT EXISTS "idx_booking_user_status" ON "TherapyBooking"("userId", "status");

-- =============== PAYMENT INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_payment_user" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "idx_payment_status" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "idx_payment_created" ON "Payment"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_payment_user_status" ON "Payment"("userId", "status");

-- =============== CRISIS INCIDENT INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_crisis_user_level" ON "CrisisIncident"("userId", "level");
CREATE INDEX IF NOT EXISTS "idx_crisis_status" ON "CrisisIncident"("status");
CREATE INDEX IF NOT EXISTS "idx_crisis_detected" ON "CrisisIncident"("detectedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_crisis_user_status" ON "CrisisIncident"("userId", "status");

-- =============== CHAT MESSAGE INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_chat_session" ON "ChatMessage"("conversationId");
CREATE INDEX IF NOT EXISTS "idx_chat_sender" ON "ChatMessage"("sender");
CREATE INDEX IF NOT EXISTS "idx_chat_created" ON "ChatMessage"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_chat_session_time" ON "ChatMessage"("conversationId", "createdAt" DESC);

-- =============== NOTIFICATION INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_notification_user" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_read" ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS "idx_notification_type" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "Notification"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "idx_notification_created" ON "Notification"("createdAt" DESC);

-- =============== EMAIL LOG INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_email_user" ON "EmailLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_email_type" ON "EmailLog"("type");
CREATE INDEX IF NOT EXISTS "idx_email_status" ON "EmailLog"("status");
CREATE INDEX IF NOT EXISTS "idx_email_created" ON "EmailLog"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_email_user_status" ON "EmailLog"("userId", "status");

-- =============== SESSION RECORD INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_session_therapist" ON "SessionRecord"("therapistId");
CREATE INDEX IF NOT EXISTS "idx_session_created" ON "SessionRecord"("createdAt" DESC);

-- =============== AVAILABILITY SLOT INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_availability_therapist" ON "AvailabilitySlot"("therapistId");
CREATE INDEX IF NOT EXISTS "idx_availability_therapist_day" ON "AvailabilitySlot"("therapistId", "dayOfWeek");

-- =============== COMMUNITY INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_community_post_group" ON "CommunityPost"("groupId");
CREATE INDEX IF NOT EXISTS "idx_community_post_user" ON "CommunityPost"("userId");
CREATE INDEX IF NOT EXISTS "idx_community_post_created" ON "CommunityPost"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_community_member_group" ON "CommunityGroupMember"("groupId");
CREATE INDEX IF NOT EXISTS "idx_community_member_user" ON "CommunityGroupMember"("userId");
CREATE INDEX IF NOT EXISTS "idx_community_comment_post" ON "CommunityComment"("postId");
CREATE INDEX IF NOT EXISTS "idx_community_comment_user" ON "CommunityComment"("userId");

-- =============== AUDIT LOG INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_audit_user" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "AuditLog"("entity");
CREATE INDEX IF NOT EXISTS "idx_audit_created" ON "AuditLog"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_status" ON "AuditLog"("status");
CREATE INDEX IF NOT EXISTS "idx_audit_user_action" ON "AuditLog"("userId", "action");

-- =============== TWO FACTOR INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_2fa_user" ON "TwoFactorSession"("userId");
CREATE INDEX IF NOT EXISTS "idx_2fa_token" ON "TwoFactorSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "idx_2fa_expires" ON "TwoFactorSession"("expiresAt");

-- =============== SUBSCRIPTION INDEXES ===============
CREATE INDEX IF NOT EXISTS "idx_subscription_type" ON "Subscription"("type");
CREATE INDEX IF NOT EXISTS "idx_subscription_end" ON "Subscription"("endDate");

-- =============== PERFORMANCE COMMENT ===============
-- These indexes are optimized for the following query patterns:
-- - User lookups by email and role
-- - Mood history with date filtering
-- - Therapy booking filters by status, date, user/therapist
-- - Payment history and filtering
-- - Crisis incident tracking and assignment
-- - Chat message retrieval and pagination
-- - Notification feed with read status
-- - Email log tracking and analytics
--
-- Index maintenance:
-- - Monitor index bloat with: SELECT * FROM pg_stat_user_indexes
-- - Reindex if needed: REINDEX INDEX idx_name;
-- - Vacuum regularly: VACUUM ANALYZE;
