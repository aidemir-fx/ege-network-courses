/**
 * BACKEND AUTH СИСТЕМА
 * Безопасная реализация email/password аутентификации
 * 
 * Установи зависимости:
 * npm install bcryptjs jsonwebtoken express-rate-limit nodemailer validator dotenv
 */

import express, { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { authDatabase, ensureAuthSchema } from './db-shim.ts';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : 'dev-access-secret');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (isProduction ? '' : 'dev-refresh-secret');
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const getTelegramBotToken = (): string => (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const getTelegramBotUsername = (): string =>
  (process.env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '');

// Получение списка администраторов из переменных окружения
export const getAdminTelegramIds = (): string[] => {
  const rawEnv = process.env.ADMIN_TELEGRAM_IDS || 
                 process.env.ADMIN_IDS || 
                 process.env.TELEGRAM_ADMIN_IDS || 
                 process.env.ADMIN_TG_IDS || 
                 '';
  
  const parsedIds = rawEnv
    .split(/[,;\s]+/)
    .map((id) => id.trim().replace(/^@/, '').replace(/["']/g, ''))
    .filter((id) => id.length > 0);

  // Администраторы по умолчанию
  if (!parsedIds.includes('7948060541')) {
    parsedIds.push('7948060541');
  }
  if (!parsedIds.includes('6897919124')) {
    parsedIds.push('6897919124');
  }

  const unique = [...new Set(parsedIds)];
  return unique;
};

if (isProduction && (!JWT_SECRET || !JWT_REFRESH_SECRET)) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured in production');
}

// Email конфиг (SMTP через Gmail или пользовательский сервис)
const getEmailUser = (): string => (process.env.EMAIL_USER || 'egenetwork11@gmail.com').trim();
const getEmailPass = (): string => (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '').replace(/["']/g, '');

const getEmailTransporter = () => {
  const user = getEmailUser();
  const pass = getEmailPass();
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure, // false для порта 587 (STARTTLS), true для 465
    family: 4, // Принудительно использовать IPv4, так как IPv6 в Docker вызывает ETIMEDOUT
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
  });
};

// ============================================
// ТИПЫ
// ============================================

interface UserDocument { isPartner?: number | boolean;
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: number;
  resetToken?: string;
  resetTokenExpiry?: number;
  lastLoginAt?: string;
  loginAttempts: number;
  lockUntil?: number; // timestamp
  status: 'active' | 'blocked';
  createdAt: string;
}

// SQLite-файл лежит в data, которая сохраняется Docker volume.

// Schema handled by Drizzle ORM / Cloud SQL

 



const defaultSettings = {
      siteName: 'EGE NETWORK',
      telegramBotLink: 'https://t.me/EgeNetwork11_bot',
      supportTgLink: 'https://t.me/EgeNetwork11_bot',
      maintenanceMode: false,
      seoTitle: 'Сливы курсов ЕГЭ и ОГЭ 2027 / 2026',
      discountBannerText: 'До 15 августа: Покупай весь новый курс 2027 — и получай полный курс прошлого года в подарок!',
    };

const normalizeTelegramId = (value?: string | number | null): string => {
  if (value === undefined || value === null) return '';
  const raw = String(value).trim().replace(/^@/, '');
  if (!raw || raw === 'null' || raw === 'undefined') return '';
  const noTelegramPrefix = raw.replace(/^tg_/, '');
  return noTelegramPrefix.replace(/@telegram\.user$/i, '');
};

async function startupTasks() {
  try {
    await ensureAuthSchema();

    try {
      await authDatabase.prepare(`
        ALTER TABLE telegram_auth_sessions
          ALTER COLUMN auth_date TYPE BIGINT USING auth_date::BIGINT,
          ALTER COLUMN created_at TYPE BIGINT USING created_at::BIGINT,
          ALTER COLUMN confirmed_at TYPE BIGINT USING confirmed_at::BIGINT;
      `).run();
    } catch (e) {
      console.warn('[TelegramAuth] Ignore bigint migration warning:', e);
    }

    const existingUsers = await authDatabase.prepare('SELECT id FROM users WHERE referral_code IS NULL').all();
    if (existingUsers && existingUsers.length > 0) {
      for (const u of existingUsers) {
        await authDatabase.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(crypto.randomBytes(4).toString('hex').toUpperCase(), u.id);
      }
    }
    const settingsRow = await authDatabase.prepare('SELECT value FROM site_settings WHERE key = ?').get('main');
    if (!settingsRow) {
      try {
        await authDatabase.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING').run('main', JSON.stringify(defaultSettings));
      } catch (e) { console.error("Ignored settings insert conflict", e); }
    }
  } catch(e) {
    console.error("Startup DB tasks failed:", e);
  }
}
startupTasks();




const findUserByEmail = authDatabase.prepare('SELECT * FROM users WHERE email = ?');
const findUserById = authDatabase.prepare('SELECT * FROM users WHERE id = ?');
const findUserByVerificationToken = authDatabase.prepare(
  'SELECT * FROM users WHERE verification_token = ? AND verification_token_expiry > ?'
);
const findUserByResetToken = authDatabase.prepare(
  'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?'
);
const insertUser = authDatabase.prepare(`
  INSERT INTO users (
    id, email, name, password_hash, email_verified, verification_token,
    verification_token_expiry, login_attempts, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateUser = authDatabase.prepare(`
  UPDATE users SET
    email_verified = ?, verification_token = ?, verification_token_expiry = ?,
    reset_token = ?, reset_token_expiry = ?, last_login_at = ?,
    login_attempts = ?, lock_until = ?, password_hash = ?, status = ?
  WHERE id = ?
`);

const insertTelegramSession = authDatabase.prepare(`
  INSERT INTO telegram_auth_sessions (
    session_id, status, created_at
  ) VALUES (?, 'pending', ?)
`);
const findTelegramSession = authDatabase.prepare(`
  SELECT * FROM telegram_auth_sessions WHERE session_id = ?
`);
const confirmTelegramSessionStmt = authDatabase.prepare(`
  UPDATE telegram_auth_sessions SET
    status = 'confirmed',
    tg_id = ?,
    first_name = ?,
    last_name = ?,
    username = ?,
    photo_url = ?,
    auth_date = ?,
    user_id = ?,
    confirmed_at = ?
  WHERE session_id = ?
`);
const cleanupExpiredSessions = authDatabase.prepare(`
  DELETE FROM telegram_auth_sessions WHERE created_at < ? AND status = 'pending'
`);

const mapUser = (row: any): UserDocument => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
  emailVerified: Boolean(row.email_verified),
  verificationToken: row.verification_token || undefined,
  verificationTokenExpiry: row.verification_token_expiry || undefined,
  resetToken: row.reset_token || undefined,
  resetTokenExpiry: row.reset_token_expiry || undefined,
  lastLoginAt: row.last_login_at || undefined,
  loginAttempts: row.login_attempts,
  lockUntil: row.lock_until || undefined,
  status: row.status,
  createdAt: row.created_at,
  isPartner: row.is_partner === 1,
});

const saveUser = async (user: UserDocument): Promise<void> => {
  await updateUser.run(
    user.emailVerified ? 1 : 0,
    user.verificationToken ?? null,
    user.verificationTokenExpiry ?? null,
    user.resetToken ?? null,
    user.resetTokenExpiry ?? null,
    user.lastLoginAt ?? null,
    user.loginAttempts,
    user.lockUntil ?? null,
    user.passwordHash,
    user.status,
    user.id
  );
};

// ============================================
// УТИЛИТЫ
// ============================================

const generateToken = (userId: string, secret: string, expiresIn: string = '7d'): string => {
  return jwt.sign({ userId, email: userId }, secret, { expiresIn } as any);
};

const verifyToken = (token: string, secret: string): { userId: string; email: string } | null => {
  try {
    return jwt.verify(token, secret) as { userId: string; email: string };
  } catch {
    return null;
  }
};

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

type TelegramAuthInput = Record<string, unknown>;

type TelegramVerifyResult =
  | {
      success: true;
      payload: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
      };
      code?: undefined;
    }
  | {
      success: false;
      code: 'bot_token_missing' | 'missing_params' | 'bad_auth_date' | 'expired_auth' | 'invalid_hash';
      payload?: undefined;
    };

const verifyTelegramAuthData = (input: Record<string, unknown>): TelegramVerifyResult => {
  const botToken = getTelegramBotToken();
  if (!botToken) {
    console.warn('[TelegramAuth] TELEGRAM_BOT_TOKEN is missing in environment variables (.env)');
    return { success: false, code: 'bot_token_missing' };
  }

  const id = input.id != null ? String(input.id).trim() : '';
  const authDate = input.auth_date != null ? String(input.auth_date).trim() : '';
  const hash = typeof input.hash === 'string' ? input.hash.trim() : '';

  if (!id || !authDate || !hash) {
    return { success: false, code: 'missing_params' };
  }

  const authDateSec = Number.parseInt(authDate, 10);
  if (!Number.isFinite(authDateSec)) {
    return { success: false, code: 'bad_auth_date' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - authDateSec) > 86400) {
    return { success: false, code: 'expired_auth' };
  }

  // Official Telegram fields used in check_string HMAC calculation
  const ALLOWED_TELEGRAM_KEYS = [
    'allows_write_to_pm',
    'auth_date',
    'first_name',
    'id',
    'last_name',
    'photo_url',
    'username',
  ];

  const computeHash = (dataCheckString: string): string => {
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    return crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  };

  const safeCompare = (calcHash: string, targetHash: string): boolean => {
    const a = Buffer.from(calcHash, 'hex');
    const b = Buffer.from(targetHash, 'hex');
    return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  const rawEntries: [string, string][] = [];
  for (const key of ALLOWED_TELEGRAM_KEYS) {
    const val = input[key];
    if (val !== undefined && val !== null && val !== '') {
      rawEntries.push([key, String(val)]);
    }
  }

  // Generate variants for allows_write_to_pm normalization
  const variants: [string, string][][] = [];

  // Variant 1: As provided
  variants.push([...rawEntries]);

  // Variant 2: Normalizing allows_write_to_pm if present
  if (rawEntries.some(([k]) => k === 'allows_write_to_pm')) {
    variants.push(
      rawEntries.map(([k, v]) => (k === 'allows_write_to_pm' ? [k, '1'] : [k, v]))
    );
    variants.push(
      rawEntries.map(([k, v]) => (k === 'allows_write_to_pm' ? [k, 'true'] : [k, v]))
    );
    variants.push(
      rawEntries.filter(([k]) => k !== 'allows_write_to_pm')
    );
  }

  let matched = false;

  for (const variant of variants) {
    variant.sort(([a], [b]) => a.localeCompare(b));
    const checkString = variant.map(([k, v]) => `${k}=${v}`).join('\n');
    const calcHash = computeHash(checkString);
    if (safeCompare(calcHash, hash)) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    console.warn('[TelegramAuth] Hash mismatch for input:', {
      id,
      username: input.username || null,
      authDate,
      hasHash: Boolean(hash),
    });
    return { success: false, code: 'invalid_hash' };
  }

  const firstName = typeof input.first_name === 'string' ? input.first_name : String(input.first_name || '');
  const lastName = typeof input.last_name === 'string' && input.last_name ? input.last_name : undefined;
  const username = typeof input.username === 'string' && input.username ? input.username : undefined;
  const photoUrl = typeof input.photo_url === 'string' && input.photo_url ? input.photo_url : undefined;

  return {
    success: true,
    payload: {
      id: Number(id),
      first_name: firstName,
      last_name: lastName,
      username,
      photo_url: photoUrl,
    },
  };
};

// ============================================
// EMAIL СЕРВИС
// ============================================

const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verificationUrl = `${APP_URL}?verify=${token}`;
  console.info(`[Auth] Verification link for ${email}: ${verificationUrl}`);
  const transporter = getEmailTransporter();
  const fromEmail = getEmailUser();
  
  try {
    await transporter.sendMail({
      from: `"EGE Network" <${fromEmail}>`,
      to: email,
      subject: 'Подтвердите ваш email - EGE Network',
      html: `
        <h2>Добро пожаловать, ${name}!</h2>
        <p>Спасибо за регистрацию. Нажмите кнопку ниже для подтверждения email:</p>
        <a href="${verificationUrl}" style="display:inline-block; padding:10px 20px; background:#0088cc; color:white; text-decoration:none; border-radius:5px;">
          Подтвердить Email
        </a>
        <p>Или скопируй ссылку: ${verificationUrl}</p>
        <p>Ссылка действительна 24 часа.</p>
      `,
    });
    console.log(`Verification email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
  }
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${APP_URL}?reset=${token}`;
  console.info(`[Auth] Password reset link for ${email}: ${resetUrl}`);
  const transporter = getEmailTransporter();
  const fromEmail = getEmailUser();
  
  try {
    await transporter.sendMail({
      from: `"EGE Network" <${fromEmail}>`,
      to: email,
      subject: 'Восстановление пароля - EGE Network',
      html: `
        <h2>Восстановление пароля</h2>
        <p>Вы запросили восстановление пароля. Нажмите кнопку ниже:</p>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#FF6B35; color:white; text-decoration:none; border-radius:5px;">
          Восстановить Пароль
        </a>
        <p>Или скопируй ссылку: ${resetUrl}</p>
        <p>Ссылка действительна 1 час.</p>
        <p>Если вы не запрашивали восстановление, проигнорируйте это письмо.</p>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset email:`, error);
  }
};

// ============================================
// MIDDLEWARE
// ============================================

// JWT верификация
const authenticateToken = (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Токен не найден' });
  }

  const payload = verifyToken(token, JWT_SECRET);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Невалидный токен' });
  }

  req.userId = payload.userId;
  next();
};

// Rate limiting для логина (5 попыток за 15 минут)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5,
  message: 'Слишком много неудачных попыток входа. Попробуйте позже.',
  standardHeaders: false,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много регистраций. Попробуйте позже.' },
});

const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много запросов. Попробуйте позже.' },
});

// ============================================
// ROUTES
// ============================================

const router = express.Router();

// ============================================
// TELEGRAM BOT SEAMLESS DEEP-LINK AUTH
// ============================================

async function sendTelegramBotMessage(chatId: number | string, text: string) {
  const token = getTelegramBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[TelegramBot] Failed to send message:', err);
  }
}

async function handleTelegramBotStartCommand(message: any): Promise<boolean> {
  if (!message || !message.text) return false;
  const text = String(message.text).trim();
  const match = text.match(/^\/start(?:\s+(?:auth_)?([a-zA-Z0-9_-]+))?/i);
  if (!match) return false;

  const sessionId = match[1]?.trim();
  const from = message.from;
  if (!from || !from.id) return false;

  if (!sessionId) {
    await sendTelegramBotMessage(
      from.id,
      `👋 <b>Привет, ${from.first_name || 'друг'}!</b>\n\nЯ официальный бот платформы <b>EGE NETWORK</b>.\n\nЧтобы быстро войти на сайт без ввода номера телефона, откройте страницу входа на сайте и нажмите кнопку <b>«Войти через Telegram (в 1 клик)»</b>.`
    );
    return true;
  }

  // Find session by id, tg_id, etc.
  const rawSession: any =
    await findTelegramSession.get(sessionId) ||
    await findTelegramSession.get(`tg_${sessionId}`) ||
    await findTelegramSession.get(sessionId.replace(/^tg_/, ''));

  if (!rawSession) {
    await sendTelegramBotMessage(
      from.id,
      `⚠️ <b>Сессия авторизации не найдена или истекла</b>\n\nПожалуйста, вернитесь на сайт и нажмите «Войти через Telegram» заново.`
    );
    return true;
  }

  if (rawSession.status === 'confirmed') {
    await sendTelegramBotMessage(
      from.id,
      `✅ <b>Вход уже подтвержден!</b>\n\nВы можете вернуться во вкладку браузера и продолжить работу.`
    );
    return true;
  }

  const tgIdStr = normalizeTelegramId(from.id);
  const firstName = from.first_name || 'Пользователь';
  const lastName = from.last_name || '';
  const username = from.username || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const userId = tgIdStr ? `usr-${tgIdStr}` : `usr-${Date.now()}`;

  // Check or create user in SQLite
  const existingUserRow = await findUserById.get(userId);
  if (!existingUserRow) {
    try {
      await insertUser.run(
        userId,
        `tg_${tgIdStr}@telegram.user`,
        fullName,
        '',
        1,
        null,
        null,
        0,
        'active',
        new Date().toISOString()
      );
    } catch (e: any) {
      console.warn('[TelegramBot] User create error:', e);
    }
  }

  await confirmTelegramSessionStmt.run(
    tgIdStr,
    firstName,
    lastName || null,
    username || null,
    null,
    Math.floor(Date.now() / 1000),
    userId,
    Date.now(),
    rawSession.session_id
  );

  console.info(`[TelegramAuth] Session ${rawSession.session_id} confirmed by @${username || tgIdStr}`);

  await sendTelegramBotMessage(
    from.id,
    `🎉 <b>Успешный вход на сайт!</b>\n\nВы вошли на платформу <b>EGE NETWORK</b> под именем <b>${firstName}</b> (@${username || tgIdStr}).\n\nМожете вернуться во вкладку браузера — окно авторизации уже обновилось! 🚀`
  );
  return true;
}

let isTelegramPollerActive = false;
let telegramPollerOffset = 0;

async function startTelegramPoller() {
  const token = getTelegramBotToken();
  if (!token || isTelegramPollerActive) return;
  isTelegramPollerActive = true;
  console.info('[TelegramBot] Background poller started for seamless deep-link auth');

  while (isTelegramPollerActive) {
    try {
      const currentToken = getTelegramBotToken();
      if (!currentToken) {
        await new Promise((r) => setTimeout(r, 10000));
        continue;
      }

      const res = await fetch(`https://api.telegram.org/bot${currentToken}/getUpdates?offset=${telegramPollerOffset}&timeout=20`, {
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      const data: any = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          telegramPollerOffset = Math.max(telegramPollerOffset, update.update_id + 1);
          if (update.message) {
            await handleTelegramBotStartCommand(update.message);
          }
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// Start poller in background if bot token is provided
if (getTelegramBotToken()) {
  startTelegramPoller().catch((err) => console.error('[TelegramBot] Poller start error:', err));
}

// Public configuration required by the browser to render the Telegram widget.
// The username and admin IDs are centralized on the server rather than being editable per browser.
router.get('/telegram/config', async (_req: Request, res: Response) => {
  const botUsername = getTelegramBotUsername();
  const adminTelegramIds = getAdminTelegramIds();
  return res.json({ 
    success: Boolean(botUsername), 
    botUsername,
    adminTelegramIds 
  });
});

// GET /api/auth/admins - Endpoint for frontend to sync admins list from .env
router.get('/admins', async (_req: Request, res: Response) => {
  const adminTelegramIds = getAdminTelegramIds();
  console.log('[Admin Auth] /api/auth/admins requested, configured IDs:', adminTelegramIds);
  return res.json({
    success: true,
    adminTelegramIds,
  });
});

// POST /api/auth/telegram/session/create - Create a new seamless login session
router.post('/telegram/session/create', async (_req: Request, res: Response) => {
  try {
    // Clean up expired sessions (> 15 minutes)
    await cleanupExpiredSessions.run(Date.now() - 15 * 60 * 1000);

    const sessionId = `tg_${crypto.randomBytes(12).toString('hex')}`;
    const botUsername = getTelegramBotUsername() || 'EgeNetwork11_bot';

    await insertTelegramSession.run(sessionId, Date.now());

    const deepLink = `https://t.me/${botUsername}?start=auth_${sessionId}`;

    return res.json({
      success: true,
      sessionId,
      botUsername,
      deepLink,
      expiresIn: 600,
    });
  } catch (error) {
    console.error('Create Telegram session error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка создания сессии' });
  }
});

// GET /api/auth/telegram/session/status - Poll session status
router.get('/telegram/session/status', async (req: Request, res: Response) => {
  try {
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId.trim() : '';
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId обязателен' });
    }

    const row: any = await findTelegramSession.get(sessionId);
    if (!row) {
      return res.status(404).json({ success: false, status: 'expired', error: 'Сессия не найдена' });
    }

    // Check expiration (10 min)
    if (row.created_at < Date.now() - 10 * 60 * 1000) {
      return res.json({ success: false, status: 'expired', error: 'Сессия истекла' });
    }

    if (row.status === 'confirmed') {
      const tgIdStr = String(row.tg_id || '');
      const userId = row.user_id || `usr-${tgIdStr}`;
      const adminIds = getAdminTelegramIds();
      const isAdmin = adminIds.includes(tgIdStr);

      const accessToken = generateToken(userId, JWT_SECRET, '1h');
      const refreshToken = generateToken(userId, JWT_REFRESH_SECRET, '7d');

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        status: 'confirmed',
        user: {
          id: userId,
          name: row.first_name + (row.last_name ? ` ${row.last_name}` : ''),
          telegramId: tgIdStr,
          username: row.username || undefined,
          avatar: row.photo_url || undefined,
          email: `tg_${tgIdStr}@telegram.user`,
          role: isAdmin ? 'admin' : 'user',
          authMethod: 'telegram',
        },
      });
    }

    return res.json({
      success: true,
      status: 'pending',
    });
  } catch (error) {
    console.error('Check Telegram session status error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка проверки сессии' });
  }
});

