import { pgTable, text, integer, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: integer('email_verified').notNull().default(0),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: integer('verification_token_expiry'),
  resetToken: text('reset_token'),
  resetTokenExpiry: integer('reset_token_expiry'),
  lastLoginAt: text('last_login_at'),
  loginAttempts: integer('login_attempts').notNull().default(0),
  lockUntil: integer('lock_until'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  isPartner: integer('is_partner').default(0),
  referralCode: text('referral_code').unique(),
  referredBy: text('referred_by'),
  bonusBalance: real('bonus_balance').default(0)
});

export const telegramAuthSessions = pgTable('telegram_auth_sessions', {
  sessionId: text('session_id').primaryKey(),
  status: text('status').notNull().default('pending'),
  tgId: text('tg_id'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  username: text('username'),
  photoUrl: text('photo_url'),
  authDate: integer('auth_date'),
  userId: text('user_id'),
  createdAt: integer('created_at').notNull(),
  confirmedAt: integer('confirmed_at')
});

export const registeredUsers = pgTable('registered_users', {
  id: text('id').primaryKey(),
  telegramId: text('telegram_id'),
  email: text('email'),
  name: text('name'),
  username: text('username'),
  role: text('role').default('user'),
  status: text('status').default('active'),
  registeredAt: text('registered_at'),
  lastLogin: text('last_login'),
  purchasedCoursesCount: integer('purchased_courses_count').default(0),
  isPartner: integer('is_partner').default(0)
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userTelegramId: text('user_telegram_id'),
  userName: text('user_name'),
  customerEmail: text('customer_email'),
  itemsJson: text('items_json'),
  totalAmount: real('total_amount'),
  discountAmount: real('discount_amount').default(0),
  promoCode: text('promo_code'),
  paymentMethod: text('payment_method').default('sbp'),
  paymentId: text('payment_id'),
  status: text('status').default('pending'),
  createdAt: text('created_at'),
  paidAt: text('paid_at'),
  notes: text('notes')
});

export const userPurchases = pgTable('user_purchases', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userTelegramId: text('user_telegram_id'),
  orderId: text('order_id'),
  courseId: text('course_id'),
  courseTitle: text('course_title'),
  subject: text('subject'),
  school: text('school'),
  year: text('year'),
  price: real('price'),
  grantedAt: text('granted_at'),
  grantedBy: text('granted_by').default('system'),
  status: text('status').default('active'),
  expiresAt: text('expires_at'),
  tariffType: text('tariff_type').default('monthly')
});

export const promocodes = pgTable('promocodes', {
  id: text('id').primaryKey(),
  code: text('code').unique(),
  discountPercent: integer('discount_percent').default(15),
  maxUses: integer('max_uses').default(500),
  usedCount: integer('used_count').default(0),
  active: integer('active').default(1),
  createdAt: text('created_at')
});

export const systemLogs = pgTable('system_logs', {
  id: text('id').primaryKey(),
  action: text('action'),
  details: text('details'),
  adminTelegramId: text('admin_telegram_id'),
  timestamp: text('timestamp')
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value')
});

export const supportMessages = pgTable('support_messages', {
  id: text('id').primaryKey(),
  userTelegramId: text('user_telegram_id'),
  userName: text('user_name'),
  sender: text('sender'),
  text: text('text'),
  createdAt: text('created_at'),
  isRead: integer('is_read').default(0)
});

export const referralRewards = pgTable('referral_rewards', {
  id: text('id').primaryKey(),
  referrerId: text('referrer_id').notNull(),
  referredId: text('referred_id').notNull(),
  orderId: text('order_id').notNull(),
  amount: real('amount').notNull(),
  createdAt: text('created_at').notNull()
});
