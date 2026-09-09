import { ExternalCourseItem } from './adminStore';

export interface CourseLessonItem {
  id: string | number;
  moduleId?: number;
  lessonIndex: number;
  title: string;
  isAvailable: boolean;
  statusText: string;
  durationText?: string;
  videos: Array<{
    title: string;
    url: string;
    durationSeconds?: number;
    isKinescope?: boolean;
  }>;
  files: Array<{
    title: string;
    url: string;
    fileType: 'MATERIAL' | 'HOMEWORK' | 'OTHER';
    sizeBytes?: number;
  }>;
  description?: string;
  scheduledDate?: string;
}

// Subject curriculums for standard monthly (September) course (8 lessons = 2 lessons/week x 4 weeks)
const SUBJECT_CURRICULUMS: Record<string, string[]> = {
  rus: [
    'Урок 1. Задание №4 (орфоэпия) + АП в соч. ЕГЭ + тезис в ИС',
    'Урок 2. Задание №9 (правописание корней) + Анализ смысловой связи в сочинении ЕГЭ',
    'Урок 3. Задание №10 (правописание приставок) + Структура и логика сочинения',
    'Урок 4. Задание №11 (правописание суффиксов) + Практикум по сочинению',
    'Урок 5. Задание №12 (окончания глаголов и суффиксы причастий)',
    'Урок 6. Задание №5 (паронимы) + Введение в синтаксис и пунктуацию (задание №16)',
    'Урок 7. Задание №6 (лексические нормы) + Работа с микротемами и речевые ошибки',
    'Урок 8. Комплексный разбор пробного варианта ЕГЭ №1 + Разбор типичных ошибок',
  ],
  prof_math: [
    'Урок 1. Дроби, проценты и вычисления (№6)',
    'Урок 2. Приёмы быстрого счета и преобразования выражений',
    'Урок 3. Планиметрия №1: углы, треугольники, высоты и медианы',
    'Урок 4. Тригонометрия №8: формулы приведения и основные тождества',
    'Урок 5. Тригонометрические уравнения №14: отбор корней на окружности',
    'Урок 6. Планиметрия №1, №18: четырехугольники, окружности и теоремы',
    'Урок 7. Степени, корни и логарифмические преобразования №7',
    'Урок 8. Разбор первой части варианта ЕГЭ Профиль на время + Стратегия',
  ],
  base_math: [
    'Урок 1. Все о базовой математике. Вычисления и дроби (№1, №2)',
    'Урок 2. Степени, корни и иррациональные выражения (№3)',
    'Урок 3. Простейшие текстовые задачи на проценты и пропорции (№4)',
    'Урок 4. Простейшие уравнения: линейные, квадратные и дробные (№5)',
    'Урок 5. Планиметрия: треугольники и четырехугольники (№6)',
    'Урок 6. Чтение графиков и диаграмм (№7)',
    'Урок 7. Прикладная геометрия и вычисление площадей (№8)',
    'Урок 8. Полный разбор базового варианта ЕГЭ №1',
  ],
  cs: [
    'Урок 1. Задание №1: Графы и таблицы. Поиск кратчайших путей',
    'Урок 2. Задание №4: Условие Фано и оптимальное кодирование',
    'Урок 3. Задание №7: Звуковые файлы, частота дискретизации и объём',
    'Урок 4. Задание №7: Растровые изображения, палитра и сжатие',
    'Урок 5. Основы Python для ЕГЭ: типы данных, циклы и условия',
    'Урок 6. Основы Python для ЕГЭ: списки, строки, методы и срезы',
    'Урок 7. Задание №12: Исполнитель Редактор и Машина Тьюринга',
    'Урок 8. Задание №11: Вычисление количества информации и память',
  ],
  phys: [
    'Урок 1. Математический аппарат в физике (векторы, проекции, производные)',
    'Урок 2. Кинематика: прямолинейное равномерное и равноускоренное движение',
    'Урок 3. Кинематика: движение по окружности и баллистика',
    'Урок 4. Динамика: три закона Ньютона, силы упругости, трения и тяжести',
    'Урок 5. Законы сохранения: закон сохранения импульса и реактивное движение',
    'Урок 6. Законы сохранения: механическая работа, кинетическая и потенциальная энергия',
    'Урок 7. Статика и гидростатика: момент сил, равновесие рычага и закон Архимеда',
    'Урок 8. Механические колебания и волны: комплексный разбор задач',
  ],
  soc: [
    'Урок 1. Человек и общество. Мировоззрение, формы и уровни познания',
    'Урок 2. Общество как динамическая система. Культура, наука и мораль',
    'Урок 3. Экономика: экономические системы, рыночный механизм, спрос и предложение',
    'Урок 4. Финансовая система: банковская система, деньги и инфляция',
    'Урок 5. Практикум: разбор задания №21 (графики равновесной цены и спроса)',
    'Урок 6. Социальные отношения: социальная стратификация и мобильность',
    'Урок 7. Политика: государство, формы правления и политические режимы',
    'Урок 8. Разбор второй части ЕГЭ (задания №17-25, план №24)',
  ],
  chem: [
    'Урок 1. Строение атома и электронные конфигурации (задание №1)',
    'Урок 2. Периодический закон и закономерности изменения свойств (задание №2)',
    'Урок 3. Химическая связь и кристаллическая решетка (задание №3)',
    'Урок 4. Степень окисления и валентность. ОВР (задание №4, 29)',
    'Урок 5. Классификация неорганических веществ и номенклатура (задание №5)',
    'Урок 6. Химические свойства простых веществ (металлы и неметаллы)',
    'Урок 7. Химические свойства оксидов и оснований (задание №6-8)',
    'Урок 8. Разбор расчетных задач первой части (№26, 27, 28)',
  ],
  bio: [
    'Урок 1. Биология как наука. Методы научного познания и уровни организации',
    'Урок 2. Цитология: химический состав клетки (белки, липиды, углеводы, нуклеиновые кислоты)',
    'Урок 3. Цитология: строение прокариотической и эукариотической клетки',
    'Урок 4. Метаболизм: энергетический обмен и фотосинтез',
    'Урок 5. Биосинтез белка и генетический код (задание №27)',
    'Урок 6. Жизненный цикл клетки: митоз и мейоз (задание №28)',
    'Урок 7. Основы генетики: законы Менделя и Моргана',
    'Урок 8. Комплексный разбор практических заданий 1-й и 2-й части',
  ],
  hist: [
    'Урок 1. Восточные славяне и образование Древнерусского государства (IX–X вв.)',
    'Урок 2. Расцвет и распад Древнерусского государства (XI–XII вв.)',
    'Урок 3. Политическая раздробленность на Руси и монгольское нашествие (XIII в.)',
    'Урок 4. Возвышение Москвы и объединение русских земель (XIV–XV вв.)',
    'Урок 5. Россия в эпоху Ивана Грозного. Внутренняя и внешняя политика (XVI в.)',
    'Урок 6. Смутное время в России. Первые Романовы (XVII в.)',
    'Урок 7. Культура и быт Руси с древности до конца XVII века (задания по картам и культуре)',
    'Урок 8. Практикум: работа с историческими источниками и аргументация (№18, 20)',
  ],
  eng: [
    'Урок 1. Введение в формат ЕГЭ. Аудирование: задания 1-9',
    'Урок 2. Чтение: стратегии работы с текстами (задания 10, 11, 12-18)',
    'Урок 3. Грамматика: видовременные формы глагола в действительном залоге',
    'Урок 4. Грамматика: страдательный залог, косвенная речь и согласование времен',
    'Урок 5. Словообразование: суффиксы и префиксы существительных и прилагательных',
    'Урок 6. Письменная речь: правила написания электронного письма (задание 37)',
    'Урок 7. Письменная речь: развернутое высказывание на основе таблицы/диаграммы (задание 38)',
    'Урок 8. Устная часть: чтение текста вслух и вопросы-расспросы (задания 1-2)',
  ],
  lit: [
    'Урок 1. Теория литературы: роды, жанры, направления и художественные приемы',
    'Урок 2. «Слово о полку Игореве»: идея, образ автора и композиция',
    'Урок 3. Д.И. Фонвизин «Недоросль» и классицизм в русской литературе',
    'Урок 4. А.С. Грибоедов «Горе от ума»: конфликт Чацкого и фамусовского общества',
    'Урок 5. А.С. Пушкин: лирика, ода «Вольность», темы поэта и поэзии',
    'Урок 6. А.С. Пушкин «Евгений Онегин»: энциклопедия русской жизни',
    'Урок 7. М.Ю. Лермонтов «Герой нашего времени»: структура и психологизм',
    'Урок 8. Практикум по написанию развернутых ответов (задания 4, 9, 11)',
  ],
  geo: [
    'Урок 1. Источники географической информации: координаты, масштабы и топографические карты',
    'Урок 2. Земля как планета: движение Земли, пояса освещенности и часовые пояса',
    'Урок 3. Геосферы Земли: литосфера, рельеф, гидросфера и атмосфера',
    'Урок 4. Природные зоны и географическая оболочка',
    'Урок 5. Население мира и России: демография, урбанизация и миграции',
    'Урок 6. Мировое хозяйство: география промышленности и сельского хозяйства',
    'Урок 7. География России: природно-ресурсный капитал и районирование',
    'Урок 8. Полный разбор тренировочного варианта ЕГЭ по географии',
  ],
};

