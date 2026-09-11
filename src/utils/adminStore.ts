import { 
  User, 
  AdminCourse, 
  Order, 
  Promocode, 
  SupportMessage, 
  Broadcast, 
  SiteSettings, 
  SystemLog,
  CartItem 
} from '../types';

// STORAGE KEYS
const USERS_KEY = 'ege_network_db_users';
const COURSES_KEY = 'ege_network_db_courses';
const ORDERS_KEY = 'ege_network_db_orders';
const PROMOCODES_KEY = 'ege_network_db_promocodes';
const SUPPORT_KEY = 'ege_network_db_support';
const BROADCASTS_KEY = 'ege_network_db_broadcasts';
const SETTINGS_KEY = 'ege_network_db_settings';
const LOGS_KEY = 'ege_network_db_logs';

// DEFAULT INITIAL COURSES
const DEFAULT_COURSES: AdminCourse[] = [
  {
    id: 'crs-1',
    title: 'Годовой курс по Профильной Математике (100 баллов)',
    subject: 'Профиль (Математика)',
    school: '100балльный репетитор',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-01',
  },
  {
    id: 'crs-2',
    title: 'Годовой курс по Русскому Языку (Оксана Кудлай)',
    subject: 'Русский Язык',
    school: '100балльный репетитор',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-01',
  },
  {
    id: 'crs-3',
    title: 'Полный курс по Обществознанию',
    subject: 'Обществознание',
    school: 'ЕГЭЛенд',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4200,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-01',
  },
  {
    id: 'crs-4',
    title: 'Информатика с Нуля до 100 баллов',
    subject: 'Информатика',
    school: 'Умскул',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-02',
  },
  {
    id: 'crs-5',
    title: 'ОГЭ 2027 по Русский языку',
    subject: 'Русский Язык',
    school: 'Умскул',
    exam: 'OGE',
    year: '2027',
    price: 2490,
    originalPrice: 3500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-02',
  },
  {
    id: 'crs-6',
    title: 'ОГЭ 2027 по Математике',
    subject: 'База (Математика)',
    school: '100балльный репетитор',
    exam: 'OGE',
    year: '2027',
    price: 2490,
    originalPrice: 3500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-02',
  },
  {
    id: 'crs-7',
    title: 'Полный курс по Психологии',
    subject: 'Психология',
    school: 'Умскул',
    exam: 'EGE',
    year: '2027',
    price: 3490,
    originalPrice: 4500,
    isHidden: false,
    telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
    createdAt: '2026-08-03',
  },
];

// DEFAULT SETTINGS
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'EGE NETWORK',
  telegramBotLink: 'https://t.me/EgeNetwork11_bot',
  supportTgLink: 'https://t.me/EgeNetwork11_bot',
  maintenanceMode: false,
  seoTitle: 'Сливы курсов ЕГЭ и ОГЭ 2027 / 2026',
  discountBannerText: '',
};

// --- USERS ---
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

// Загрузка реальных пользователей с сервера
export async function fetchServerUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/auth/users/all');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        saveStoredUsers(data.users);
        return data.users;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch users from server:', err);
  }
  return getStoredUsers();
}

export function registerOrUpdateUser(user: User): void {
  const users = getStoredUsers();
  // Search by telegramId OR email (for email auth)
  const index = users.findIndex(
    (u) => (user.telegramId && u.telegramId === user.telegramId) || 
           (user.email && u.email === user.email)
  );
  const now = new Date().toLocaleString('ru-RU');
  
  if (index >= 0) {
    users[index] = {
      ...users[index],
      ...user,
      lastLogin: now,
    };
  } else {
    users.push({
      ...user,
      status: user.status || 'active',
      registeredAt: user.registeredAt || new Date().toISOString().split('T')[0],
      lastLogin: now,
    });
  }
  saveStoredUsers(users);

  const refCode = localStorage.getItem('referral_code') || undefined;

  // Синхронизируем с сервером в фоне
  fetch('/api/auth/users/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, ref: refCode }),
  }).catch((err) => console.warn('Failed to sync user with server:', err));
}

