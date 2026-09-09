import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  Sparkles,
  Lock,
  Star,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Award,
  Zap,
  GraduationCap,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Radio,
  ShieldCheck,
  Flame,
  Layers,
  Calendar,
  Video,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { AcademicYear, Subject, School, CartItem, PageType, AdminCourse } from '../types';
import { getAllSubjects } from '../utils/courseHelper';
import { SCHOOLS } from '../data/mockData';
import { fetchExternalCourses, ExternalCourseItem, getStoredCourses } from '../utils/adminStore';
import { FormattedCourseTitle, formatCourseTitle } from '../utils/courseTitleFormatter';

// School Logos
import hundredLogo from '../assets/images/schools/100b.png';
import umschoolLogo from '../assets/images/schools/umschool.png';
import egelandLogo from '../assets/images/schools/egeland.png';
import smitupLogo from '../assets/images/schools/smitap.png';
import egeflexLogo from '../assets/images/schools/egeflex.jpg';
import nooLogo from '../assets/images/schools/noo.png';
import kotikiLogo from '../assets/images/history-kotik.png';
import insperiaLogo from '../assets/images/schools/logo-insperia.svg';

interface EgePageProps {
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onOpenCart?: () => void;
  onOpenAuthModal: () => void;
  showToast: (msg: string) => void;
  setActivePage: (page: PageType) => void;
}

const SCHOOL_LOGOS: Record<string, string> = {
  '100b': hundredLogo,
  'umschool': umschoolLogo,
  'egeland': egelandLogo,
  'el': egelandLogo,
  'smitap': smitupLogo,
  'egeflex': egeflexLogo,
  'noo': nooLogo,
  'kotiki': kotikiLogo,
  'insperia': insperiaLogo,
};

const SCHOOL_DESCRIPTIONS: Record<string, string> = {
  '100b': 'Харизматичные преподаватели, авторские скрипты и одна из самых высоких статистик 90+ на ЕГЭ.',
  'umschool': 'Крупнейшая онлайн-школа с собственной удобной платформой и тысячами стобалльников.',
  'egeland': 'Современный интерактивный формат подготовки («ЕГЭЛенд / EL»), понятное объяснение сложного и яркое комьюнити.',
  'el': 'Современный интерактивный формат подготовки («ЕГЭЛенд / EL»), понятное объяснение сложного и яркое комьюнити.',
  'smitap': 'Понятная теория без заучивания, индивидуальный подход и постоянный трекинг прогресса.',
  'egeflex': 'Гибкие курсы, фокус на прототипах ФИПИ и эффективная методика запоминания.',
  'noo': 'Глубокая академическая база по естественным наукам, разборы сложных задач 2-й части.',
  'shkolkovo': 'Сильная физико-математическая и IT школа для поступления в топовые вузы.',
  'webium': 'Увлекательные вебинары, поддерживающая атмосфера и заботливые кураторы.',
  'kotiki': 'Качественные гуманитарные курсы с упором на историю, обществознание и языки.',
  'insperia': 'Профессиональная подготовка к ЕГЭ на максимальный балл с персональным подходом.',
};

const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'Все предметы' },
  { id: 'popular', label: '🔥 Популярные' },
  { id: 'exact', label: '📐 Точные & IT', ids: ['prof_math', 'base_math', 'cs', 'phys'] },
  { id: 'natural', label: '🧬 Естественные', ids: ['chem', 'bio', 'geo'] },
  { id: 'humanitarian', label: '📚 Гуманитарные', ids: ['rus', 'soc', 'hist', 'eng', 'lit'] },
];