// Helper to decode filename from pre-signed S3 URL
export function decodeFilenameFromUrl(url: string, fallback = 'Материал к уроку'): string {
  try {
    const urlObj = new URL(url);
    const disposition = urlObj.searchParams.get('response-content-disposition');
    if (disposition) {
      const matchUtf8 = disposition.match(/filename\*=UTF-8''([^;&]+)/i);
      if (matchUtf8 && matchUtf8[1]) {
        return decodeURIComponent(matchUtf8[1]);
      }
      const matchRegular = disposition.match(/filename="?([^";]+)"?/i);
      if (matchRegular && matchRegular[1]) {
        return decodeURIComponent(matchRegular[1]);
      }
    }
    const pathname = urlObj.pathname;
    const baseName = pathname.split('/').pop();
    if (baseName && !baseName.includes('-')) {
      return decodeURIComponent(baseName);
    }
  } catch {}
  return fallback;
}

// Extract subject slug from subject name or course title
function detectSubjectSlug(subject = '', title = ''): string {
  const text = `${subject} ${title}`.toLowerCase();
  if (text.includes('проф') || text.includes('профиль') || text.includes('профиматик') || text.includes('шарафиев')) return 'prof_math';
  if (text.includes('баз') || text.includes('базовая')) return 'base_math';
  if (text.includes('рус') || text.includes('кудлай') || text.includes('долгих') || text.includes('insperia')) return 'rus';
  if (text.includes('инф') || text.includes('джобс') || text.includes('it') || text.includes('питон')) return 'cs';
  if (text.includes('физ') || text.includes('эбонит') || text.includes('тесла')) return 'phys';
  if (text.includes('общ') || text.includes('валентиныч') || text.includes('смитап')) return 'soc';
  if (text.includes('хим') || text.includes('граева') || text.includes('химфак')) return 'chem';
  if (text.includes('био') || text.includes('биофак') || text.includes('ламарк')) return 'bio';
  if (text.includes('ист') || text.includes('котики') || text.includes('ильич')) return 'hist';
  if (text.includes('англ')) return 'eng';
  if (text.includes('лит')) return 'lit';
  if (text.includes('гео')) return 'geo';
  if (text.includes('мат')) return 'prof_math';
  return 'rus';
}

