import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ShoppingCart, Check, Filter, Sparkles, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import { AdminCourse, CartItem, ExamType, AcademicYear } from '../types';
import { getStoredCourses, fetchExternalCourses } from '../utils/adminStore';
import { FormattedCourseTitle, formatCourseTitle } from '../utils/courseTitleFormatter';

interface CoursesGridProps {
  initialExamFilter?: ExamType | 'all';
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  showToast: (msg: string) => void;
  title?: string;
  subtitle?: string;
}

export const CoursesGrid: React.FC<CoursesGridProps> = ({
  initialExamFilter = 'all',
  onAddToCart,
  showToast,
  title = 'Все доступные курсы',
  subtitle = 'Выберите нужный предмет и получите полный доступ к видеоурокам и материалам'
}) => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType | 'all'>(initialExamFilter);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [addedCourseId, setAddedCourseId] = useState<string | null>(null);
  // Store selected tariff per course: 'monthly' (490 ₽) | 'annual'
  const [selectedTariffMap, setSelectedTariffMap] = useState<Record<string, 'monthly' | 'annual'>>({});

  const getTariffForCourse = (courseId: string): 'monthly' | 'annual' => {
    return selectedTariffMap[courseId] || 'monthly';
  };

  const setTariffForCourse = (courseId: string, tariff: 'monthly' | 'annual') => {
    setSelectedTariffMap(prev => ({ ...prev, [courseId]: tariff }));
  };

  // Load active courses from store and external API
  const loadCourses = async () => {
    const stored = getStoredCourses();
    const visible = stored.filter(c => !c.isHidden);
    
    try {
      const extCourses = await fetchExternalCourses();
      if (extCourses && extCourses.length > 0) {
        const mappedExt: AdminCourse[] = extCourses
          .map((ec) => {
          let modulesCount = ec.modules?.length || 0;
          let videosCount = 0;
          ec.modules?.forEach(m => {
            if (m.contents) {
              videosCount += m.contents.filter(c => c.content_type === 'VIDEO').length;
            }
          });

          return {
            id: `ext-${ec.id}`,
            title: ec.title,
            subject: ec.title.toLowerCase().includes('матем') && ec.title.toLowerCase().includes('проф') ? 'Профиль (Математика)' :
                     ec.title.toLowerCase().includes('матем') && ec.title.toLowerCase().includes('баз') ? 'Базовая Математика' :
                     ec.title.toLowerCase().includes('русск') ? 'Русский Язык' :
                     ec.title.toLowerCase().includes('обществ') ? 'Обществознание' :
                     ec.title.toLowerCase().includes('английск') ? 'Английский Язык' :
                     ec.title.toLowerCase().includes('истор') ? 'История' :
                     ec.title.toLowerCase().includes('информ') ? 'Информатика' : 'ЕГЭ / ОГЭ Курс',
            school: ec.title.toLowerCase().includes('школково') ? 'Школково' :
                    ec.title.toLowerCase().includes('егэлэнд') ? 'ЕГЭЛенд' : 'AliceEge Academy',
            exam: ec.title.toLowerCase().includes('огэ') ? 'OGE' : 'EGE',
            year: '2027',
            price: ec.status === 'PUBLISHED' ? 3490 : 2490,
            originalPrice: 4500,
            isHidden: false, // Show all active partner courses
            telegramChannelLink: 'https://t.me/EgeNetwork11_bot',
            createdAt: '2026-08-01',
          };
        });
        const combined = [...mappedExt.filter(c => !c.isHidden), ...visible];
        setCourses(combined);
        return;
      }
    } catch (e) {
      console.warn('Failed to load external courses in grid:', e);
    }

    setCourses(visible);
  };

  useEffect(() => {
    loadCourses();
    // Re-check periodically or on focus
    window.addEventListener('storage', loadCourses);
    return () => window.removeEventListener('storage', loadCourses);
  }, []);

  // Extract unique subjects
  const availableSubjects = Array.from(new Set(courses.map(c => c.subject))).sort();

  // Filter courses
  const filteredCourses = courses.filter(c => {
    const matchesExam = selectedExam === 'all' || c.exam === selectedExam;
    const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchesYear = selectedYear === 'all' || c.year === selectedYear;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.school.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesExam && matchesSubject && matchesYear && matchesSearch;
  });

  const handleAdd = (course: AdminCourse) => {
    const tariff = getTariffForCourse(course.id);
    const isMonthly = tariff === 'monthly';
    const finalPrice = isMonthly ? 490 : course.price;
    const monthName = isMonthly 
      ? 'Подписка на 1 месяц (доступ ко всем эфирам и обновлениям)' 
      : 'Полный доступ ко всему учебному году (без доплат)';

    onAddToCart({
      courseId: isMonthly ? `${course.id}-1month` : course.id,
      subjectName: course.subject,
      schoolName: course.school,
      courseTitle: formatCourseTitle(course.title),
      monthName: monthName,
      year: course.year,
      price: finalPrice,
      tariffType: tariff,
    });

    setAddedCourseId(course.id);
    showToast(`«${formatCourseTitle(course.title)}» (${isMonthly ? '1 месяц — 490 ₽' : 'Весь год'}) добавлен в корзину!`);
    setTimeout(() => setAddedCourseId(null), 2000);
  };

  return (
    <section id="catalog-grid" className="py-10 bg-slate-50/70 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-2xs font-bold text-xs text-slate-700">
            <BookOpen className="w-4 h-4 text-[#FF6B35]" />
            <span>Найдено курсов: <strong className="text-[#FF6B35]">{filteredCourses.length}</strong></span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск предмета или школы (например, Психология)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all"
              />
            </div>

            {/* Exam Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              <button
                onClick={() => setSelectedExam('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedExam === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setSelectedExam('EGE')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedExam === 'EGE' ? 'bg-[#FF6B35] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ЕГЭ
              </button>
              <button
                onClick={() => setSelectedExam('OGE')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedExam === 'OGE' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ОГЭ
              </button>
            </div>

            {/* Subject Select */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6B35] cursor-pointer"
              >
                <option value="all">Все предметы ({availableSubjects.length})</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Select */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6B35] cursor-pointer"
              >
                <option value="all">Все сезоны</option>
                <option value="2027">2027 (Новые курсы)</option>
                <option value="2026">2026 (Архив)</option>
              </select>
            </div>

          </div>

          {/* Subject Pills for Quick Click */}
          {availableSubjects.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Все предметы
              </button>
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-black text-slate-900">Курсы по вашему запросу не найдены</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Попробуйте сбросить фильтры или ввести другое название предмета.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedExam('all');
                setSelectedSubject('all');
                setSelectedYear('all');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              Сбросить все фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isAdded = addedCourseId === course.id;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 flex flex-col justify-between hover:shadow-xl hover:border-emerald-300 transition-all group duration-200"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${
                          course.exam === 'EGE' 
                            ? 'bg-[#FFF1E8] text-[#FF6B35] border border-[#FFD3BA]' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {course.exam}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-[11px]">
                          {course.year}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {course.school}
                      </span>
                    </div>

                    {/* Subject & Title */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-[#FF6B35] uppercase tracking-wider">
                        {course.subject}
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#FF6B35] transition-colors leading-snug">
                        <FormattedCourseTitle title={course.title} size="md" />
                      </div>
                    </div>

                    {/* Tariff Selector */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-extrabold text-slate-500 block">
                        Тариф доступа:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setTariffForCourse(course.id, 'monthly')}
                          className={`py-1.5 px-2 rounded-lg font-black text-[11px] transition-all flex flex-col items-center justify-center cursor-pointer ${
                            getTariffForCourse(course.id) === 'monthly'
                              ? 'bg-[#FF6B35] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>1 месяц</span>
                          <span className={`text-[10px] font-bold ${getTariffForCourse(course.id) === 'monthly' ? 'text-orange-100' : 'text-slate-500'}`}>490 ₽</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTariffForCourse(course.id, 'annual')}
                          className={`py-1.5 px-2 rounded-lg font-black text-[11px] transition-all flex flex-col items-center justify-center cursor-pointer ${
                            getTariffForCourse(course.id) === 'annual'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>Весь год</span>
                          <span className={`text-[10px] font-bold ${getTariffForCourse(course.id) === 'annual' ? 'text-slate-300' : 'text-slate-500'}`}>{course.price} ₽</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Price & Button */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        {getTariffForCourse(course.id) === 'monthly' ? 'Ежемесячно' : 'Навсегда'}
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {getTariffForCourse(course.id) === 'monthly' ? '490 ₽' : `${course.price.toLocaleString('ru-RU')} ₽`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdd(course)}
                      className={`py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                        isAdded
                          ? 'bg-[#E65A22] text-white'
                          : 'bg-[#FF6B35] hover:bg-[#E65A22] text-white shadow-md shadow-[#FF6B35]/20 hover:scale-[1.03] active:scale-[0.97]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>В корзине!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>В корзину</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
