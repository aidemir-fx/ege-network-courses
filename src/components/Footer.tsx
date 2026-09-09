import React from 'react';
import { Send, Heart, ShieldCheck } from 'lucide-react';
import { PageType } from '../types';
import logoImage from '../assets/images/logo.jpg';
import nightLogoImage from '../assets/images/night-logo.jpeg';

interface FooterProps {
  setActivePage: (page: PageType) => void;
  onOpenPrivacyModal?: () => void;
  onOpenTermsModal?: () => void;
  onOpenSupportModal?: () => void;
  theme?: 'light' | 'dark';
}

export const Footer: React.FC<FooterProps> = ({ setActivePage, onOpenPrivacyModal, onOpenTermsModal, onOpenSupportModal, theme = 'light' }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={theme === 'dark' ? nightLogoImage : logoImage}
                alt="EGE NETWORK Logo"
                className="w-auto h-16 sm:h-20 max-w-[280px] rounded-2xl sm:rounded-3xl object-contain bg-white p-2 shadow-lg shadow-slate-950/15 ring-1 ring-slate-300/60"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Все топовые онлайн-школы в одном месте.
            </p>
          </div>

          {/* Nav Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Навигация</h3>
            <ul className="space-y-2 text-xs font-semibold text-slate-300">
              <li>
                <button onClick={() => setActivePage('catalog')} className="hover:text-[#FF6B35] transition-colors">
                  Главная
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('ege')} className="hover:text-[#FF6B35] transition-colors">
                  Курсы ЕГЭ
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('reviews')} className="hover:text-[#FF6B35] transition-colors">
                  Отзывы учеников
                </button>
              </li>
            </ul>
          </div>

          {/* Online Support Contact Card */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="text-[11px] font-extrabold text-[#FF6B35] uppercase tracking-wider">
              Поддержка 24/7
            </div>
            <p className="text-xs text-slate-200 font-bold leading-snug">
              Выберите удобный способ связи: написать в чат прямо на сайте или через Telegram.
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenSupportModal}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#E65A22] text-white font-bold text-xs transition-all shadow-md shadow-[#FF6B35]/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-white" />
                <span>Чат на сайте</span>
              </button>

              <a
                href="https://t.me/egemanager"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.05 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                <span>Написать в Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>© 2021–2026 EGE NETWORK. Все права защищены.</div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenPrivacyModal} className="hover:text-slate-300 transition-colors">
              Политика конфиденциальности
            </button>
            <span>·</span>
            <button onClick={onOpenTermsModal} className="hover:text-slate-300 transition-colors">
              Условия использования
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