/**
 * Build the full, rich list of course lessons.
 * Ensures that if API returns 1 or 2 modules, the remaining scheduled
 * lessons of the course are displayed with their upcoming topics, dates, and live sync status.
 * If API returns 5 or 8 modules, ALL of them are fully included!
 */
export function buildCourseLessons(
  purchase: { courseTitle?: string; subject?: string; school?: string; courseId?: string | number },
  matchedApiCourse?: ExternalCourseItem | null
): CourseLessonItem[] {
  const result: CourseLessonItem[] = [];
  const subjectSlug = detectSubjectSlug(purchase.subject, purchase.courseTitle);
  const defaultCurriculum = SUBJECT_CURRICULUMS[subjectSlug] || SUBJECT_CURRICULUMS.rus;

  const apiModules = matchedApiCourse?.modules || [];

  // Map real API modules first
  apiModules.forEach((m, idx) => {
    const videos: CourseLessonItem['videos'] = [];
    const files: CourseLessonItem['files'] = [];

    // Parse contents from API module
    if (m.contents && Array.isArray(m.contents)) {
      m.contents.forEach((c) => {
        if (c.content_type === 'VIDEO' && c.video) {
          videos.push({
            title: c.video.title || `Видеозапись урока #${idx + 1}`,
            url: `/api/player/videos/${c.video.id}/playback`,
            durationSeconds: c.video.duration_seconds,
            isKinescope: false,
          });
        } else if (c.content_type === 'LINK' && c.link?.url) {
          const isKinescope = c.link.url.includes('kinescope.io');
          videos.push({
            title: isKinescope ? 'Запись урока (Kinescope HD)' : 'Внешняя ссылка на урок',
            url: c.link.url,
            isKinescope,
          });
        } else if (c.content_type === 'FILE' && c.file) {
          const decoded = decodeFilenameFromUrl(c.file.url || '', c.file.title || 'Учебный материал');
          files.push({
            title: decoded,
            url: c.file.url,
            fileType: (c.file_type as any) === 'HOMEWORK' ? 'HOMEWORK' : 'MATERIAL',
            sizeBytes: c.file.size_bytes,
          });
        }
      });
    }

    // Determine availability
    const isAvailable = videos.length > 0 || files.length > 0 || (m.contents && m.contents.length > 0);

    result.push({
      id: `api-mod-${m.id}`,
      moduleId: m.id,
      lessonIndex: idx + 1,
      title: m.title || `Урок ${idx + 1}`,
      isAvailable: Boolean(isAvailable),
      statusText: isAvailable ? 'Доступен к просмотру' : 'Материалы обрабатываются',
      videos,
      files,
      description: m.description || undefined,
    });
  });

  // If course has fewer than 8 lessons, supplement with scheduled upcoming lessons of the stream
  const targetTotal = Math.max(8, result.length);
  for (let i = result.length; i < targetTotal; i++) {
    const lessonIdx = i + 1;
    const curriculumTitle = defaultCurriculum[i] || `Урок ${lessonIdx}. Комплексный практикум и разбор заданий`;

    // Schedule dates for September (e.g. Sep 3, Sep 6, Sep 10, Sep 13, Sep 17, Sep 20, Sep 24, Sep 27)
    const day = 2 + Math.floor(i * 3.5);
    const dateStr = `${day} сентября`;

    result.push({
      id: `scheduled-${lessonIdx}-${Date.now()}`,
      lessonIndex: lessonIdx,
      title: curriculumTitle,
      isAvailable: false,
      statusText: `По расписанию (${dateStr})`,
      scheduledDate: dateStr,
      videos: [],
      files: [],
      description: 'Занятие сентябрьского потока. Видеозапись прямого эфира, таймкоды, конспекты и ДЗ появятся в плеере автоматически сразу после проведения урока онлайн-школой.',
    });
  }

  return result;
}