// Helper: Find user by email for login
export function findUserByEmail(email: string): User | undefined {
  const users = getStoredUsers();
  return users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

// --- COURSES ---
export interface ExternalCourseItem {
  id: number;
  title: string;
  annotation?: string;
  description?: string;
  status: string;
  cover_file_id?: number;
  modules: Array<{
    id: number;
    course_id: number;
    title: string;
    annotation?: string;
    description?: string;
    position: number;
    contents: Array<{
      id: number;
      module_id: number;
      position: number;
      content_type: 'VIDEO' | 'FILE' | 'LINK' | string;
      video?: any;
      file?: any;
      file_type?: string;
      link?: { url: string };
    }>;
  }>;
}

export async function fetchExternalCourses(apiKey = '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237'): Promise<ExternalCourseItem[]> {
  try {
    const res = await fetch(`/api/external/courses?apiKey=${encodeURIComponent(apiKey)}`);
    const data = await res.json();
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data : (data.data.courses || data.data.items || []);
    }
  } catch (e) {
    console.warn('Failed to fetch external courses:', e);
  }
  return [];
}

export function getStoredCourses(): AdminCourse[] {
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    if (!raw) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(DEFAULT_COURSES));
      return DEFAULT_COURSES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COURSES;
  }
}

export function saveStoredCourses(courses: AdminCourse[]): void {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses', e);
  }
}

// --- ORDERS ---
export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
}

// Загрузка реальных заказов с SQLite сервера
export async function fetchServerOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/auth/orders/all');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        saveStoredOrders(data.orders);
        return data.orders;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch orders from server:', err);
  }
  return getStoredOrders();
}

const normalizeTelegramId = (value?: string | null): string => {
  if (!value) return '';
  const raw = String(value).trim().replace(/^@/, '');
  if (!raw || raw === 'null' || raw === 'undefined') return '';
  return raw.replace(/^tg_/, '').replace(/@telegram\.user$/i, '');
};

export function createNewOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getStoredOrders();
  const ordId = `#${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toLocaleString('ru-RU');
  const normalizedUserTelegramId = normalizeTelegramId(orderData.userTelegramId);
  const normalizedUserName = String(orderData.userName ?? '').trim();

  const newOrder: Order = {
    ...orderData,
    userTelegramId: normalizedUserTelegramId,
    userName: normalizedUserName && normalizedUserName !== 'undefined' && normalizedUserName !== 'null' ? normalizedUserName : 'Пользователь',
    id: ordId,
    createdAt: now,
  };
  orders.unshift(newOrder);
  saveStoredOrders(orders);
  
  // Create dynamic system log
  addSystemLog('Создан новый заказ', `Заказ ${newOrder.id} от @${newOrder.userTelegramId} на сумму ${newOrder.totalAmount} ₽`);

  // Синхронизируем заказ с сервером (запись в SQLite)
  fetch('/api/auth/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: ordId,
      userId: orderData.userId,
      userTelegramId: orderData.userTelegramId,
      userName: orderData.userName,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      discountAmount: orderData.discountAmount,
      promoCode: orderData.promoCode,
      status: orderData.status || 'pending',
    }),
  }).catch((err) => console.warn('Failed to send order to server:', err));

  return newOrder;
}

export async function updateOrderStatusServer(orderId: string, status: 'paid' | 'pending' | 'cancelled'): Promise<boolean> {
  const orders = getStoredOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
  saveStoredOrders(orders);

  try {
    const res = await fetch(`/api/auth/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to update order status on server:', e);
    return false;
  }
}

export async function deleteOrderServer(orderId: string): Promise<boolean> {
  const orders = getStoredOrders().filter((o) => o.id !== orderId);
  saveStoredOrders(orders);

  try {
    const res = await fetch(`/api/auth/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to delete order on server:', e);
    return false;
  }
}

// --- USER PURCHASES & ACCESS (SERVER SYNCED) ---
export async function fetchUserPurchases(userId?: string, telegramId?: string): Promise<any[]> {
  try {
    const query = new URLSearchParams();
    if (userId) query.set('userId', userId);
    if (telegramId) query.set('telegramId', telegramId);

    const res = await fetch(`/api/auth/user/purchases?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const purchases = data?.purchases;

      if (Array.isArray(purchases)) {
        return purchases;
      }

      if (purchases && typeof purchases === 'object') {
        if (Array.isArray((purchases as any).items)) {
          return (purchases as any).items;
        }

        const values = Object.values(purchases as Record<string, unknown>);
        if (Array.isArray(values) && values.length > 0 && values.every((v) => typeof v === 'object' || typeof v === 'string')) {
          return values as any[];
        }
      }
    }
  } catch (e) {
    console.warn('Failed to fetch user purchases:', e);
  }
  return [];
}

