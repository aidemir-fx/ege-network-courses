import React from 'react';

export interface ParsedCourseTitle {
  brand: string;
  examYear: string;
  period: string;
  fullFormatted: string;
  displayShort: string;
  isStructured: boolean;
}

const BRAND_NAME_MAP: Record<string, string> = {
  insperia: 'Insperia',
  egeflex: 'EgeFlex',
  умшкола: 'Умскул',
  умскул: 'Умскул',
  вебиум: 'Вебиум',
  турбо: 'ТурбоЕГЭ',
  турбоегэ: 'ТурбоЕГЭ',
  фоксфорд: 'Фоксфорд',
  школково: 'Школково',
  '100балльный': '100балльный репетитор',
  '100балльный репетитор': '100балльный репетитор',
  егэленд: 'ЕГЭLand',
  egeland: 'ЕГЭLand',
  профиматика: 'Профиматика',
  душнила: 'Душнила',
  пифагор: 'Школа Пифагора',
  'ноо биология': 'НОО Биология',
  'ноо химия': 'НОО Химия',
  'ноо русский': 'НОО Русский язык',
  'умрусский долгих': 'Умскул · Русский (Долгих)',
  'умпрофиль шарафиев': 'Умскул · Профиль (Шарафиев)',
  'умхимия граева': 'Умскул · Химия (Граева)',
  'умфизика тесла': 'Умскул · Физика (Тесла)',
  'информатика с джобсом': '100балльный · Информатика (Джобс)',
  'легион с ильичом': '100балльный · Математика (Легион)',
  эбонит: '100балльный · Физика (Эбонит)',
  химфак: '100балльный · Химия (Химфак)',
  биофак: '100балльный · Биология (Биофак)',
  'новый русский': '100балльный · Русский (Оксана Кудлай)',
  'база отдыха с матеманей': '100балльный · База (Матеманя)',
  геофак: '100балльный · География (Геофак)',
  ламарк: '100балльный · Ламарк',
  флэш: '100балльный · Флэш',
  ликбез: '100балльный · Ликбез',
  гвардия: '100балльный · Гвардия',
  'смитап общество': 'Вебиум / Смитап · Обществознание',
  'смитап история': 'Вебиум / Смитап · История',
  'история и котики': 'Вебиум · История и Котики',
  'русский и котики': 'Вебиум · Русский и Котики',
  'английский и котики': 'Вебиум · Английский и Котики',
  'общество и котики': 'Вебиум · Общество и Котики',
  'егэналегке общество': 'ЕГЭ Налегке · Общество',
  'морозилка профиль': 'Морозилка · Профильная математика',
  'el русский': 'ЕГЭLand · Русский язык',
  'el общество': 'ЕГЭLand · Обществознание',
  'el английский': 'ЕГЭLand · Английский язык',
  'el литература': 'ЕГЭLand · Литература',
  'el история': 'ЕГЭLand · История',
  'el профиль': 'ЕГЭLand · Профильная математика',
  'el информатика': 'ЕГЭLand · Информатика',
  'el биология': 'ЕГЭLand · Биология',
  'el химия': 'ЕГЭLand · Химия',
  'el база': 'ЕГЭLand · Базовая математика',
  'el география': 'ЕГЭLand · География',
  'ehub физика': 'EHUB · Физика',
};

const PERIOD_NAME_MAP: Record<string, string> = {
  сентябрь: 'Сентябрь',
  октябрь: 'Октябрь',
  ноябрь: 'Ноябрь',
  декабрь: 'Декабрь',
  январь: 'Январь',
  февраль: 'Февраль',
  март: 'Март',
  апрель: 'Апрель',
  май: 'Май',
  июнь: 'Июнь',
  'первая часть': 'Часть 1',
  'вторая часть': 'Часть 2',
  'годовой курс': 'Годовой курс',
  годовой: 'Годовой курс',
};