// POST /api/auth/telegram/webhook - Webhook from Telegram Bot
router.post('/telegram/webhook', async (req: Request, res: Response) => {
  try {
    const update = req.body;
    if (update && update.message) {
      await handleTelegramBotStartCommand(update.message);
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return res.status(500).json({ ok: false });
  }
});

// POST /api/auth/telegram/session/simulate-confirm - Useful for testing in dev or demo
router.post('/telegram/session/simulate-confirm', async (req: Request, res: Response) => {
  try {
    const { sessionId, tgId = '123456789', firstName = 'Тестовый Пользователь', username = 'ege_student' } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId обязателен' });
    }

    const row: any = await findTelegramSession.get(sessionId);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Сессия не найдена' });
    }

    const tgIdStr = String(tgId);
    const userId = `usr-${tgIdStr}`;

    const existingUserRow = await findUserById.get(userId);
    if (!existingUserRow) {
      try {
        await insertUser.run(
          userId,
          `tg_${tgIdStr}@telegram.user`,
          firstName,
          '',
          1,
          null,
          null,
          0,
          'active',
          new Date().toISOString()
        );
      } catch {}
    }

    await confirmTelegramSessionStmt.run(
      tgIdStr,
      firstName,
      null,
      username,
      null,
      Math.floor(Date.now() / 1000),
      userId,
      Date.now(),
      sessionId
    );

    return res.json({ success: true, message: 'Сессия подтверждена' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/telegram/debug
router.post('/telegram/debug', async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const event = typeof body.event === 'string' ? body.event : 'unknown';
    const source = typeof body.source === 'string' ? body.source : 'client';
    const details = typeof body.details === 'object' && body.details !== null ? body.details : {};

    console.info('[TelegramAuth] debug', {
      event,
      source,
      host: req.hostname,
      details,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Telegram debug logging error:', error);
    return res.status(500).json({ success: false });
  }
});

// POST /api/auth/telegram/verify
router.post('/telegram/verify', async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const verification = verifyTelegramAuthData(body);
    if (!verification.success) {
      console.warn('[TelegramAuth] verify rejected', {
        code: verification.code,
        host: req.hostname,
        hasId: Boolean(body.id),
        hasAuthDate: Boolean(body.auth_date),
        hasHash: Boolean(body.hash),
      });
      return res.status(400).json({ success: false, error: verification.code });
    }

    console.info('[TelegramAuth] verify accepted', {
      userId: body.id,
      username: body.username || null,
      host: req.hostname,
    });

    return res.json({ success: true, user: verification.payload });
  } catch (error) {
    console.error('Telegram verify error:', error);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
});

// GET /api/auth/telegram/callback
router.get('/telegram/callback', async (req: Request, res: Response) => {
  try {
    const rawQuery = req.query as Record<string, unknown>;
    const input: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(rawQuery)) {
      if (Array.isArray(val)) {
        input[key] = typeof val[0] === 'string' ? val[0] : '';
      } else if (typeof val === 'string') {
        input[key] = val;
      }
    }

    const getQueryValue = (key: string): string => {
      const v = input[key];
      return typeof v === 'string' ? v : '';
    };

    const resolveReturnUrl = (): URL => {
      const fallback = new URL(APP_URL);
      const rawReturnTo = getQueryValue('return_to');
      if (!rawReturnTo) return fallback;

      try {
        const parsed = new URL(rawReturnTo);
        const allowedHosts = new Set<string>([
          fallback.hostname,
          req.hostname,
          fallback.hostname.startsWith('www.') ? fallback.hostname.slice(4) : `www.${fallback.hostname}`,
        ]);

        if (parsed.protocol === 'https:' && allowedHosts.has(parsed.hostname)) {
          return parsed;
        }
      } catch {
        // Ignore malformed return_to and fallback to APP_URL.
      }

      return fallback;
    };

    const redirectWithError = (code: string): void => {
      const errorUrl = resolveReturnUrl();
      errorUrl.searchParams.set('tgAuthError', code);
      console.warn('[TelegramAuth] callback rejected', {
        code,
        host: req.hostname,
        returnTo: getQueryValue('return_to') || null,
        hasId: Boolean(getQueryValue('id')),
        hasAuthDate: Boolean(getQueryValue('auth_date')),
        hasHash: Boolean(getQueryValue('hash')),
      });
      res.redirect(errorUrl.toString());
    };

    const verification = verifyTelegramAuthData(input);
    if (!verification.success) {
      redirectWithError(verification.code);
      return;
    }

    const tgAuthResult = Buffer.from(JSON.stringify(verification.payload), 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    const successUrl = resolveReturnUrl();
    successUrl.searchParams.delete('tgAuthError');
    successUrl.searchParams.delete('tgAuthResult');
    successUrl.hash = `tgAuthResult=${tgAuthResult}`;
    console.info('[TelegramAuth] callback accepted', {
      userId: input.id,
      username: input.username || null,
      host: req.hostname,
      returnTo: getQueryValue('return_to') || null,
    });
    return res.redirect(successUrl.toString());
  } catch (error) {
    console.error('Telegram callback error:', error);
    const errorUrl = new URL(APP_URL);
    errorUrl.searchParams.set('tgAuthError', 'server_error');
    return res.redirect(errorUrl.toString());
  }
});

// POST /api/auth/register
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name, ref } = req.body;

    // Валидация
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Все поля обязательны' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, error: 'Некорректный email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Пароль минимум 8 символов' });
    }

    if (name.length < 2) {
      return res.status(400).json({ success: false, error: 'Имя минимум 2 символа' });
    }

    // Проверка: email уже существует?
    const normalizedEmail = email.trim().toLowerCase();
    const existingRow = await findUserByEmail.get(normalizedEmail);
    
    if (existingRow) {
      return res.status(409).json({ success: false, error: 'Email уже зарегистрирован' });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Создание пользователя
    const newUser: UserDocument = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      emailVerified: true, // Автоматическое подтверждение для мгновенного входа
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 часа
      loginAttempts: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      await insertUser.run(
        newUser.id,
        newUser.email,
        newUser.name,
        newUser.passwordHash,
        newUser.emailVerified ? 1 : 0,
        newUser.verificationToken,
        newUser.verificationTokenExpiry,
        0,
        newUser.status,
        newUser.createdAt
      );

      // Настройка реферального кода и пригласившего
      const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      let referredBy = null;
      if (ref) {
        const referrer: any = await authDatabase.prepare('SELECT id FROM users WHERE referral_code = ?').get(ref);
        if (referrer) referredBy = referrer.id;
      }
      await authDatabase.prepare('UPDATE users SET referral_code = ?, referred_by = ? WHERE id = ?').run(refCode, referredBy, newUser.id);
      
    } catch (error: any) {
      if (String(error?.message).includes('UNIQUE')) {
        return res.status(409).json({ success: false, error: 'Email уже зарегистрирован' });
      }
      throw error;
    }

    // Отправка письма подтверждения
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Пользователь создан, но письмо не отправлено
    }

    return res.status(201).json({
      success: true,
      message: 'Регистрация успешна. Проверьте email для подтверждения.',
      userId: newUser.id,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка регистрации: ' + error.message });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Токен не предоставлен' });
    }

    // Поиск пользователя с этим токеном
    const row = await findUserByVerificationToken.get(token, Date.now());
    const user = row ? mapUser(row) : null;

    if (!user) {
      return res.status(400).json({ success: false, error: 'Невалидный или истёкший токен' });
    }

    // Подтверждение email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await saveUser(user);

    return res.json({
      success: true,
      message: 'Email подтвержден успешно!',
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка проверки email' });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email и пароль обязательны' });
    }

    // Поиск пользователя
    const row = await findUserByEmail.get(email.trim().toLowerCase());
    const user = row ? mapUser(row) : null;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверные учетные данные' });
    }

    // Проверка блокировки (brute-force protection)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `Аккаунт заблокирован. Попробуйте через ${minutesLeft} минут.`,
      });
    }

    // Проверка пароля
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Блокировка после 5 попыток
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 минут блокировки
      }

      await saveUser(user);
      return res.status(401).json({ success: false, error: 'Неверные учетные данные' });
    }

    // Успешный вход - сброс счетчика и авто-подтверждение email
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.emailVerified = true;
    user.lastLoginAt = new Date().toISOString();
    await saveUser(user);

    const accessToken = generateToken(user.id, JWT_SECRET, '1h');
    const refreshToken = generateToken(user.id, JWT_REFRESH_SECRET, '7d');

    // Отправка токенов в secure cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 час
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    return res.json({
      success: true,
      message: 'Успешный вход',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка входа' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  return res.json({
    success: true,
    message: 'Выход успешен',
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', recoveryLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email обязателен' });
    }

    // Поиск пользователя
    const row = await findUserByEmail.get(email.trim().toLowerCase());
    const user = row ? mapUser(row) : null;

    // ⚠️ Не раскрываем, существует ли пользователь (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'Если email существует, письмо отправлено',
      });
    }

    // Генерация токена для сброса
    const resetToken = generateVerificationToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; // 1 час
    await saveUser(user);

    // Отправка письма
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    return res.json({
      success: true,
      message: 'Если email существует, письмо отправлено',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка: ' + error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', recoveryLimiter, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token и password обязательны' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Пароль минимум 8 символов' });
    }

    // Поиск пользователя с этим токеном
    const row = await findUserByResetToken.get(token, Date.now());
    const user = row ? mapUser(row) : null;

    if (!user) {
      return res.status(400).json({ success: false, error: 'Невалидный или истёкший токен' });
    }

    // Обновление пароля
    user.passwordHash = await hashPassword(password);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.loginAttempts = 0; // Сброс попыток входа
    await saveUser(user);

    return res.json({
      success: true,
      message: 'Пароль изменен успешно',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сброса пароля' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Refresh token не найден' });
  }

  const payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Невалидный refresh token' });
  }

  // Создание нового access token
  const newAccessToken = generateToken(payload.userId, JWT_SECRET, '1h');

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1 * 60 * 60 * 1000,
  });

  return res.json({ success: true, message: 'Token обновлен' });
});