export async function grantUserAccessServer(data: {
  userId?: string;
  userTelegramId?: string;
  courseId: string;
  courseTitle: string;
  subject?: string;
  school?: string;
  year?: string;
  price?: number;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/admin/users/grant-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      console.warn('Grant course failed:', payload?.error || res.statusText);
      return false;
    }

    const payload = await res.json().catch(() => ({ success: true }));
    return payload?.success !== false;
  } catch (e) {
    console.warn('Failed to grant access on server:', e);
    return false;
  }
}

export async function revokeUserAccessServer(data: {
  purchaseId: string;
  userId?: string;
  userTelegramId?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/admin/users/revoke-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to revoke access on server:', e);
    return false;
  }
}

export async function removeUserCourseServer(data: {
  purchaseId: string;
  userId?: string;
  userTelegramId?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/user/remove-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to remove user course on server:', e);
    return false;
  }
}

// --- PROMOCODES ---
export function getStoredPromocodes(): Promocode[] {
  try {
    const raw = localStorage.getItem(PROMOCODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredPromocodes(promocodes: Promocode[]): void {
  try {
    localStorage.setItem(PROMOCODES_KEY, JSON.stringify(promocodes));
  } catch (e) {
    console.error('Failed to save promocodes', e);
  }
}

// Загрузка промокодов с сервера
export async function fetchServerPromocodes(): Promise<Promocode[]> {
  try {
    const res = await fetch('/api/auth/promocodes/all');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.promocodes)) {
        saveStoredPromocodes(data.promocodes);
        return data.promocodes;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch promocodes from server:', err);
  }
  return getStoredPromocodes();
}

export async function createPromocodeServer(code: string, discountPercent: number, maxUses: number): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/promocodes/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, discountPercent, maxUses }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      console.warn('Promocode create failed:', payload?.error || res.statusText);
      return false;
    }

    const payload = await res.json().catch(() => ({ success: true }));
    if (payload?.success === false) return false;

    const refreshed = await fetchServerPromocodes();
    saveStoredPromocodes(refreshed);
    return true;
  } catch (e) {
    console.warn('Failed to create promocode on server:', e);
    return false;
  }
}

export async function togglePromocodeServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/auth/promocodes/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      console.warn('Promocode toggle failed:', payload?.error || res.statusText);
      return false;
    }

    const payload = await res.json().catch(() => ({ success: true }));
    if (payload?.success === false) return false;

    const refreshed = await fetchServerPromocodes();
    saveStoredPromocodes(refreshed);
    return true;
  } catch (e) {
    console.warn('Failed to toggle promocode on server:', e);
    return false;
  }
}

export async function deletePromocodeServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/auth/promocodes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      console.warn('Promocode delete failed:', payload?.error || res.statusText);
      return false;
    }

    const payload = await res.json().catch(() => ({ success: true }));
    if (payload?.success === false) return false;

    const current = getStoredPromocodes().filter((p) => p.id !== id);
    saveStoredPromocodes(current);

    const refreshed = await fetchServerPromocodes();
    saveStoredPromocodes(refreshed);
    return true;
  } catch (e) {
    console.warn('Failed to delete promocode on server:', e);
    return false;
  }
}

export function validateAndUsePromocode(code: string): { valid: boolean; discountPercent: number; message: string } {
  const clean = code.trim().toUpperCase();
  const list = getStoredPromocodes();
  const promo = list.find((p) => p.code === clean);

  if (!promo) {
    return { valid: false, discountPercent: 0, message: 'Промокод не найден' };
  }
  if (!promo.active) {
    return { valid: false, discountPercent: 0, message: 'Промокод неактивен' };
  }
  if (promo.usedCount >= promo.maxUses) {
    return { valid: false, discountPercent: 0, message: 'Лимит использований промокода исчерпан' };
  }

  // Increment usage count locally
  promo.usedCount += 1;
  saveStoredPromocodes(list);

  return { 
    valid: true, 
    discountPercent: promo.discountPercent, 
    message: `Промокод ${clean} применён (-${promo.discountPercent}%)` 
  };
}