function normalizeBrand(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (BRAND_NAME_MAP[lower]) {
    return BRAND_NAME_MAP[lower];
  }

  // Capitalize words cleanly
  return trimmed
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

function normalizeExam(raw: string): string {
  if (!raw) return '';
  let val = raw.trim();
  val = val.replace(/егэ/gi, 'ЕГЭ').replace(/огэ/gi, 'ОГЭ');
  return val;
}

function normalizePeriod(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (PERIOD_NAME_MAP[lower]) {
    return PERIOD_NAME_MAP[lower];
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Parses raw titles like "insperia // ЕГЭ 2027 | сентябрь" or "Русский // УмШкола // ОГЭ 2027 | сентябрь"
 */
export function parseCourseTitle(rawTitle: string): ParsedCourseTitle {
  if (!rawTitle) {
    return {
      brand: '',
      examYear: '',
      period: '',
      fullFormatted: '',
      displayShort: '',
      isStructured: false,
    };
  }

  const title = rawTitle.trim();

  // Check if title has double slash separator: e.g. "insperia // ЕГЭ 2027 | сентябрь"
  if (title.includes('//')) {
    const segments = title.split('//').map((s) => s.trim()).filter(Boolean);

    let brandRaw = '';
    let remainder = '';

    if (segments.length >= 3) {
      brandRaw = `${segments[1]} (${segments[0]})`;
      remainder = segments[2];
    } else {
      brandRaw = segments[0] || '';
      remainder = segments[1] || '';
    }

    let examRaw = '';
    let periodRaw = '';

    if (remainder.includes('|')) {
      const rightParts = remainder.split('|').map((s) => s.trim());
      examRaw = rightParts[0] || '';
      periodRaw = rightParts[1] || '';
    } else {
      examRaw = remainder;
    }

    const brand = normalizeBrand(brandRaw);
    const examYear = normalizeExam(examRaw);
    const period = normalizePeriod(periodRaw);

    let fullFormatted = brand;
    if (examYear && period) {
      fullFormatted = `${brand} — ${examYear} (${period})`;
    } else if (examYear) {
      fullFormatted = `${brand} — ${examYear}`;
    } else if (period) {
      fullFormatted = `${brand} (${period})`;
    }

    let displayShort = brand;
    if (period) {
      displayShort = `${brand} · ${period}`;
    }

    return {
      brand,
      examYear,
      period,
      fullFormatted,
      displayShort,
      isStructured: true,
    };
  }

  // Fallback for non-delimited titles
  return {
    brand: title,
    examYear: '',
    period: '',
    fullFormatted: title,
    displayShort: title,
    isStructured: false,
  };
}

/**
 * Returns a clean readable string without raw "//" and "|" symbols
 * Example: "insperia // ЕГЭ 2027 | сентябрь" -> "Insperia — ЕГЭ 2027 (Сентябрь)"
 */
export function formatCourseTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return parseCourseTitle(rawTitle).fullFormatted;
}

interface FormattedCourseTitleProps {
  title: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadges?: boolean;
}

/**
 * Polished visual component for displaying course titles with badges for exam and period
 */
export const FormattedCourseTitle: React.FC<FormattedCourseTitleProps> = ({
  title,
  size = 'md',
  className = '',
  showBadges = true,
}) => {
  const parsed = parseCourseTitle(title);

  if (!parsed.isStructured) {
    return <span className={className}>{title}</span>;
  }

  // Sizing styles
  let brandClass = 'font-black text-slate-900 dark:text-white';
  let badgeClass = 'text-[11px] px-2 py-0.5 rounded-md font-bold';

  if (size === 'xs' || size === 'sm') {
    brandClass = 'font-black text-xs sm:text-sm text-slate-900 dark:text-white';
    badgeClass = 'text-[10px] px-1.5 py-0.5 rounded-md font-extrabold';
  } else if (size === 'lg') {
    brandClass = 'font-black text-base sm:text-xl text-slate-900 dark:text-white leading-tight';
    badgeClass = 'text-xs px-2.5 py-0.5 rounded-lg font-bold';
  } else if (size === 'xl') {
    brandClass = 'font-black text-lg sm:text-2xl text-slate-900 dark:text-white leading-tight';
    badgeClass = 'text-xs sm:text-sm px-2.5 py-1 rounded-lg font-extrabold';
  }

  if (!showBadges) {
    return <span className={`${brandClass} ${className}`}>{parsed.fullFormatted}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      <span className={brandClass}>{parsed.brand}</span>

      {parsed.examYear && (
        <span
          className={`${badgeClass} bg-[#FF6B35]/15 text-[#FF6B35] dark:text-[#FF8C5A] border border-[#FF6B35]/20 shrink-0 select-none`}
        >
          {parsed.examYear}
        </span>
      )}

      {parsed.period && (
        <span
          className={`${badgeClass} bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shrink-0 select-none`}
        >
          {parsed.period}
        </span>
      )}
    </div>
  );
};
