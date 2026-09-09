import React from 'react';
import { Home, BookOpen, ShoppingBag, User as UserIcon, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { PageType, User } from '../types';

interface MobileBottomNavProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuthModal: () => void;
  currentUser: User | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  setActivePage,
  cartCount,
  onOpenCart,
  onOpenAuthModal,
  currentUser,
  theme = 'light',
  onToggleTheme,
}) => {
  const handleNav = (page: PageType) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserClick = () => {
    if (!currentUser) {
      onOpenAuthModal();
    } else {
      handleNav('dashboard');
    }
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Мобильная навигация"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),8px)] transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Главная (Каталог) */}
        <button
          onClick={() => handleNav('catalog')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
            activePage === 'catalog'
              ? 'text-[#FF6B35] font-black'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-semibold'
          }`}
          aria-label="Главная страница"
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activePage === 'catalog' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
            {activePage === 'catalog' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FF6B35] rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">Главная</span>
        </button>

        {/* 2. Курсы ЕГЭ */}
        <button
          onClick={() => handleNav('ege')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
            activePage === 'ege'
              ? 'text-[#FF6B35] font-black'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-semibold'
          }`}
          aria-label="Курсы ЕГЭ"
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 transition-transform ${activePage === 'ege' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
            {activePage === 'ege' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FF6B35] rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">Курсы ЕГЭ</span>
        </button>

        {/* 3. Корзина (Центральный яркий элемент) */}
        <button
          onClick={onOpenCart}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
            cartCount > 0
              ? 'text-[#FF6B35] font-black'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-semibold'
          }`}
          aria-label={`Корзина, ${cartCount} товаров`}
        >
          <div className="relative">
            <div className={`p-1 rounded-xl transition-all ${cartCount > 0 ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35]' : ''}`}>
              <ShoppingBag className={`w-5 h-5 ${cartCount > 0 ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#FF6B35] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">Корзина</span>
        </button>

        {/* 4. Личный кабинет / Войти */}
        <button
          onClick={handleUserClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
            activePage === 'dashboard'
              ? 'text-[#22c55e] font-black'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-semibold'
          }`}
          aria-label={currentUser ? 'Личный кабинет' : 'Войти'}
        >
          <div className="relative">
            {currentUser ? (
              <LayoutDashboard className={`w-5 h-5 transition-transform ${activePage === 'dashboard' ? 'scale-110 text-[#22c55e] stroke-[2.5]' : 'stroke-2'}`} />
            ) : (
              <UserIcon className="w-5 h-5 stroke-2" />
            )}
            {activePage === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none truncate max-w-[60px]">
            {currentUser ? 'Кабинет' : 'Войти'}
          </span>
        </button>

        {/* 5. Переключатель темы */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            id="mobile-nav-theme-toggle"
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-semibold"
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            <div className="relative p-0.5">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 stroke-2 transition-transform active:rotate-90" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 stroke-2 transition-transform active:-rotate-45" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">
              {theme === 'dark' ? 'Светлая' : 'Тёмная'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
