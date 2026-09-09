import React from 'react';
import { ExamType } from '../types';
import umschoolLogo from '../assets/images/schools/umschool.png';
import hundredLogo from '../assets/images/schools/100b.png';
import egelandLogo from '../assets/images/schools/egeland.png';
import smitupLogo from '../assets/images/schools/smitap.png';
import egeflexLogo from '../assets/images/schools/egeflex.jpg';
import nooLogo from '../assets/images/schools/noo.png';
import insperiaLogo from '../assets/images/schools/logo-insperia.svg';

interface PopularSchoolsSectionProps {
  onSelectExam?: (exam: ExamType) => void;
  onSchoolClick?: (schoolId: string) => void;
}

export const PopularSchoolsSection: React.FC<PopularSchoolsSectionProps> = ({
  onSelectExam,
  onSchoolClick,
}) => {
  const schools = [
    {
      id: 'umschool',
      name: 'Умскул',
      desc: 'Курсы ЕГЭ по основным предметам',
      logo: umschoolLogo,
    },
    {
      id: '100b',
      name: '100балльный репетитор',
      desc: 'Годовые программы и отдельные месяцы',
      logo: hundredLogo,
    },
    {
      id: 'egeland',
      name: 'ЕГЭЛенд (EL)',
      desc: 'Подготовка к экзаменам в удобном формате',
      logo: egelandLogo,
    },
    {
      id: 'smitup',
      name: 'SmitUP',
      desc: 'Уроки, практика и материалы курса',
      logo: smitupLogo,
    },
    {
      id: 'egeflex',
      name: 'ЕГЭФлекс',
      desc: 'Курсы по востребованным предметам',
      logo: egeflexLogo,
    },
    {
      id: 'noo',
      name: 'НОО',
      desc: 'Записи занятий и учебные материалы',
      logo: nooLogo,
    },
    {
      id: 'insperia',
      name: 'Insperia',
      desc: 'Подготовка к ЕГЭ на высокие баллы',
      logo: insperiaLogo,
    },
  ];

  return (
    <section className="py-12 sm:py-18 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-[#0B0F19] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Top Header Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {/* Title */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Курсы популярных школ в одном месте
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            На EGE NETWORK собраны сливы курсов ЕГЭ 2027 от 100балльного репетитора, Умскул, ЕГЭЛенда и других онлайн-школ. Выберите предмет и подходящую программу.
          </p>
        </div>

        {/* Schools Grid (2 columns on mobile, 2 sm, 3 lg) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => onSchoolClick?.(school.id)}
              className="bg-white dark:bg-[#131B2E] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#FF6B35]/50 transition-all duration-200 flex items-center gap-2.5 sm:gap-4 text-left cursor-pointer active:scale-[0.98] group touch-manipulation"
            >
              {/* Logo */}
              <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] font-black text-xs sm:text-sm flex items-center justify-center absolute inset-0">
                  {school.name.slice(0, 2).toUpperCase()}
                </div>
                {school.logo && (
                  <img
                    src={school.logo}
                    alt={`${school.name} logo`}
                    className="w-full h-full object-contain p-1.5 sm:p-2 relative z-10 bg-white dark:bg-slate-800"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="space-y-0.5 min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-base leading-tight truncate group-hover:text-[#FF6B35] transition-colors">
                  {school.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden min-[360px]:block">
                  {school.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