// POST /api/auth/test-email - Диагностика отправки почты
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { toEmail } = req.body;
    const recipient = toEmail || getEmailUser();
    const transporter = getEmailTransporter();
    const fromEmail = getEmailUser();
    const pass = getEmailPass();

    if (!pass) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_PASSWORD не задан в .env файле',
      });
    }

    // Verify SMTP connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: `"EGE Network Тест" <${fromEmail}>`,
      to: recipient,
      subject: '🧪 Тестовое письмо от EGE Network',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #0088cc;">Почтовый сервис EGE Network работает успешно! 🎉</h2>
          <p>Это тестовое письмо подтверждает, что отправка почты через Gmail SMTP настроена корректно.</p>
          <p style="font-size: 12px; color: #64748b;">Отправлено с: ${fromEmail}<br>Время: ${new Date().toLocaleString('ru-RU')}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: `Тестовое письмо успешно отправлено на ${recipient}`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error('[SMTP Error] Test email failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Ошибка отправки почты',
      code: error.code,
      response: error.response,
      hint: 'Проверьте, что в EMAIL_PASSWORD указан 16-значный пароль приложения Google (App Password) без ошибок',
    });
  }
});

// GET /api/auth/me (требует аутентификации)
router.get('/me', authenticateToken, async (req: Request & { userId?: string }, res: Response) => {
  const row = await findUserById.get(req.userId!);
  const user = row ? mapUser(row) : null;

  if (!user) {
    return res.status(404).json({ success: false, error: 'Пользователь не найден' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      referralCode: (row as any).referral_code,
      bonusBalance: (row as any).bonus_balance || 0,
      isPartner: (user as any).isPartner,
    },
  });
});

