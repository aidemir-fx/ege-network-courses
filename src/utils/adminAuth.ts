import { AdminStaff, User } from '../types';

const INITIAL_STAFF: AdminStaff[] = [
  {
    id: 'admin-1',
    name: 'Главный Администратор',
    telegramId: '7948060541',
    role: 'admin',
    addedAt: '2026-08-03',
    addedBy: 'Система',
  },
  {
    id: 'admin-2',
    name: 'Администратор',
    telegramId: '6897919124',
    role: 'admin',
    addedAt: '2026-08-03',
    addedBy: 'Система',
  },
];

const STAFF_STORAGE_KEY = 'ege_network_admin_staff';
const CURRENT_USER_STORAGE_KEY = 'ege_network_current_user';

let serverAdminIds: string[] = ['7948060541', '6897919124'];

// Fetch admin IDs from server .env configuration
export async function syncAdminsWithServer(): Promise<string[]> {
  try {
    const res = await fetch('/api/auth/admins');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.adminTelegramIds)) {
        serverAdminIds = data.adminTelegramIds;
        // Merge into stored staff list
        const currentStaff = getAdminStaffList();
        let changed = false;
        
        for (const tgId of serverAdminIds) {
          if (!currentStaff.some((s) => s.telegramId === tgId)) {
            currentStaff.push({
              id: `admin-env-${tgId}`,
              name: tgId === '7948060541' ? 'Главный Администратор' : `Администратор (${tgId})`,
              telegramId: tgId,
              role: 'admin',
              addedAt: new Date().toISOString().split('T')[0],
              addedBy: '.env config',
            });
            changed = true;
          }
        }
        
        if (changed) {
          saveAdminStaffList(currentStaff);
        }
        return serverAdminIds;
      }
    }
  } catch (err) {
    console.warn('Failed to sync admin IDs with backend:', err);
  }
  return serverAdminIds;
}

// Auto-trigger sync on load
if (typeof window !== 'undefined') {
  syncAdminsWithServer().catch(() => {});
}

export function getAdminStaffList(): AdminStaff[] {
  try {
    const data = localStorage.getItem(STAFF_STORAGE_KEY);
    let parsed = data ? JSON.parse(data) : [...INITIAL_STAFF];
    
    // Ensure all serverAdminIds are included
    for (const tgId of serverAdminIds) {
      if (!parsed.some((s: AdminStaff) => s.telegramId === tgId)) {
        parsed.push({
          id: `admin-env-${tgId}`,
          name: tgId === '7948060541' ? 'Главный Администратор' : `Администратор (${tgId})`,
          telegramId: tgId,
          role: 'admin',
          addedAt: new Date().toISOString().split('T')[0],
          addedBy: '.env config',
        });
      }
    }

    // Ensure 7948060541 is always present as main admin
    if (!parsed.some((s: AdminStaff) => s.telegramId === '7948060541')) {
      parsed.unshift(INITIAL_STAFF[0]);
    }

    return parsed;
  } catch (e) {
    return INITIAL_STAFF;
  }
}

export function saveAdminStaffList(list: AdminStaff[]): void {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save admin staff list', e);
  }
}

export function checkAdminByTelegramId(rawTgInput: string): AdminStaff | null {
  if (!rawTgInput) return null;
  const cleaned = rawTgInput.trim().replace(/^@/, '');
  
  // 1. Direct check in server environment admin IDs
  if (serverAdminIds.includes(cleaned) || serverAdminIds.includes(rawTgInput.trim())) {
    return {
      id: `admin-env-${cleaned}`,
      name: cleaned === '7948060541' ? 'Главный Администратор' : `Администратор (@${cleaned})`,
      telegramId: cleaned,
      role: 'admin',
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: '.env config',
    };
  }

  const staffList = getAdminStaffList();
  
  // 2. Match exact ID or match username if stored in localStorage
  const match = staffList.find(
    (s) => s.telegramId === cleaned || s.telegramId === rawTgInput.trim()
  );

  return match || null;
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}