const COURSES_CATALOG = [
  {
    id: 'annual',
    title: 'Годовой курс (Весь год)',
    subtitle: 'Сентябрь — Май · Полная программа с 0 до 90+ баллов',
    badge: '🎁 Выгода 20%',
    price: 3490,
    desc: 'Полный комплекс подготовки на весь учебный год. Все темы, вебинары и учебные материалы.',
    features: [
      'Все вебинары и видеозаписи уроков (Сентябрь — Май)',
      'Конспекты, авторские скрипты и шпаргалки',
      'Домашние задания с ответами и решениями'
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
    isFullYear: true,
  },
  {
    id: 'monthly',
    title: 'Месячный курс',
    subtitle: 'Помесячный доступ к материалам выбранного месяца',
    badge: 'Помесячно',
    price: 490,
    desc: 'Доступ ко всем видеоурокам, материалам и домашним заданиям конкретного месяца.',
    features: [
      'Все видеоуроки и вебинары выбранного месяца',
      'Файлы, конспекты и рабочие тетради',
      'Домашние задания с ответами и критериями'
    ],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
    isFullYear: false,
  },
];

const MONTHS_LIST = [
  { id: 'sep', name: 'Сентябрь' },
  { id: 'oct', name: 'Октябрь' },
  { id: 'nov', name: 'Ноябрь' },
  { id: 'dec', name: 'Декабрь' },
  { id: 'jan', name: 'Январь' },
  { id: 'feb', name: 'Февраль' },
  { id: 'mar', name: 'Март' },
  { id: 'apr', name: 'Апрель' },
  { id: 'may', name: 'Май' },
];

// Helper to compute course modules and lessons availability
const getCourseStats = (ec: any) => {
  if (!ec) return { moduleCount: 0, lessonCount: 0, hasLessons: false };
  const moduleCount = ec.modules?.length || 0;
  let lessonCount = 0;
  if (ec.modules && Array.isArray(ec.modules)) {
    ec.modules.forEach((m: any) => {
      lessonCount += m.contents?.length || 0;
    });
  }
  const hasLessons = moduleCount > 0 && lessonCount > 0;
  return { moduleCount, lessonCount, hasLessons };
};

// Helper to breakdown lesson materials (videos, homeworks, files)
const getModuleContentBreakdown = (contents: any[] = []) => {
  let videoCount = 0;
  let homeworkCount = 0;
  let fileCount = 0;

  contents.forEach((c) => {
    const type = (c.content_type || '').toUpperCase();
    const fileType = (c.file_type || '').toUpperCase();

    if (type === 'VIDEO' || c.video) {
      videoCount += 1;
    } else if (fileType === 'HOMEWORK') {
      homeworkCount += 1;
      fileCount += 1;
    } else {
      fileCount += 1;
    }
  });

  return { videoCount, homeworkCount, fileCount, totalCount: contents.length };
};

// Match a course title to a subject ID
const matchCourseToSubject = (courseTitle: string, subId: string): boolean => {
  const t = courseTitle.toLowerCase();
  if (subId === 'prof_math') return t.includes('проф') || (t.includes('матем') && !t.includes('баз')) || t.includes('легион') || t.includes('пифагор') || t.includes('профиматика') || t.includes('морозилка');
  if (subId === 'base_math') return t.includes('баз') || t.includes('матеманя');
  if (subId === 'rus') return t.includes('русск') || t.includes('кудлай') || t.includes('долгих') || t.includes('insperia');
  if (subId === 'soc') return t.includes('обществ') || t.includes('налегке') || t.includes('флэш');
  if (subId === 'cs') return t.includes('информ') || t.includes('python') || t.includes('питон') || t.includes('джобс') || t.includes('гвардия') || t.includes('ликбез');
  if (subId === 'hist') return t.includes('истор') || t.includes('медведица');
  if (subId === 'chem') return t.includes('хими') || t.includes('химфак') || t.includes('граева');
  if (subId === 'bio') return t.includes('биолог') || t.includes('биофак') || t.includes('ламарк');
  if (subId === 'phys') return t.includes('физик') || t.includes('эбонит') || t.includes('тесла') || t.includes('ehub') || t.includes('душнила');
  if (subId === 'eng') return t.includes('английск');
  if (subId === 'lit') return t.includes('литератур');
  if (subId === 'geo') return t.includes('географ') || t.includes('геофак');
  return false;
};

// Match a course title to a school ID and name
const matchCourseToSchool = (courseTitle: string, schoolId: string, schoolName: string): boolean => {
  const t = courseTitle.toLowerCase();
  const sId = schoolId.toLowerCase();
  const sName = schoolName.toLowerCase();
  let matches = t.includes(sName) || t.includes(sId);
  if (sId === '100b') {
    matches = matches || t.includes('100') || t.includes('кудлай') || t.includes('стобалльн') || t.includes('эбонит') || t.includes('биофак') || t.includes('химфак') || t.includes('легион') || t.includes('ликбез') || t.includes('гвардия') || t.includes('геофак') || t.includes('матеманя') || t.includes('новый русский') || t.includes('ламарк') || t.includes('медведица') || t.includes('флэш') || t.includes('джобс');
  }
  if (sId === 'umschool') {
    matches = matches || t.includes('умскул') || t.includes('umschool') || t.includes('умпрофиль') || t.includes('умшкола') || t.includes('шарафиев') || t.includes('умрусский') || t.includes('умхимия') || t.includes('умфизика') || t.includes('долгих') || t.includes('граева') || t.includes('тесла');
  }
  if (sId === 'egeland' || sId === 'el') {
    matches = matches || t.includes('ленд') || t.includes('egeland') || t.includes('el ') || t.startsWith('el') || t.includes('ильяс') || t.includes('егэленд');
  }
  if (sId === 'profimatika') matches = matches || t.includes('профиматика');
  if (sId === 'insperia') matches = matches || t.includes('insperia');
  if (sId === 'shkolkovo') matches = matches || t.includes('школково') || t.includes('shkolkovo');
  if (sId === 'noo') matches = matches || t.includes('ноо') || t.includes('noo');
  if (sId === 'smitap') matches = matches || t.includes('смит') || t.includes('smitup');
  if (sId === 'egeflex') matches = matches || t.includes('флекс') || t.includes('flex');
  if (sId === 'kotiki') matches = matches || t.includes('котики');
  if (sId === 'webium') matches = matches || t.includes('вебиум') || t.includes('webium');
  return matches;
};

export const EgePage: React.FC<EgePageProps> = ({
  onAddToCart,
  onOpenCart,
  onOpenAuthModal,
  showToast,
  setActivePage,
}) => {
  const [selectedYear, setSelectedYear] = useState<AcademicYear>('2027');
  const [allEgeSubjects, setAllEgeSubjects] = useState(() => getAllSubjects('EGE'));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');

  const allSchools = SCHOOLS;

  const [externalCourses, setExternalCourses] = useState<ExternalCourseItem[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  useEffect(() => {
    setAllEgeSubjects(getAllSubjects('EGE'));
    const loadExt = async () => {
      setIsLoadingExternal(true);
      try {
        const list = await fetchExternalCourses();
        setExternalCourses(list);
      } catch (e) {
        console.warn('Failed to load external API courses in EgePage:', e);
      } finally {
        setIsLoadingExternal(false);
      }
    };
    loadExt();
  }, []);

  // Filter subjects by category & search query
  const filteredSubjects = useMemo(() => {
    return allEgeSubjects.filter((sub) => {
      // Category check
      if (selectedCategory === 'popular' && !sub.popular) return false;
      if (selectedCategory === 'exact' && !['prof_math', 'base_math', 'cs', 'phys'].includes(sub.id)) return false;
      if (selectedCategory === 'natural' && !['chem', 'bio', 'geo'].includes(sub.id)) return false;
      if (selectedCategory === 'humanitarian' && !['rus', 'soc', 'hist', 'eng', 'lit'].includes(sub.id)) return false;

      // Search query
      if (subjectSearchQuery.trim()) {
        return sub.name.toLowerCase().includes(subjectSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [allEgeSubjects, selectedCategory, subjectSearchQuery]);

  // Selections
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(() => allEgeSubjects[0] || null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(allSchools[0]);
  const [selectedCourse, setSelectedCourse] = useState<any>(COURSES_CATALOG[0]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['sep']);
  const [isAdded, setIsAdded] = useState(false);

  // Filtered external courses by selected subject
  const filteredExternalCourses = useMemo(() => {
    if (!selectedSubject) return externalCourses;
    return externalCourses.filter((ec) => matchCourseToSubject(ec.title, selectedSubject.id));
  }, [externalCourses, selectedSubject]);

  // Map of course stats for each school based on the selected subject
  const schoolCourseMap = useMemo(() => {
    const map = new Map<string, { courses: ExternalCourseItem[]; totalModules: number; totalLessons: number; hasLessons: boolean }>();
    if (!selectedSubject) return map;

    allSchools.forEach((sch) => {
      const courses = externalCourses.filter((ec) =>
        matchCourseToSubject(ec.title, selectedSubject.id) && matchCourseToSchool(ec.title, sch.id, sch.name)
      );
      let totalModules = 0;
      let totalLessons = 0;
      courses.forEach((c) => {
        const stats = getCourseStats(c);
        totalModules += stats.moduleCount;
        totalLessons += stats.lessonCount;
      });
      map.set(sch.id, {
        courses,
        totalModules,
        totalLessons,
        hasLessons: totalLessons > 0,
      });
    });

    return map;
  }, [allSchools, externalCourses, selectedSubject]);

  // Available schools for selected subject, sorted by content readiness
  const availableSchools = useMemo(() => {
    if (!selectedSubject) return allSchools;

    let list = allSchools.slice();

    // Sort schools:
    // 1. Schools with ready video lessons (>0) first
    // 2. Schools with stream courses next
    // 3. Schools that teach this subject next
    list.sort((a, b) => {
      const statsA = schoolCourseMap.get(a.id);
      const statsB = schoolCourseMap.get(b.id);
      const lessonsA = statsA?.totalLessons || 0;
      const lessonsB = statsB?.totalLessons || 0;
      if (lessonsA > 0 && lessonsB === 0) return -1;
      if (lessonsB > 0 && lessonsA === 0) return 1;
      if (lessonsA > 0 && lessonsB > 0) return lessonsB - lessonsA;

      const coursesA = statsA?.courses.length || 0;
      const coursesB = statsB?.courses.length || 0;
      if (coursesA > 0 && coursesB === 0) return -1;
      if (coursesB > 0 && coursesA === 0) return 1;

      const teachesA = a.subjects ? a.subjects.includes(selectedSubject.id) : true;
      const teachesB = b.subjects ? b.subjects.includes(selectedSubject.id) : true;
      if (teachesA && !teachesB) return -1;
      if (!teachesA && teachesB) return 1;

      return 0;
    });

    if (schoolSearchQuery.trim()) {
      list = list.filter((sch) =>
        sch.name.toLowerCase().includes(schoolSearchQuery.toLowerCase())
      );
    }
    return list.length > 0 ? list : allSchools;
  }, [allSchools, selectedSubject, schoolCourseMap, schoolSearchQuery]);

  const hasCourses = availableSchools.length > 0;

  useEffect(() => {
    if (availableSchools.length > 0) {
      if (!selectedSchool || !availableSchools.some(s => s.id === selectedSchool.id)) {
        setSelectedSchool(availableSchools[0]);
      }
    } else {
      setSelectedSchool(null);
    }
  }, [availableSchools]);

  // Filtered external courses by selected school
  const selectedSchoolCourses = useMemo(() => {
    if (!selectedSubject || !selectedSchool) return [];
    const courses = externalCourses.filter((ec) =>
      matchCourseToSubject(ec.title, selectedSubject.id) && matchCourseToSchool(ec.title, selectedSchool.id, selectedSchool.name)
    );
    return courses;
  }, [externalCourses, selectedSchool, selectedSubject]);

  const [selectedApiCourse, setSelectedApiCourse] = useState<any>(null);
  const [showModulesList, setShowModulesList] = useState(false);

  useEffect(() => {
    setShowModulesList(false);
    if (selectedSchoolCourses.length > 0) {
      // Prefer selecting a course that has lessons already loaded
      const readyCourse = selectedSchoolCourses.find(c => getCourseStats(c).hasLessons);
      if (readyCourse) {
        setSelectedApiCourse(readyCourse);
      } else {
        setSelectedApiCourse(selectedSchoolCourses[0]);
      }
    } else {
      // Fallback virtual course for schools that don't have an explicit API record yet
      if (selectedSubject && selectedSchool) {
        setSelectedApiCourse({
          id: `virtual-${selectedSchool.id}-${selectedSubject.id}`,
          title: `Курс подготовки ЕГЭ 2027: ${selectedSubject.name} (${selectedSchool.name})`,
          modules: [],
        });
      } else {
        setSelectedApiCourse(null);
      }
    }
  }, [selectedSchoolCourses, selectedSchool, selectedSubject]);

  // Current stats of the selected course
  const currentCourseStats = useMemo(() => {
    return getCourseStats(selectedApiCourse);
  }, [selectedApiCourse]);

  // Available tariff packages for selected subject and course
  const availableCoursesForSubject = useMemo(() => {
    if (!selectedSubject) return [];

    const primaryEc = selectedApiCourse;

    return [
      {
        id: primaryEc ? `api-course-${primaryEc.id}-monthly` : 'monthly',
        title: 'Подписка на 1 месяц (30 дней)',
        subtitle: 'Эфиры, записи и материалы · 490 ₽',
        badge: '🔥 Рекомендуем',
        price: 490,
        desc: 'Доступ на 30 дней ко всем видеоурокам курса, новым записям прямых эфиров и файлам домашней работы.',
        features: [
          'Все видеоуроки и записи прошедших эфиров',
          'Авто-появление новых уроков сразу после прямого эфира',
          'Конспекты, рабочие тетради и домашние задания',
          'Доступ в HD качестве через встроенный плеер платформы',
        ],
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
        isFullYear: false,
        tariffType: 'monthly' as const,
        rawApiCourse: primaryEc,
      },
      {
        id: primaryEc ? `api-course-${primaryEc.id}-annual` : 'annual',
        title: 'Полный курс (Весь учебный год)',
        subtitle: 'До конца экзаменов ЕГЭ · Единоразово',
        badge: '🎁 Выгода 60%',
        price: 3490,
        desc: 'Полный доступ ко всей годовой программе, всем модулям и будущим вебинарам до конца экзаменов.',
        features: [
          'Доступ ко всем модулям и урокам года (Сентябрь — Май)',
          'Все записи прямых эфиров и новые вебинары без доплат',
          'Полный банк ДЗ, шпаргалок и авторских конспектов',
          'Никаких повторных ежемесячных списаний',
        ],
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
        isFullYear: true,
        tariffType: 'annual' as const,
        rawApiCourse: primaryEc,
      },
    ];
  }, [selectedSubject, selectedApiCourse]);

  useEffect(() => {
    if (availableCoursesForSubject.length > 0) {
      setSelectedCourse(availableCoursesForSubject[0]);
    }
  }, [availableCoursesForSubject]);

  // Toggle single month in multi-month selection
  const toggleMonth = (monthId: string) => {
    setSelectedMonths((prev) => {
      if (prev.includes(monthId)) {
        if (prev.length === 1) return prev; // Require at least one selected month
        return prev.filter((id) => id !== monthId);
      } else {
        return [...prev, monthId];
      }
    });
  };

  const selectAllMonths = () => {
    setSelectedMonths(MONTHS_LIST.map((m) => m.id));
  };

  const selectMonthsRange = (ids: string[]) => {
    setSelectedMonths(ids);
  };

  // Selected month names string
  const selectedMonthNames = useMemo(() => {
    const names = MONTHS_LIST.filter((m) => selectedMonths.includes(m.id)).map((m) => m.name);
    if (names.length === MONTHS_LIST.length) return 'Все 9 месяцев (Сентябрь — Май)';
    if (names.length === 1) return names[0];
    return `${names.join(', ')} (${names.length} мес.)`;
  }, [selectedMonths]);

  // Calculate final price based on selected course
  const currentPrice = useMemo(() => {
    if (selectedCourse?.id?.includes('annual') || selectedCourse?.isFullYear) {
      return selectedCourse.price || 3490;
    }
    if (selectedCourse?.id?.includes('monthly') || selectedCourse?.tariffType === 'monthly') {
      return selectedCourse.price || 490;
    }
    return (selectedCourse?.price || 490) * selectedMonths.length;
  }, [selectedCourse, selectedMonths]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedSubject || !selectedSchool) return;

    const isAnnual = selectedCourse?.id?.includes('annual') || selectedCourse?.isFullYear;
    const monthStr = isAnnual
      ? 'Весь учебный год 2026–2027 (без доплат)'
      : `Подписка на 1 месяц (${selectedMonthNames})`;
    
    onAddToCart({
      courseId: `${selectedSubject.id}-${selectedSchool.id}-${selectedCourse.id}-${selectedYear}`,
      subjectName: selectedSubject.name,
      schoolName: selectedSchool.name,
      courseTitle: selectedApiCourse ? `${formatCourseTitle(selectedApiCourse.title)} (${selectedCourse.title})` : selectedCourse.title,
      monthName: monthStr,
      year: selectedYear,
      price: currentPrice,
      tariffType: isAnnual ? 'annual' : 'monthly',
    });

    setIsAdded(true);
    showToast(`Курс «${selectedSubject.name} — ${selectedSchool.name}» (${isAnnual ? 'Весь год' : '1 месяц'}) добавлен в корзину!`);
    setTimeout(() => setIsAdded(false), 2500);
  };

  // Sequential selection helpers with smooth scrolling
  const handleSelectSubject = (sub: Subject) => {
    setSelectedSubject(sub);
    setTimeout(() => scrollToSection('step-school'), 120);
  };

  const handleSelectSchool = (sch: School) => {
    setSelectedSchool(sch);
    setTimeout(() => scrollToSection('step-course'), 120);
  };

  const handleSelectCourse = (crs: typeof COURSES_CATALOG[0]) => {
    setSelectedCourse(crs);
    if (crs.id === 'annual') {
      setTimeout(() => scrollToSection('step-checkout'), 120);
    }
  };

  // Scroll Helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Accordion state for FAQ block
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      icon: '🏫',
      question: 'Какие онлайн-школы представлены?',
      answer:
        'В каталоге EGE NETWORK собраны сливы курсов от топовых онлайн-школ: 100балльный репетитор, Умскул, ЕГЭЛенд, SmitUP, ЕГЭФлекс, НОО, Школково, Вебиум, Котики и других.',
    },
    {
      icon: '📚',
      question: 'Какие предметы доступные для покупки?',
      answer:
        'Доступны абсолютно все предметы ЕГЭ 2027: Русский язык, Профильная и Базовая математика, Информатика, Обществознание, История, Химия, Биология, Физика, Английский, Литература и География.',
    },
    {
      icon: '✅',
      question: 'Что входит в купленный курс?',
      answer:
        'Вы получаете полный комплект: записи вебинаров в 1080p, файловые скрипты, красочные конспекты, домашние задания с ответами и разборами, шпаргалки и закрытый телеграм-канал.',
    },
    {
      icon: '⚡',
      question: 'Когда я получу доступ к материалам?',
      answer:
        'Доступ предоставляется моментально прямо на сайте после быстрой оплаты. Никакого ожидания — можно начинать заниматься сразу!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4FBF6] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pb-32 lg:pb-28 transition-colors duration-200">

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">

        {/* STEP 01: ВЫБОР ПРЕДМЕТА */}
        <section id="step-subject" className="scroll-mt-28 bg-white dark:bg-[#131B2E] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-black flex items-center justify-center shrink-0">1</span>
              <span>Выберите предмет</span>
            </h2>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {allEgeSubjects.map((sub) => {
              const isSelected = selectedSubject?.id === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className={`p-3 rounded-xl font-bold transition-all text-left flex flex-col justify-between cursor-pointer border active:scale-95 touch-manipulation ${
                    isSelected
                      ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 border-2 border-[#FF6B35] text-slate-900 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-[#1A233A] border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-500'
                  }`}
                >
                  <div className="mb-2">
                    <span className={`p-2 rounded-xl inline-flex ${
                      isSelected 
                        ? 'bg-[#FF6B35] text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <BookOpen className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="font-black leading-tight text-slate-900 dark:text-white text-xs sm:text-sm">
                    {sub.name}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 02 & 03 & 04 (Rendered only when courses exist for the subject) */}
        {hasCourses ? (
          <>
            {/* STEP 02: ВЫБОР ОНЛАЙН-ШКОЛЫ */}
            <section id="step-school" className="scroll-mt-28 bg-white dark:bg-[#131B2E] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-black flex items-center justify-center shrink-0">2</span>
                  <span>Выберите онлайн-школу</span>
                </h2>
              </div>

              {/* Available Schools Compact Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {availableSchools.map((sch) => {
                  const isSelected = selectedSchool?.id === sch.id;
                  const logo = SCHOOL_LOGOS[sch.id];
                  const info = schoolCourseMap.get(sch.id);
                  const hasReadyLessons = (info?.totalLessons || 0) > 0;
                  const hasCoursesInSchool = (info?.courses.length || 0) > 0;

                  return (
                    <button
                      key={sch.id}
                      onClick={() => handleSelectSchool(sch)}
                      className={`p-3 rounded-2xl transition-all text-left flex flex-col justify-between cursor-pointer border active:scale-95 touch-manipulation relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 border-2 border-[#FF6B35] shadow-xs'
                          : 'bg-white dark:bg-[#1A233A] border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400 dark:hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {/* Logo Container */}
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1 relative shrink-0 shadow-2xs">
                          <div className="w-full h-full rounded-lg bg-[#FF6B35] text-white font-black text-xs flex items-center justify-center absolute inset-0">
                            {sch.name.slice(0, 2).toUpperCase()}
                          </div>
                          {logo && (
                            <img
                              src={logo}
                              alt={sch.name}
                              className="w-full h-full object-contain relative z-10 bg-white dark:bg-slate-800"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* School Name & Subtitle */}
                      <div>
                        <div className="font-black leading-tight text-slate-900 dark:text-white text-xs sm:text-sm">
                          {sch.name}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                          {hasCoursesInSchool ? (
                            <span>Сентябрьский поток</span>
                          ) : (
                            <span>Программа 2027</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 03: ВЫБОР ПРОГРАММЫ И ТАРИФА */}
            <section id="step-course" className="scroll-mt-28 bg-white dark:bg-[#131B2E] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-black flex items-center justify-center shrink-0">3</span>
                    <span>Программа курса и наполнение</span>
                  </h2>

                  <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    Школа: <span className="text-slate-900 dark:text-white font-black">{selectedSchool?.name}</span>
                  </div>
                </div>
              </div>

              {/* If School has multiple course programs, allow switching */}
              {selectedSchoolCourses.length > 1 && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Программы школы ({selectedSchoolCourses.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSchoolCourses.map((ec) => {
                      const isSelected = selectedApiCourse?.id === ec.id;
                      const stats = getCourseStats(ec);
                      return (
                        <button
                          key={ec.id}
                          onClick={() => {
                            setSelectedApiCourse(ec);
                            setShowModulesList(false);
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 border-2 border-[#FF6B35] shadow-xs'
                              : 'bg-slate-50 dark:bg-[#1A233A] border-slate-200/80 dark:border-slate-700/60 hover:border-slate-400'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <FormattedCourseTitle title={ec.title} size="sm" />
                          </div>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#FF6B35] border-[#FF6B35] text-white text-[10px] font-black' : 'border-slate-300'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TARIFF SELECTION */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Выберите период доступа:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {availableCoursesForSubject.map((crs) => {
                    const isSelected = selectedCourse.id === crs.id;
                    const isAnnual = crs.isFullYear || crs.id.includes('annual');

                    return (
                      <button
                        key={crs.id}
                        onClick={() => handleSelectCourse(crs)}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all text-left flex items-center justify-between gap-3 cursor-pointer border relative touch-manipulation active:scale-[0.99] ${
                          isSelected
                            ? 'bg-[#FFF1E8] dark:bg-[#FF6B35]/20 border-2 border-[#FF6B35] shadow-xs'
                            : 'bg-white dark:bg-[#1A233A] border-slate-200/80 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Radio Check Indicator */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Title and brief description */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                                {isAnnual ? 'Полный курс на весь год' : 'Подписка на 1 месяц'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <div className="text-base sm:text-lg font-black text-[#FF6B35] dark:text-[#FF8C5A] leading-none">
                            {crs.price} ₽
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                            {isAnnual ? 'разово' : 'в месяц'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MULTI-MONTH SELECTION (if monthly course selected) */}
              {!selectedCourse.rawApiCourse && selectedCourse.id === 'monthly' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Выберите месяцы обучения (можно несколько):</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Нажмите на один или сразу несколько месяцев, чтобы оплатить их одним заказом
                      </p>
                    </div>
                    <div className="text-xs text-[#FF6B35] dark:text-[#FF8C5A] font-black bg-[#FFF1E8] dark:bg-[#FF6B35]/20 px-3 py-1.5 rounded-full border border-[#FFD3BA] dark:border-[#FF6B35]/40 self-start sm:self-auto">
                      Выбрано: {selectedMonths.length} мес. · {currentPrice} ₽
                    </div>
                  </div>

                  {/* Quick Select Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Быстрый выбор:</span>
                    <button
                      onClick={selectAllMonths}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
                        selectedMonths.length === MONTHS_LIST.length
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Все 9 месяцев
                    </button>
                    <button
                      onClick={() => selectMonthsRange(['sep', 'oct', 'nov'])}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      🍁 Осень (Сен-Ноя)
                    </button>
                    <button
                      onClick={() => selectMonthsRange(['dec', 'jan', 'feb'])}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      ❄️ Зима (Дек-Фев)
                    </button>
                    <button
                      onClick={() => selectMonthsRange(['mar', 'apr', 'may'])}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      🌱 Весна (Мар-Май)
                    </button>
                  </div>

                  {/* Months Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {MONTHS_LIST.map((m) => {
                      const isSelected = selectedMonths.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggleMonth(m.id)}
                          className={`py-3 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-xs scale-[1.01]'
                              : 'bg-white dark:bg-[#1A233A] border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-500'
                          }`}
                        >
                          <span>{m.name}</span>
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-white text-[#FF6B35]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : '+'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* STEP 04: ИТОГОВАЯ КАРТОЧКА И ОФОРМЛЕНИЕ КОРЗИНЫ */}
            <section id="step-checkout" className="scroll-mt-32">
              <div className="bg-[#FFF1E8] dark:bg-[#1C1624] rounded-2xl p-5 sm:p-7 border border-[#FFD3BA] dark:border-[#FF6B35]/40 shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between">
                
                {/* Course summary */}
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-xs font-black text-[#FF6B35] shadow-2xs border border-[#FFD3BA] dark:border-slate-700">
                    <span>{selectedSubject?.name}</span>
                    <span>•</span>
                    <span>{selectedSchool?.name}</span>
                  </div>

                  <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    <FormattedCourseTitle
                      title={selectedApiCourse?.title || selectedCourse.title}
                      size="xl"
                    />
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 justify-center md:justify-start flex-wrap">
                    <span className="font-bold text-[#FF6B35] dark:text-[#FF8C5A]">
                      {selectedCourse.id?.includes('annual') || selectedCourse.isFullYear
                        ? 'Полный доступ на весь год'
                        : `Подписка на 1 месяц (${selectedMonthNames})`}
                    </span>
                  </div>
                </div>

                {/* Action Box */}
                <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 shrink-0 w-full md:w-72 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {currentPrice} ₽
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (isAdded) {
                          onOpenCart?.();
                        } else {
                          handleAddToCart();
                        }
                      }}
                      className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isAdded
                          ? 'bg-[#FF6B35] hover:bg-[#E65A22] text-white shadow-xs'
                          : 'bg-[#2FA34F] hover:bg-[#289245] text-white shadow-emerald-500/20'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isAdded ? 'Перейти в корзину →' : `Добавить в корзину (${currentPrice} ₽)`}</span>
                    </button>

                    {isAdded && (
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                      >
                        + Добавить ещё один
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </section>
          </>
        ) : (
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF1E8] dark:bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center mx-auto text-2xl font-black border border-[#FFD3BA] dark:border-[#FF6B35]/30">
              📚
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Для предмета «{selectedSubject?.name}» пока нет курсов в API
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              В партнерской базе данных отсутствуют курсы по данному предмету. Выберите другой предмет ЕГЭ или воспользуйтесь каталогом основных курсов.
            </p>
          </div>
        )}

        {/* BLOCK: FAQ */}
        <div id="how-it-works" className="bg-gradient-to-b from-[#EFF9F2] via-[#F3FAF5] to-[#EBF6EE] dark:from-[#131B2E] dark:via-[#111728] dark:to-[#0F1422] rounded-3xl p-6 sm:p-10 border border-[#FFD3BA] dark:border-slate-800 shadow-xs">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            Вопросы и ответы по курсам ЕГЭ
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-4xl mb-8">
            Ответы на самые частые вопросы учеников перед покупкой слива курса.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1A233A] rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-slate-900 dark:text-white hover:text-[#FF6B35] dark:hover:text-[#FF8C5A] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{faq.icon}</span>
                      <span className="text-sm sm:text-base font-bold">{faq.question}</span>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-300 font-bold text-sm">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActivePage('reviews')}
              className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:border-emerald-500 hover:text-[#FF6B35] dark:hover:text-[#FF8C5A] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Отзывы учеников</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Floating Action Bar (Docked right above Mobile Bottom Nav) */}
      {selectedSubject && selectedSchool && hasCourses && (
        <div className="fixed bottom-[58px] sm:bottom-[64px] left-3 right-3 z-30 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-2xl p-2.5 px-3.5 shadow-2xl border border-slate-700/80 md:hidden flex items-center justify-between gap-2.5 animate-slideUp">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-white truncate">
              <span className="truncate">{selectedSubject.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 font-bold truncate text-[11px]">{selectedSchool.name}</span>
            </div>
            <div className="text-[11px] font-extrabold text-[#FF8C5A] flex items-center gap-1.5">
              <span>{currentPrice} ₽</span>
              <span className="text-[10px] text-slate-400 font-semibold truncate">({selectedCourse.title})</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isAdded) {
                onOpenCart?.();
              } else {
                handleAddToCart();
              }
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 cursor-pointer touch-manipulation ${
              isAdded
                ? 'bg-[#FF6B35] text-white hover:bg-[#E65A22]'
                : 'bg-[#22c55e] text-white hover:bg-[#1ea751] shadow-emerald-500/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isAdded ? 'В корзине →' : 'В корзину'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