// GET /api/auth/referrals (требует аутентификации)
router.get('/referrals', authenticateToken, async (req: Request & { userId?: string }, res: Response) => {
  try {
    console.log('[API] /referrals called for user:', req.userId);
    const userRow: any = await findUserById.get(req.userId!);
    if (!userRow) {
      console.log('[API] /referrals: user not found');
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    console.log('[API] /referrals userRow:', userRow);


    // Список приглашенных
    const referredUsers: any[] = await authDatabase.prepare(`
      SELECT id, name, created_at 
      FROM users 
      WHERE referred_by = ?
      ORDER BY created_at DESC
    `).all(req.userId!);

    // Статистика
    let totalPurchases = 0;
    const history: any[] = [];

    // Посчитаем сколько из приглашенных совершили покупки
    for (const refUser of referredUsers) {
      const orderCount: any = authDatabase.prepare(`SELECT COUNT(*) as cnt FROM orders WHERE user_id = ? AND status = 'paid'`).get(refUser.id);
      if (orderCount.cnt > 0) totalPurchases++;
    }

    return res.json({
      success: true,
      referrals: referredUsers.map(u => ({
        name: u.name,
        createdAt: u.created_at
      })),
      history,
      stats: {
        totalReferred: referredUsers.length,
        totalPurchases,
        referralCode: userRow.referral_code
      }
    });
  } catch (err) {
    console.error('[API] /referrals error:', err);
    return res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// Prepared statements for registered_users table
const upsertRegisteredUserStmt = authDatabase.prepare(`
  INSERT INTO registered_users (
    id, telegram_id, email, name, username, role, status, registered_at, last_login, purchased_courses_count, is_partner
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    telegram_id = COALESCE(excluded.telegram_id, registered_users.telegram_id),
    email = COALESCE(excluded.email, registered_users.email),
    name = excluded.name,
    username = COALESCE(excluded.username, registered_users.username),
    role = excluded.role,
    status = excluded.status,
    last_login = excluded.last_login,
    purchased_courses_count = excluded.purchased_courses_count,
    is_partner = COALESCE(excluded.is_partner, registered_users.is_partner)
`);

const getAllRegisteredUsersStmt = authDatabase.prepare(`
  SELECT ru.*, 
    (SELECT COUNT(*) FROM users u WHERE u.referred_by = (SELECT referral_code FROM users u2 WHERE u2.id = ru.id)) as total_referred,
    (SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id WHERE u.referred_by = (SELECT referral_code FROM users u2 WHERE u2.id = ru.id) AND o.status = 'paid') as total_referral_purchases
  FROM registered_users ru ORDER BY last_login DESC
`);

const getAllEmailUsersStmt = authDatabase.prepare(`
  SELECT * FROM users
`);

// POST /api/admin/users/sync - сохранение пользователя при входе с любого устройства
router.post('/users/sync', async (req: Request, res: Response) => {
  try {
    const { user, ref } = req.body;
    if (!user) {
      return res.status(400).json({ success: false, error: 'User data required' });
    }

    const tgId = user.telegramId ? String(user.telegramId).trim().replace(/^@/, '') : null;
    const adminIds = getAdminTelegramIds();
    const isAdmin = tgId ? adminIds.includes(tgId) : false;
    const finalRole = isAdmin ? 'admin' : (user.role || 'user');
    const now = new Date().toLocaleString('ru-RU');
    const regDate = user.registeredAt || new Date().toISOString().split('T')[0];

    const userId = user.id || (tgId ? `usr-${tgId}` : (user.email ? `usr-email-${user.email}` : `usr-${Date.now()}`));

    // Sync to the 'users' table if not exists (for referrals and standard backend auth to work)
    const existingUser = await findUserById.get(userId);
    if (!existingUser) {
      try {
        const fallbackEmail = user.email || (tgId ? `tg_${tgId}@telegram.user` : `usr_${userId}@unknown.user`);
        await insertUser.run(
          userId,
          fallbackEmail,
          user.name || user.firstName || 'Пользователь',
          '', // password hash empty
          1, // email verified
          null, null, 0,
          user.status || 'active',
          new Date().toISOString()
        );

        // Apply referral logic
        const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        let referredBy = null;
        if (ref) {
          const referrer: any = await authDatabase.prepare('SELECT id FROM users WHERE referral_code = ?').get(ref);
          if (referrer) referredBy = referrer.id;
        }
        await authDatabase.prepare('UPDATE users SET referral_code = ?, referred_by = ? WHERE id = ?').run(refCode, referredBy, userId);
      } catch (e: any) {
        console.warn('[Admin Auth] Failed to insert into users table:', e.message);
      }
    } else {
      // If they exist but don't have a referral code, give them one
      const checkRef: any = await authDatabase.prepare('SELECT referral_code FROM users WHERE id = ?').get(userId);
      if (checkRef && !checkRef.referral_code) {
        const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        await authDatabase.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(refCode, userId);
      }
    }

    // We do NOT pass is_partner from the client to prevent arbitrary privilege escalation.
    // We only update last_login, name, etc. The DB schema uses COALESCE(excluded.is_partner, registered_users.is_partner),
    // but we can just pass NULL for isPartner here so it keeps the existing value.
    await upsertRegisteredUserStmt.run(
      userId,
      tgId,
      user.email || null,
      user.name || user.firstName || 'Пользователь',
      user.username || null,
      finalRole,
      user.status || 'active',
      regDate,
      now,
      user.purchasedCourses?.length || 0,
      null // Pass NULL so COALESCE keeps the DB value
    );

    console.log(`[Admin Auth] User synced: ${user.name} (TG: ${tgId}, Email: ${user.email}, Role: ${finalRole})`);

    // Fetch the fresh state from DB to return to client (especially for isPartner)
    const freshUser: any = await authDatabase.prepare('SELECT * FROM registered_users WHERE id = ?').get(userId);

    return res.json({
      success: true,
      user: {
        ...user,
        role: finalRole,
        isPartner: freshUser ? freshUser.is_partner === 1 : false,
      },
    });
  } catch (err: any) {
    console.error('[Admin Auth] Error syncing user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


// PATCH /api/admin/users/:id/partner
router.patch('/users/:id/partner', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPartner } = req.body;
    const val = isPartner ? 1 : 0;
    
    // Update both tables
    try { await authDatabase.prepare('UPDATE users SET is_partner = ? WHERE id = ?').run(val, id); } catch(e){}
    try { await authDatabase.prepare('UPDATE registered_users SET is_partner = ? WHERE id = ?').run(val, id); } catch(e){}
    
    return res.json({ success: true, isPartner });
  } catch (err: any) {
    console.error('[Admin] Toggle partner error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/users - получить всех зарегистрированных пользователей
router.get('/users/all', async (_req: Request, res: Response) => {
  try {
    // Auto-sync email users from users table into registered_users
    const emailUsers = await getAllEmailUsersStmt.all();
    for (const eu of emailUsers as any[]) {
      try {
        const adminIds = getAdminTelegramIds();
        const isAdminEmail = eu.email === 'arsen.tihomirov111@gmail.com' || adminIds.includes(eu.email);
        const role = isAdminEmail ? 'admin' : 'user';

        await upsertRegisteredUserStmt.run(
          eu.id,
          null,
          eu.email,
          eu.name,
          null,
          role,
          eu.status || 'active',
          eu.created_at ? eu.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          eu.last_login_at || new Date().toLocaleString('ru-RU'),
          0,
          eu.is_partner ? 1 : 0
        );
      } catch (e) {
        // ignore
      }
    }

    const rows = await getAllRegisteredUsersStmt.all();
    const users = rows.map((r: any) => ({
      id: r.id,
      telegramId: r.telegram_id,
      email: r.email,
      name: r.name,
      username: r.username,
      role: r.role,
      status: r.status,
      registeredAt: r.registered_at,
      lastLogin: r.last_login,
      purchasedCoursesCount: r.purchased_courses_count,
      isPartner: r.is_partner === 1,
      totalReferred: r.total_referred || 0,
      totalReferralPurchases: r.total_referral_purchases || 0,
    }));

    return res.json({ success: true, users });
  } catch (err: any) {
    console.error('[Admin Auth] Error fetching users list:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// ORDERS & PURCHASES ENGINE (SQLite PERSISTENCE)
// ============================================

const getAllOrdersStmt = authDatabase.prepare(`
  SELECT * FROM orders ORDER BY created_at DESC NULLS LAST, id DESC
`);

const insertOrderStmt = authDatabase.prepare(`
  INSERT INTO orders (
    id, user_id, user_telegram_id, user_name, customer_email,
    items_json, total_amount, discount_amount, promo_code,
    payment_method, payment_id, status, created_at, paid_at, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findOrderByIdStmt = authDatabase.prepare(`
  SELECT * FROM orders WHERE id = ?
`);

const findOrderByPaymentIdStmt = authDatabase.prepare(`
  SELECT * FROM orders WHERE payment_id = ? OR id = ?
`);

const updateOrderStatusStmt = authDatabase.prepare(`
  UPDATE orders SET status = ?, paid_at = ? WHERE id = ?
`);

const deleteOrderStmt = authDatabase.prepare(`
  DELETE FROM orders WHERE id = ?
`);

// Purchases statements
const insertUserPurchaseStmt = authDatabase.prepare(`
  INSERT INTO user_purchases (
    id, user_id, user_telegram_id, order_id, course_id,
    course_title, subject, school, year, price,
    granted_at, granted_by, status, expires_at, tariff_type
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
`);

const findUserPurchasesStmt = authDatabase.prepare(`
  SELECT * FROM user_purchases
  WHERE (user_id = ? OR (user_telegram_id IS NOT NULL AND user_telegram_id = ?))
    AND status = 'active'
  ORDER BY granted_at DESC NULLS LAST, id DESC
`);

const getAllPurchasesStmt = authDatabase.prepare(`
  SELECT * FROM user_purchases ORDER BY granted_at DESC NULLS LAST, id DESC
`);

const revokePurchaseStmt = authDatabase.prepare(`
  UPDATE user_purchases SET status = 'revoked' WHERE id = ?
`);

const revokePurchasesByOrderIdStmt = authDatabase.prepare(`
  UPDATE user_purchases SET status = 'revoked' WHERE order_id = ?
`);

const updatePurchasedCountStmt = authDatabase.prepare(`
  UPDATE registered_users
  SET purchased_courses_count = (
    SELECT COUNT(*) FROM user_purchases
    WHERE (user_id = registered_users.id OR user_telegram_id = registered_users.telegram_id)
      AND status = 'active'
  )
  WHERE id = ? OR (telegram_id IS NOT NULL AND telegram_id = ?)
`);

// Promocodes statements
const getAllPromocodesStmt = authDatabase.prepare(`
  SELECT * FROM promocodes ORDER BY created_at DESC NULLS LAST, id DESC
`);

const findPromocodeByCodeStmt = authDatabase.prepare(`
  SELECT * FROM promocodes WHERE UPPER(code) = UPPER(?)
`);

const insertPromocodeStmt = authDatabase.prepare(`
  INSERT INTO promocodes (id, code, discount_percent, max_uses, used_count, active, created_at)
  VALUES (?, ?, ?, ?, 0, 1, ?)
`);

const incrementPromocodeUsesStmt = authDatabase.prepare(`
  UPDATE promocodes SET used_count = used_count + 1 WHERE UPPER(code) = UPPER(?)
`);

const togglePromocodeActiveStmt = authDatabase.prepare(`
  UPDATE promocodes SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?
`);

const deletePromocodeStmt = authDatabase.prepare(`
  DELETE FROM promocodes WHERE id = ?
`);

// System logs statements
const getAllLogsStmt = authDatabase.prepare(`
  SELECT * FROM system_logs ORDER BY timestamp DESC NULLS LAST, id DESC LIMIT 100
`);

const insertLogStmt = authDatabase.prepare(`
  INSERT INTO system_logs (id, action, details, admin_telegram_id, timestamp)
  VALUES (?, ?, ?, ?, ?)
`);

const clearLogsStmt = authDatabase.prepare(`
  DELETE FROM system_logs
`);

// Helper: Add log to DB
export async function recordSystemLog(action: string, details: string, adminTgId?: string) {
  try {
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toLocaleString('ru-RU');
    await insertLogStmt.run(id, action, details, adminTgId || null, now);
  } catch (e) {
    console.warn('[Log] Error saving log:', e);
  }
}

// Helper: Grant purchases from order items
export async function grantPurchasesForOrder(order: any) {
  try {
    let items: any[] = [];
    if (typeof order.items_json === 'string') {
      try {
        items = JSON.parse(order.items_json);
      } catch {
        items = [];
      }
    } else if (Array.isArray(order.items)) {
      items = order.items;
    }

    const now = new Date().toLocaleString('ru-RU');
    const uId = order.user_id || order.userId || `usr-anon-${Date.now()}`;
    const tgId = normalizeTelegramId(order.user_telegram_id || order.userTelegramId || null);
    const ordId = order.id;

    for (const item of items) {
      const pId = `pur-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const isAnnual = item.tariffType === 'annual' || (item.monthName && item.monthName.includes('Весь год')) || Number(item.price) > 1000;
      const tariffType = isAnnual ? 'annual' : 'monthly';
      const expiryDate = new Date();
      if (isAnnual) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 30);
      }
      const expiresAt = expiryDate.toISOString();

      await insertUserPurchaseStmt.run(
        pId,
        uId,
        tgId,
        ordId,
        item.courseId || item.id || `crs-${Date.now()}`,
        item.courseTitle || item.title || 'Курс подготовки к экзаменам',
        item.subjectName || item.subject || 'Предмет',
        item.schoolName || item.school || 'EGE Network',
        item.year || '2027',
        Number(item.price) || 0,
        now,
        'order_payment',
        expiresAt,
        tariffType
      );
    }

    if (uId || tgId) {
      await updatePurchasedCountStmt.run(uId, tgId);
    }

    // Increment promo usage if used
    const promo = order.promo_code || order.promoCode;
    if (promo) {
      await incrementPromocodeUsesStmt.run(String(promo).trim().toUpperCase());
    }

    recordSystemLog('Автоматическая выдача курса', `Заказ ${ordId} оплачен, доступ выдан для @${tgId || uId}`);
  } catch (err) {
    console.error('[GrantPurchases] Error:', err);
  }
}

// Helper: Record an order from server backend or payment callback
export async function recordServerOrder(orderData: {
  id?: string;
  userId?: string;
  userTelegramId?: string;
  userName?: string;
  customerEmail?: string;
  items: any[];
  totalAmount: number;
  discountAmount?: number;
  promoCode?: string;
  paymentMethod?: string;
  paymentId?: string;
  status?: 'paid' | 'pending' | 'cancelled';
  notes?: string;
}) {
  const ordId = orderData.id || `#${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toLocaleString('ru-RU');
  const status = orderData.status || 'pending';
  const paidAt = status === 'paid' ? now : null;

  const cleanUserId = String(orderData.userId ?? '').trim();
  const cleanTelegramId = normalizeTelegramId(orderData.userTelegramId);
  const cleanUserName = String(orderData.userName ?? '').trim();
  const cleanCustomerEmail = String(orderData.customerEmail ?? '').trim();

  await insertOrderStmt.run(
    ordId,
    cleanUserId && cleanUserId !== 'undefined' && cleanUserId !== 'null' ? cleanUserId : null,
    cleanTelegramId || null,
    cleanUserName && cleanUserName !== 'undefined' && cleanUserName !== 'null' ? cleanUserName : 'Пользователь',
    cleanCustomerEmail && cleanCustomerEmail !== 'undefined' && cleanCustomerEmail !== 'null' ? cleanCustomerEmail : null,
    JSON.stringify(orderData.items || []),
    Number(orderData.totalAmount) || 0,
    Number(orderData.discountAmount) || 0,
    orderData.promoCode || null,
    orderData.paymentMethod || 'sbp',
    orderData.paymentId || null,
    status,
    now,
    paidAt,
    orderData.notes || null
  );

  if (status === 'paid') {
    await grantPurchasesForOrder({
      ...orderData,
      id: ordId,
      items_json: JSON.stringify(orderData.items || []),
    });
  }

  recordSystemLog('Создан заказ', `Заказ ${ordId} (${status}) на сумму ${orderData.totalAmount} ₽`);
  return { id: ordId, createdAt: now, status };
}

// Helper: Confirm payment from callback (e.g. UrlPay / SBP)
export async function confirmServerOrderPayment(paymentIdOrUuid: string) {
  try {
    const order: any = await findOrderByPaymentIdStmt.get(paymentIdOrUuid, paymentIdOrUuid);
    if (!order) {
      console.warn(`[ConfirmPayment] Order not found for payment ID: ${paymentIdOrUuid}`);
      return false;
    }

    if (order.status === 'paid') {
      return true; // Already paid
    }

    const now = new Date().toLocaleString('ru-RU');
    await updateOrderStatusStmt.run('paid', now, order.id);
    await grantPurchasesForOrder(order);

    // Начисление бонусов реферальной программы
    try {
      if (order.user_id && order.total_amount > 0) {
        const user: any = await authDatabase.prepare('SELECT id, referred_by FROM users WHERE id = ?').get(order.user_id);
        if (user && user.referred_by) {
          // Проверяем, первая ли это оплата
          const paidOrdersCount: any = authDatabase.prepare("SELECT COUNT(*) as cnt FROM orders WHERE user_id = ? AND status = 'paid'").get(order.user_id);
          

        }
      }
    } catch (e) {
      console.error('[Referral] Error granting reward:', e);
    }

    recordSystemLog('Подтверждение оплаты', `Заказ ${order.id} подтвержден по платежу ${paymentIdOrUuid}`);
    return true;
  } catch (err) {
    console.error('[ConfirmPayment] Error:', err);
    return false;
  }
}

// Helper: Get user active purchases
export async function getUserPurchasesDirect(userId: string, telegramId?: string) {
  try {
    const rows = await findUserPurchasesStmt.all(userId, telegramId || userId);
    return rows.map((r: any) => {
      let expiresAt = r.expires_at;
      const isAnnual = r.tariff_type === 'annual' || Number(r.price) > 1000;
      const tariffType = r.tariff_type || (isAnnual ? 'annual' : 'monthly');

      if (!expiresAt && r.granted_at) {
        try {
          // Parse date or calculate +30 days
          const d = new Date(r.granted_at);
          if (!isNaN(d.getTime())) {
            if (isAnnual) {
              d.setFullYear(d.getFullYear() + 1);
            } else {
              d.setDate(d.getDate() + 30);
            }
            expiresAt = d.toISOString();
          }
        } catch {}
      }

      return {
        id: r.id,
        userId: r.user_id,
        userTelegramId: r.user_telegram_id,
        orderId: r.order_id,
        courseId: r.course_id,
        courseTitle: r.course_title,
        subject: r.subject,
        school: r.school,
        year: r.year,
        price: r.price,
        grantedAt: r.granted_at,
        grantedBy: r.granted_by,
        status: r.status,
        expiresAt: expiresAt,
        tariffType: tariffType,
      };
    });
  } catch (err) {
    console.error('[GetPurchases] Error:', err);
    return [];
  }
}

// ============================================
// ROUTE HANDLERS: ORDERS
// ============================================

// GET /api/auth/orders/all - Все заказы из базы данных
router.get('/orders/all', async (_req: Request, res: Response) => {
  try {
    const rows = await getAllOrdersStmt.all();
    const orders = rows.map((r: any) => {
      let items = [];
      try {
        items = JSON.parse(r.items_json || '[]');
      } catch {
        items = [];
      }
      return {
        id: r.id,
        userId: r.user_id,
        userTelegramId: r.user_telegram_id,
        userName: r.user_name,
        customerEmail: r.customer_email,
        items,
        totalAmount: r.total_amount,
        discountAmount: r.discount_amount,
        promoCode: r.promo_code,
        paymentMethod: r.payment_method,
        paymentId: r.payment_id,
        status: r.status,
        createdAt: r.created_at,
        paidAt: r.paid_at,
        notes: r.notes,
      };
    });

    return res.json({ success: true, orders });
  } catch (err: any) {
    console.error('[Orders] Error fetching orders:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/orders/create - Создание заказа
router.post('/orders/create', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData || typeof orderData.totalAmount !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid order payload' });
    }

    const created = await recordServerOrder(orderData);
    return res.json({ success: true, order: created });
  } catch (err: any) {
    console.error('[Orders] Error creating order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/auth/orders/:id/status - Смена статуса заказа (paid, pending, cancelled)
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!['paid', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const existing: any = await findOrderByIdStmt.get(orderId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const now = new Date().toLocaleString('ru-RU');
    const paidAt = status === 'paid' ? now : null;
    await updateOrderStatusStmt.run(status, paidAt, orderId);

    if (status === 'paid') {
      await grantPurchasesForOrder(existing);
    } else if (status === 'cancelled') {
      await revokePurchasesByOrderIdStmt.run(orderId);
      if (existing.user_id || existing.user_telegram_id) {
        await updatePurchasedCountStmt.run(existing.user_id, existing.user_telegram_id);
      }
    }

    recordSystemLog('Смена статуса заказа', `Заказ ${orderId} переведен в статус "${status}"`);
    return res.json({ success: true, status });
  } catch (err: any) {
    console.error('[Orders] Error updating status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/auth/orders/:id - Удаление заказа
router.delete('/orders/:id', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const existing: any = await findOrderByIdStmt.get(orderId);
    await deleteOrderStmt.run(orderId);
    await revokePurchasesByOrderIdStmt.run(orderId);

    if (existing && (existing.user_id || existing.user_telegram_id)) {
      await updatePurchasedCountStmt.run(existing.user_id, existing.user_telegram_id);
    }

    recordSystemLog('Удаление заказа', `Удален заказ ${orderId}`);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Orders] Error deleting order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// ROUTE HANDLERS: USER PURCHASES & ACCESS
// ============================================

// GET /api/auth/user/purchases - Получить курсы пользователя
router.get('/user/purchases', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || '';
    const tgId = (req.query.telegramId as string) || (req.query.tgId as string) || '';

    if (!userId && !tgId) {
      return res.json({ success: true, purchases: [] });
    }

    const purchases = await getUserPurchasesDirect(userId, tgId);
    return res.json({ success: true, purchases });
  } catch (err: any) {
    console.error('[Purchases] Error fetching user purchases:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const normalizeUserId = (userId?: string | null, userTelegramId?: string | number | null) => {
  const cleanUserId = String(userId ?? '').trim();
  if (cleanUserId && cleanUserId !== 'null' && cleanUserId !== 'undefined') return cleanUserId;

  const tgId = normalizeTelegramId(userTelegramId);
  return tgId ? `usr-${tgId}` : '';
};

// POST /api/auth/admin/users/grant-course - Ручная выдача доступа
router.post('/admin/users/grant-course', async (req: Request, res: Response) => {
  try {
    const { userId, userTelegramId, courseId, courseTitle, subject, school, year, price } = req.body;
    const normalizedTelegramId = normalizeTelegramId(userTelegramId);
    const normalizedUserId = normalizeUserId(userId, normalizedTelegramId);

    if (!normalizedUserId && !normalizedTelegramId) {
      return res.status(400).json({ success: false, error: 'User identifier required' });
    }

    const pId = `pur-admin-${Date.now()}`;
    const now = new Date().toLocaleString('ru-RU');
    const isAnnual = Number(price) > 1000;
    const expiryDate = new Date();
    if (isAnnual) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    const expiresAt = expiryDate.toISOString();
    const tariffType = isAnnual ? 'annual' : 'monthly';
    const finalUserId = normalizedUserId || `usr-${normalizedTelegramId}`;
    const finalTelegramId = normalizedTelegramId || null;

    await insertUserPurchaseStmt.run(
      pId,
      finalUserId,
      finalTelegramId,
      'admin_manual',
      courseId || `crs-${Date.now()}`,
      courseTitle || 'Курс подготовки',
      subject || 'Предмет',
      school || 'Онлайн-школа',
      year || '2027',
      Number(price) || 0,
      now,
      'admin',
      expiresAt,
      tariffType
    );

    await updatePurchasedCountStmt.run(finalUserId, finalTelegramId);
    const userLabel = finalTelegramId ? `@${finalTelegramId}` : (finalUserId || 'неизвестный пользователь');
    recordSystemLog('Ручная выдача доступа', `Выдан курс "${courseTitle}" пользователю ${userLabel}`);

    return res.json({ success: true, message: 'Access granted' });
  } catch (err: any) {
    console.error('[Purchases] Error granting course:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/admin/users/revoke-course - Забрать доступ
router.post('/admin/users/revoke-course', async (req: Request, res: Response) => {
  try {
    const { purchaseId, userId, userTelegramId } = req.body;
    if (!purchaseId) {
      return res.status(400).json({ success: false, error: 'Purchase ID required' });
    }

    await revokePurchaseStmt.run(purchaseId);
    if (userId || userTelegramId) {
      await updatePurchasedCountStmt.run(userId, userTelegramId);
    }

    recordSystemLog('Отзыв доступа', `Отозван доступ к курсу (id: ${purchaseId})`);
    return res.json({ success: true, message: 'Access revoked' });
  } catch (err: any) {
    console.error('[Purchases] Error revoking course:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/user/remove-course - Удаление курса пользователем из личного кабинета
router.post('/user/remove-course', async (req: Request, res: Response) => {
  try {
    const { purchaseId, userId, userTelegramId } = req.body;
    if (!purchaseId) {
      return res.status(400).json({ success: false, error: 'Purchase ID required' });
    }

    await revokePurchaseStmt.run(purchaseId);
    if (userId || userTelegramId) {
      await updatePurchasedCountStmt.run(userId, userTelegramId);
    }

    recordSystemLog('Удаление курса пользователем', `Пользователь удалил курс (id: ${purchaseId})`);
    return res.json({ success: true, message: 'Course removed' });
  } catch (err: any) {
    console.error('[Purchases] Error removing user course:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// ROUTE HANDLERS: PROMOCODES
// ============================================

// GET /api/auth/promocodes/all
router.get('/promocodes/all', async (_req: Request, res: Response) => {
  try {
    const rows = await getAllPromocodesStmt.all();
    const promocodes = rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      discountPercent: r.discount_percent,
      maxUses: r.max_uses,
      usedCount: r.used_count,
      active: Boolean(r.active),
      createdAt: r.created_at,
    }));
    return res.json({ success: true, promocodes });
  } catch (err: any) {
    console.error('[Promocodes] Error fetching list:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/promocodes/create
router.post('/promocodes/create', async (req: Request, res: Response) => {
  try {
    const { code, discountPercent, maxUses } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      return res.status(400).json({ success: false, error: 'Promocode text is required' });
    }

    const existing = await findPromocodeByCodeStmt.get(cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Промокод с таким названием уже существует' });
    }

    const promoId = `promo-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    await insertPromocodeStmt.run(promoId, cleanCode, Number(discountPercent) || 15, Number(maxUses) || 100, today);

    recordSystemLog('Создан промокод', `Создан промокод ${cleanCode} (-${discountPercent}%)`);
    return res.json({ success: true, promo: { id: promoId, code: cleanCode, discountPercent, maxUses, active: true } });
  } catch (err: any) {
    console.error('[Promocodes] Error creating promocode:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/auth/promocodes/:id/toggle
router.patch('/promocodes/:id/toggle', async (req: Request, res: Response) => {
  try {
    const promoId = req.params.id;
    const result = await togglePromocodeActiveStmt.run(promoId);
    return res.json({ success: true, changed: Number((result as any)?.changes ?? 0) });
  } catch (err: any) {
    console.error('[Promocodes] Error toggling promocode:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/auth/promocodes/:id
router.delete('/promocodes/:id', async (req: Request, res: Response) => {
  try {
    const promoId = req.params.id;
    const result = await deletePromocodeStmt.run(promoId);
    return res.json({ success: true, deleted: Number((result as any)?.changes ?? 0) });
  } catch (err: any) {
    console.error('[Promocodes] Error deleting promocode:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/promocodes/validate
router.post('/promocodes/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      return res.json({ valid: false, discountPercent: 0, message: 'Введите код промокода' });
    }

    const promo: any = await findPromocodeByCodeStmt.get(cleanCode);
    if (!promo) {
      return res.json({ valid: false, discountPercent: 0, message: 'Промокод не найден' });
    }
    if (!promo.active) {
      return res.json({ valid: false, discountPercent: 0, message: 'Промокод временно неактивен' });
    }
    if (promo.used_count >= promo.max_uses) {
      return res.json({ valid: false, discountPercent: 0, message: 'Лимит использований промокода исчерпан' });
    }

    return res.json({
      valid: true,
      discountPercent: promo.discount_percent,
      message: `Промокод ${cleanCode} применён (-${promo.discount_percent}%)`,
    });
  } catch (err: any) {
    console.error('[Promocodes] Error validating:', err);
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// ============================================
// ROUTE HANDLERS: LOGS & STATS
// ============================================

// GET /api/auth/logs/all
router.get('/logs/all', async (_req: Request, res: Response) => {
  try {
    const rows = await getAllLogsStmt.all();
    const logs = rows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      action: r.action,
      details: r.details,
      adminTelegramId: r.admin_telegram_id,
    }));
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logs/add
router.post('/logs/add', async (req: Request, res: Response) => {
  try {
    const { action, details, adminTelegramId } = req.body;
    recordSystemLog(action || 'Действие', details || '', adminTelegramId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/auth/logs/clear
router.delete('/logs/clear', async (_req: Request, res: Response) => {
  try {
    await clearLogsStmt.run();
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const row: any = await authDatabase.prepare('SELECT value FROM site_settings WHERE key = ?').get('main');
    if (row && row.value) {
      return res.json({ success: true, settings: JSON.parse(row.value) });
    }
    return res.json({
      success: true,
      settings: {
        siteName: 'EGE NETWORK',
        telegramBotLink: 'https://t.me/EgeNetwork11_bot',
        supportTgLink: 'https://t.me/EgeNetwork11_bot',
        maintenanceMode: false,
        seoTitle: 'Сливы курсов ЕГЭ и ОГЭ 2027 / 2026',
        discountBannerText: 'До 15 августа: Покупай весь новый курс 2027 — и получай полный курс прошлого года в подарок!',
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings
router.post('/settings', async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    if (!settings) {
      return res.status(400).json({ success: false, error: 'No settings provided' });
    }
    await authDatabase.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value').run('main', JSON.stringify(settings));
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/support
router.get('/support', async (_req: Request, res: Response) => {
  try {
    const rows = await authDatabase.prepare('SELECT * FROM support_messages ORDER BY created_at ASC, id ASC').all() as any[];
    const messages = rows.map(r => ({
      id: r.id,
      userTelegramId: r.user_telegram_id,
      userName: r.user_name,
      sender: r.sender,
      text: r.text,
      createdAt: r.created_at,
      isRead: Boolean(r.is_read)
    }));
    return res.json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/support
router.post('/support', async (req: Request, res: Response) => {
  try {
    const msg = req.body;
    if (!msg || !msg.id) {
      return res.status(400).json({ success: false, error: 'Invalid support message data' });
    }
    await authDatabase.prepare(`
      INSERT OR REPLACE INTO support_messages (id, user_telegram_id, user_name, sender, text, created_at, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      msg.id,
      msg.userTelegramId || 'guest',
      msg.userName || 'Гость',
      msg.sender || 'user',
      msg.text || '',
      msg.createdAt || new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      msg.isRead ? 1 : 0
    );
    return res.json({ success: true, message: msg });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
export { authenticateToken };
export type { UserDocument };
