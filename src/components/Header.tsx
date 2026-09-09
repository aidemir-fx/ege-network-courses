import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, LogOut, User as UserIcon, Bell, LayoutDashboard, ShieldCheck, Sun, Moon } from 'lucide-react';
import { PageType, User, Broadcast } from '../types';
import { checkAdminByTelegramId } from '../utils/adminAuth';
import { getStoredBroadcasts } from '../utils/adminStore';
import logoImage from '../assets/images/logo.jpg';
import nightLogoImage from '../assets/images/night-logo.jpeg';

interface HeaderProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuthModal: () => void;
  onOpenHowItWorks?: () => void;
  currentUser: User | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  cartCount,
  onOpenCart,
  onOpenAuthModal,
  onOpenHowItWorks,
  currentUser,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const list = getStoredBroadcasts();
    setBroadcasts(list);
    const lastReadId = localStorage.getItem('ege_last_read_broadcast');
    if (list.length > 0 && (!lastReadId || list[0].id !== lastReadId)) {
      setHasUnread(true);
    }
  }, []);

  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setHasUnread(false);
    const list = getStoredBroadcasts();
    if (list.length > 0) {
      localStorage.setItem('ege_last_read_broadcast', list[0].id);
    }
  };

  const handleNav = (page: PageType) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardClick = () => {
    if (!currentUser) {
      onOpenAuthModal();
    } else {
      handleNav('dashboard');
    }
  };

  const isAdmin = Boolean(
    (currentUser?.role && ['admin', 'manager', 'moderator', 'support'].includes(currentUser.role)) ||
    (currentUser?.telegramId && checkAdminByTelegramId(currentUser.telegramId))
  );

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#0B0F19]/95 border-b border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-22 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink-0">
          <button
            onClick={() => handleNav('catalog')}
            className="group flex items-center gap-2 text-left focus:outline-none cursor-pointer shrink-0"
          >
            <img
              src={theme === 'dark' ? nightLogoImage : logoImage}
              alt="EGE NETWORK Logo"
              className="h-12 sm:h-16 md:h-18 w-auto max-w-[140px] xs:max-w-[170px] sm:max-w-[240px] md:max-w-[300px] rounded-xl sm:rounded-2xl object-contain bg-white dark:bg-slate-800 p-0.5 sm:p-1 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700 transition-transform group-hover:scale-105 shrink-0"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4 bg-slate-100/60 dark:bg-slate-800/60 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => handleNav('catalog')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                activePage === 'catalog'
                  ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] dark:text-[#FF8C5A]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>Главная</span>
              {activePage === 'catalog' && (
                <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full mt-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNav('ege')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                activePage === 'ege'
                  ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] dark:text-[#FF8C5A]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              ЕГЭ
            </button>

            <button
              onClick={handleDashboardClick}
              className={`px-4 py-1.5 rounded-full text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === 'dashboard'
                  ? 'bg-[#22c55e] text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Личный кабинет</span>
            </button>

            <button
              onClick={() => {
                if (onOpenHowItWorks) {
                  onOpenHowItWorks();
                } else {
                  handleNav('catalog');
                  setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 80);
                }
              }}
              className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
            >
              Как это работает
            </button>
          </nav>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
          
          {/* Admin Panel Button */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              id="header-admin-btn"
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-black text-[11px] sm:text-xs transition-all cursor-pointer ${
                activePage === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#151C2C] text-purple-300 hover:bg-purple-950 hover:text-white border border-purple-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="hidden sm:inline">Админка</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-pulse" />
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            id="header-cart-btn"
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all border cursor-pointer shrink-0 ${
              cartCount > 0
                ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-[#FF6B35]/25 animate-pulse-subtle hover:bg-[#E65A22]'
                : 'bg-[#FFF1E8] hover:bg-[#FFEDD8] text-[#FF6B35] border-[#FFD3BA]'
            }`}
            aria-label="Открыть корзину"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Корзина</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-black ${
              cartCount > 0 ? 'bg-white text-[#FF6B35]' : 'bg-[#FF6B35] text-white'
            }`}>
              {cartCount}
            </span>
          </button>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              id="header-theme-toggle"
              className="relative p-1.5 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0"
              title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform active:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 transition-transform active:-rotate-45" />
              )}
            </button>
          )}

          {/* Notifications / Broadcasts Bell Button */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="relative p-1.5 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0"
              title="Уведомления и рассылки"
              aria-label="Уведомления и рассылки"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <div className="fixed inset-x-4 top-20 max-w-sm mx-auto sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 sm:max-w-none bg-white dark:bg-[#131B2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-fadeIn text-slate-900 dark:text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF6B35]" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Уведомления и рассылки</h4>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {broadcasts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                      Пока нет новых уведомлений
                    </div>
                  ) : (
                    broadcasts.map((bc) => (
                      <div
                        key={bc.id}
                        className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/70 space-y-1 hover:border-orange-200 dark:hover:border-orange-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">{bc.title}</h5>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{bc.sentAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{bc.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Info or Login Button */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 pl-3 rounded-full border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
              <button
                onClick={handleDashboardClick}
                className="flex items-center gap-1.5 hover:text-[#22c55e] transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>{currentUser.telegramId ? `@${currentUser.telegramId}` : currentUser.name || currentUser.email}</span>
              </button>
              <button
                onClick={onLogout}
                title="Выйти"
                className="p-1 rounded-full bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              id="header-auth-btn"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0"
            >
              <UserIcon className="w-3.5 h-3.5 text-white dark:text-slate-900" />
              <span className="hidden xs:inline">Войти</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