// --- SUPPORT MESSAGES ---
export function getStoredSupportMessages(): SupportMessage[] {
  try {
    const raw = localStorage.getItem(SUPPORT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredSupportMessages(msgs: SupportMessage[]): void {
  try {
    localStorage.setItem(SUPPORT_KEY, JSON.stringify(msgs));
  } catch (e) {
    console.error('Failed to save support messages', e);
  }
}

export function sendSupportMessage(msgData: Omit<SupportMessage, 'id' | 'createdAt'>): SupportMessage {
  const msgs = getStoredSupportMessages();
  const newMsg: SupportMessage = {
    ...msgData,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  };
  msgs.push(newMsg);
  saveStoredSupportMessages(msgs);
  fetch('/api/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMsg),
  }).catch(() => {});
  return newMsg;
}

export async function fetchServerSupportMessages(): Promise<SupportMessage[]> {
  try {
    const res = await fetch('/api/support');
    const data = await res.json();
    if (data.success && data.messages) {
      localStorage.setItem(SUPPORT_KEY, JSON.stringify(data.messages));
      return data.messages;
    }
  } catch (e) {
    console.error('Failed to fetch server support messages', e);
  }
  return getStoredSupportMessages();
}

// --- BROADCASTS ---
export function getStoredBroadcasts(): Broadcast[] {
  try {
    const raw = localStorage.getItem(BROADCASTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredBroadcasts(broadcasts: Broadcast[]): void {
  try {
    localStorage.setItem(BROADCASTS_KEY, JSON.stringify(broadcasts));
  } catch (e) {
    console.error('Failed to save broadcasts', e);
  }
}

export async function fetchServerBroadcasts(): Promise<Broadcast[]> {
  try {
    const res = await fetch('/api/broadcasts');
    const data = await res.json();
    if (data.success && data.broadcasts) {
      localStorage.setItem(BROADCASTS_KEY, JSON.stringify(data.broadcasts));
      return data.broadcasts;
    }
  } catch (e) {
    console.error('Failed to fetch server broadcasts', e);
  }
  return getStoredBroadcasts();
}

export function sendBroadcast(bc: Broadcast): Broadcast {
  const broadcasts = getStoredBroadcasts();
  const updated = [bc, ...broadcasts];
  saveStoredBroadcasts(updated);
  fetch('/api/broadcasts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bc),
  }).catch(() => {});
  return bc;
}

export async function deleteBroadcastServer(id: string): Promise<boolean> {
  try {
    const broadcasts = getStoredBroadcasts().filter((b) => b.id !== id);
    saveStoredBroadcasts(broadcasts);
    const res = await fetch(`/api/broadcasts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to delete broadcast on server:', e);
    return false;
  }
}

export async function clearAllBroadcastsServer(): Promise<boolean> {
  try {
    saveStoredBroadcasts([]);
    const res = await fetch('/api/broadcasts/clear-all', {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to clear broadcasts on server:', e);
    return false;
  }
}

// --- SETTINGS ---
export function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }

    const storedSettings = JSON.parse(raw) as SiteSettings;
    const normalizedSettings: SiteSettings = {
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    };

    const botLink = normalizedSettings.telegramBotLink?.trim();
    const isLegacyManagerLink = !botLink || /@?egemanager/i.test(botLink);

    if (isLegacyManagerLink || (normalizedSettings.discountBannerText && normalizedSettings.discountBannerText.includes('До 15 августа'))) {
      if (isLegacyManagerLink) {
        normalizedSettings.telegramBotLink = DEFAULT_SETTINGS.telegramBotLink;
      }
      if (normalizedSettings.discountBannerText && normalizedSettings.discountBannerText.includes('До 15 августа')) {
        normalizedSettings.discountBannerText = '';
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizedSettings));
    }

    return normalizedSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function fetchServerSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      const normalized = { ...DEFAULT_SETTINGS, ...data.settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (e) {
    console.error('Failed to fetch server settings', e);
  }
  return getStoredSettings();
}

export async function saveServerSettings(settings: SiteSettings): Promise<void> {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (e) {
    console.error('Failed to save server settings', e);
  }
}

export function saveStoredSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    saveServerSettings(settings).catch(() => {});
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// --- SYSTEM LOGS ---
export function getStoredLogs(): SystemLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchServerLogs(): Promise<SystemLog[]> {
  try {
    const res = await fetch('/api/auth/logs/all');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
        return data.logs;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch logs from server:', e);
  }
  return getStoredLogs();
}

export function addSystemLog(action: string, details: string, adminTelegramId?: string): void {
  try {
    const logs = getStoredLogs();
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('ru-RU'),
      action,
      details,
      adminTelegramId,
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

    // Синхронизация с сервером
    fetch('/api/auth/logs/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details, adminTelegramId }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to add log', e);
  }
}

export function clearSystemLogs(): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    fetch('/api/auth/logs/clear', { method: 'DELETE' }).catch(() => {});
  } catch (e) {
    console.error('Failed to clear logs', e);
  }
}
