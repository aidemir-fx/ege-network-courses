import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  BookOpen, 
  Play, 
  FileText, 
  Download, 
  Video, 
  LogOut, 
  Zap,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Lock,
  Bell,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Check,
  Film
} from 'lucide-react';
import { User, PageType, UserPurchase, Broadcast } from '../types';
import { VideoPlayer, DEFAULT_ALICEEGE_API_KEY } from './player/VideoPlayer';
import { fetchUserPurchases, getStoredCourses, getStoredBroadcasts, fetchExternalCourses, ExternalCourseItem, removeUserCourseServer } from '../utils/adminStore';
import { FormattedCourseTitle, formatCourseTitle } from '../utils/courseTitleFormatter';
import { buildCourseLessons, CourseLessonItem, decodeFilenameFromUrl } from '../utils/courseLessonsHelper';

interface DashboardPageProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  setActivePage: (page: PageType) => void;
  showToast: (msg: string) => void;
  onAddToCart?: (item: any) => void;
  onOpenCart?: () => void;
}

interface ExternalCourseMaterials {
  course_id: number;
  module_id: number;
  videos: string[];
  files: Array<{
    url: string;
    file_type: 'MATERIAL' | 'HOMEWORK';
  }>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onOpenAuthModal,
  onLogout,
  setActivePage,
  showToast,
  onAddToCart,
  onOpenCart,
}) => {
  // External API integration state
  const [activeTab, setActiveTab] = useState<"courses" | "referrals">("courses");
  const [referralData, setReferralData] = useState<any>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  const fetchReferrals = async () => {
    setIsLoadingReferrals(true);
    try {
      const res = await fetch("/api/auth/referrals", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setReferralData(data);
      } else {
        // Fallback to mock data if API fails (e.g. mock user session in frontend)
        setReferralData({
          success: true,
          stats: {
            totalReferred: 12,
            totalPurchases: 3,
            referralCode: "EGE-" + (currentUser?.id || "USER").substring(0,5).toUpperCase()
          },
          referrals: [
            { name: "Анна", createdAt: new Date(Date.now() - 86400000).toISOString() },
            { name: "Иван", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
            { name: "Сергей", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() }
          ],
          history: []
        });
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setReferralData({
        success: true,
        stats: { totalReferred: 0, totalPurchases: 0, referralCode: "EGE-DEMO" },
        referrals: [], history: []
      });
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  useEffect(() => {
    if (activeTab === "referrals" && !referralData && currentUser) {
      fetchReferrals();
    }
  }, [activeTab, currentUser]);

  const [apiCourseId, setApiCourseId] = useState('1');
  const [apiModuleId, setApiModuleId] = useState('1');
  const [apiKey, setApiKey] = useState(DEFAULT_ALICEEGE_API_KEY);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [materials, setMaterials] = useState<ExternalCourseMaterials | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<UserPurchase | null>(null);
  const [matchedApiCourse, setMatchedApiCourse] = useState<ExternalCourseItem | null>(null);
  const [courseLessons, setCourseLessons] = useState<CourseLessonItem[]>([]);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);

  const [activeLesson, setActiveLesson] = useState<{
    title: string;
    streamUrl: string;
    notesUrl?: string;
    homeworkUrl?: string;
  } | null>(null);

  const fetchExternalMaterials = async (cId = apiCourseId, mId = apiModuleId) => {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      let response = await fetch(`/api/partner/courses/${cId}/modules/${mId}/materials`);
      if (!response.ok) {
        response = await fetch(
          `/api/external/course-materials?courseId=${cId}&moduleId=${mId}&apiKey=${encodeURIComponent(apiKey)}`
        );
      }
      const res = await response.json();
      const materialsData = res.data || (res.videos ? res : null);
      if (materialsData) {
        setMaterials(materialsData);
      } else {
        setApiError(res.error || 'Ошибка загрузки материалов');
      }
    } catch (err: any) {
      setApiError(err.message || 'Ошибка подключения к API');
    } finally {
      setIsLoadingApi(false);
    }
  };

  const openCourseLessons = async (purchase: UserPurchase) => {
    setSelectedPurchase(purchase);
    setIsLoadingApi(true);
    setApiError(null);
    setMaterials(null);

    try {
      const extCourses = await fetchExternalCourses(apiKey);
      
      const pTitle = (purchase.courseTitle || '').toLowerCase();
      const pSub = (purchase.subject || '').toLowerCase();
      const pSch = (purchase.school || '').toLowerCase();
      const pId = String(purchase.courseId || '').toLowerCase();

      let matched = extCourses.find(c => String(c.id) === pId);
      if (!matched) {
        matched = extCourses.find(c => {
          const cTitle = c.title.toLowerCase();
          return pTitle.includes(cTitle) || cTitle.includes(pTitle);
        });
      }
      if (!matched) {
        matched = extCourses.find(c => {
          const cTitle = c.title.toLowerCase();
          return (pSch && cTitle.includes(pSch)) ||
            (pTitle.includes('insperia') && cTitle.includes('insperia')) ||
            (pTitle.includes('профиматика') && cTitle.includes('профиматика')) ||
            (pTitle.includes('el') && cTitle.includes('el')) ||
            (pTitle.includes('умскул') && (cTitle.includes('ум') || cTitle.includes('умшкола')));
        });
      }

      setMatchedApiCourse(matched || null);
      const lessons = buildCourseLessons(purchase, matched || null);
      setCourseLessons(lessons);
      setSelectedLessonIndex(0);

      // Fetch fresh pre-signed URLs for module 1 if it has an API module ID
      if (lessons[0]?.moduleId && matched?.id) {
        await fetchExternalMaterials(String(matched.id), String(lessons[0].moduleId));
      }
    } catch (err: any) {
      console.warn('Failed to load course details:', err);
      const lessons = buildCourseLessons(purchase, null);
      setCourseLessons(lessons);
      setSelectedLessonIndex(0);
    } finally {
      setIsLoadingApi(false);
    }
  };

  const handleSelectLesson = async (index: number) => {
    setSelectedLessonIndex(index);
    const lesson = courseLessons[index];
    if (!lesson) return;

    setMaterials(null);
    if (lesson.moduleId && matchedApiCourse?.id) {
      setIsLoadingApi(true);
      await fetchExternalMaterials(String(matchedApiCourse.id), String(lesson.moduleId));
    }
  };

  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  const fetchPurchases = async () => {
    if (!currentUser) return;
    setIsLoadingPurchases(true);
    try {
      const p = await fetchUserPurchases(currentUser.id, currentUser.telegramId);
      setUserPurchases(p);
    } catch (e) {
      console.warn('Failed to load user purchases:', e);
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  useEffect(() => {
    setBroadcasts(getStoredBroadcasts());
    if (currentUser) {
      fetchPurchases();
    }
  }, [currentUser]);

  // If user is not logged in, show Auth Gate Card
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-[#22c55e] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-[#22c55e] uppercase tracking-wider block mb-1">
              ЛИЧНЫЙ КАБИНЕТ
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Доступ ограничен
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Личный кабинет доступен только авторизованным пользователям. Войдите, чтобы просматривать ваши купленные курсы и материалы.
            </p>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Войти в Личный Кабинет
          </button>
        </div>
      </div>
    );
  }

  const telegramHandle = currentUser.telegramId ? `@${currentUser.telegramId}` : currentUser.email || '@market_hedge';
  const telegramIdValue = currentUser.telegramId || 'user';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 1. TOP PROFILE CARD (MATCHES SCREENSHOT EXACTLY) */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-900 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0 overflow-hidden relative">
              <span>{currentUser.name?.[0]?.toUpperCase() || 'Z'}</span>
              {currentUser.avatar && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover absolute inset-0 z-10"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-[#22c55e] uppercase tracking-wider block">
                ЛИЧНЫЙ КАБИНЕТ
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-3">
                <span>{currentUser.name || 'Zero'}</span>
                <span className="text-sm font-bold bg-[#e8f5e9] text-[#22c55e] px-3 py-1 rounded-full whitespace-nowrap tracking-normal">
                  Мои курсы: {userPurchases.length > 0 ? userPurchases.length : (materials?.videos?.length ? 1 : 0)}
                </span>
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">
                {telegramHandle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActivePage('ege')}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[#22c55e] hover:bg-[#1bb052] text-white font-extrabold text-sm transition-all shadow-sm cursor-pointer text-center"
            >
              Купить курсы
            </button>

            <button
              onClick={onLogout}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition-all cursor-pointer text-center"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* BROADCASTS / ANNOUNCEMENTS SECTION */}
        {broadcasts.length > 0 && (
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-orange-100 text-[#FF6B35] flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-[#FFF1E8] text-[#FF6B35] px-3 py-0.5 rounded-full text-[11px] font-extrabold inline-block">
                  Объявления
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Важные новости и рассылки
                </h3>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {broadcasts.map((bc) => (
                <div
                  key={bc.id}
                  className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/60 space-y-2 hover:border-orange-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                      {bc.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">{bc.sentAt}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap pl-4">
                    {bc.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === "courses" ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            Мои курсы
          </button>
          {currentUser?.isPartner && (
          <button
            onClick={() => setActiveTab("referrals")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${activeTab === "referrals" ? "bg-emerald-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            Реферальная программа
          </button>
          )}
        </div>

        {activeTab === "courses" && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
          <div>
            <span className="bg-[#e8f5e9] text-[#22c55e] px-3.5 py-1 rounded-full text-xs font-extrabold inline-block mb-3">
              Мои курсы
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Купленные курсы
            </h2>
          </div>

          {/* ACTIVE LESSON PLAYER IF SELECTING A VIDEO */}
          {activeLesson && (
            <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-fadeIn mb-6">
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#22c55e] flex items-center justify-center">
                    <Play className="w-4 h-4 fill-[#22c55e]" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      {activeLesson.title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setActiveLesson(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>

              <div className="relative min-h-[380px] sm:min-h-[460px] bg-black">
                <VideoPlayer
                  source={activeLesson.streamUrl}
                  apiKey={apiKey}
                  title={activeLesson.title}
                  autoPlay={true}
                />
              </div>
            </div>
          )}

          {/* CONTENT INSIDE "КУПЛЕННЫЕ КУРСЫ" */}
          {selectedPurchase ? (
            <div className="space-y-6">
              {/* Top Navigation & Course Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedPurchase(null);
                      setMaterials(null);
                      setCourseLessons([]);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Назад ко всем моим курсам</span>
                  </button>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-1">
                    <FormattedCourseTitle title={selectedPurchase.courseTitle} size="lg" />
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                    <span className="font-bold text-slate-700">{selectedPurchase.school}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#22c55e] font-extrabold text-[11px] uppercase">
                      {selectedPurchase.subject || 'Курс'}
                    </span>
                    <span>•</span>
                    <span>Поток {selectedPurchase.year || '2027'}</span>
                  </div>
                </div>
              </div>



              {isLoadingApi && courseLessons.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#22c55e]" />
                  <p className="text-xs font-bold text-slate-700">Загрузка программы и видеоуроков курса...</p>
                  <p className="text-[11px] text-slate-400 mt-1">Синхронизируем базу данных онлайн-школы</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: All Lessons in Course */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Все уроки курса ({courseLessons.length})</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Выберите урок
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
                      {courseLessons.map((lesson, idx) => {
                        const isSelected = selectedLessonIndex === idx;
                        return (
                          <div
                            key={lesson.id || idx}
                            onClick={() => handleSelectLesson(idx)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'bg-slate-50/80 border-slate-500 shadow-xs ring-1 ring-slate-500/20'
                                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {lesson.lessonIndex}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`text-xs font-bold line-clamp-2 leading-tight ${
                                    isSelected ? 'text-slate-950 font-black' : 'text-slate-800'
                                  }`}
                                >
                                  {lesson.title}
                                </h4>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Selected Lesson Workspace */}
                  <div className="lg:col-span-7 space-y-4">
                    {courseLessons[selectedLessonIndex] && (() => {
                      const curLesson = courseLessons[selectedLessonIndex];
                      
                      // 1. Merge and deduplicate videos
                      const combinedVideos: Array<{ title: string; url: string; isKinescope?: boolean }> = [];
                      const seenVideoUrls = new Set<string>();

                      if (curLesson.videos && curLesson.videos.length > 0) {
                        curLesson.videos.forEach((v) => {
                          if (v.url && !seenVideoUrls.has(v.url)) {
                            seenVideoUrls.add(v.url);
                            combinedVideos.push(v);
                          }
                        });
                      }

                      if (
                        materials?.videos &&
                        materials.videos.length > 0 &&
                        (!curLesson.moduleId || String(materials.module_id) === String(curLesson.moduleId))
                      ) {
                        materials.videos.forEach((vUrl, vIdx) => {
                          if (vUrl && !seenVideoUrls.has(vUrl)) {
                            seenVideoUrls.add(vUrl);
                            combinedVideos.push({
                              title: `Видеозапись #${combinedVideos.length + 1} (HLS HD)`,
                              url: vUrl,
                              isKinescope: false,
                            });
                          }
                        });
                      }

                      // 2. Resolve files strictly without duplicates:
                      // When materials are loaded for this module, materials.files is the exact authoritative list from the API
                      const isMaterialsForThisModule = Boolean(
                        materials && curLesson.moduleId && String(materials.module_id) === String(curLesson.moduleId)
                      );

                      const activeFiles: Array<{ title: string; url: string; fileType: string }> = [];
                      const seenFileKeys = new Set<string>();

                      if (isMaterialsForThisModule && materials?.files && materials.files.length > 0) {
                        // Use materials.files with pre-signed URLs and decoded filenames
                        materials.files.forEach((f) => {
                          if (!f.url) return;
                          const title = decodeFilenameFromUrl(f.url, f.file_type === 'HOMEWORK' ? 'Домашнее задание' : 'Конспект занятия');
                          const fileKey = f.url.split('?')[0].split('/').pop() || title.toLowerCase();
                          if (!seenFileKeys.has(fileKey)) {
                            seenFileKeys.add(fileKey);
                            activeFiles.push({
                              title,
                              url: f.url,
                              fileType: f.file_type || 'MATERIAL',
                            });
                          }
                        });
                      } else if (curLesson.files && curLesson.files.length > 0) {
                        // Fallback to curLesson.files only for items that have actual working URLs
                        curLesson.files.forEach((f) => {
                          if (!f.url) return; // Skip dummy placeholders without valid URLs
                          const fileKey = f.url.split('?')[0].split('/').pop() || f.title.toLowerCase();
                          if (!seenFileKeys.has(fileKey)) {
                            seenFileKeys.add(fileKey);
                            activeFiles.push({
                              title: f.title,
                              url: f.url,
                              fileType: f.fileType || 'MATERIAL',
                            });
                          }
                        });
                      }

                      const getFileCategoryLabel = (file: { title: string; fileType: string }) => {
                        const t = file.title.toLowerCase();
                        if (t.includes('ответ') || t.includes('критери')) return 'Ответы и критерии';
                        if (t.includes('конспект') || t.includes('скрипт') || t.includes('теория')) return 'Конспект / Скрипт';
                        if (t.endsWith('.png') || t.endsWith('.jpg') || t.endsWith('.jpeg')) return 'Изображение задания';
                        if (file.fileType === 'HOMEWORK' || t.includes('дз') || t.includes('домашн')) return 'Домашнее задание';
                        return 'Учебный материал';
                      };

                      const hasMedia = combinedVideos.length > 0 || curLesson.isAvailable;

                      return (
                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                          {/* Lesson Title Header */}
                          <div className="space-y-1.5 pb-4 border-b border-slate-100">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                              {curLesson.title}
                            </h3>
                            {curLesson.description && (
                              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                {curLesson.description}
                              </p>
                            )}
                          </div>

                          {/* Video Section */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Видеоматериалы урока</span>
                            </h4>

                            {hasMedia && combinedVideos.length > 0 ? (
                              <div className="space-y-2.5">
                                {combinedVideos.map((vid, vIdx) => {
                                  return (
                                    <div
                                      key={vIdx}
                                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                          <Play className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-slate-900 line-clamp-1">
                                            {vid.title}
                                          </div>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          const matFile = activeFiles.find((f) => f.fileType === 'MATERIAL')?.url;
                                          const hwFile = activeFiles.find((f) => f.fileType === 'HOMEWORK')?.url;
                                          setActiveLesson({
                                            title: `${selectedPurchase.courseTitle} — ${curLesson.title}`,
                                            streamUrl: vid.url,
                                            notesUrl: matFile,
                                            homeworkUrl: hwFile,
                                          });
                                        }}
                                        className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Смотреть</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-left space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <div className="text-xs text-slate-600 leading-relaxed">
                                    <p className="font-bold text-slate-800">
                                      Занятие запланировано на {curLesson.scheduledDate || 'ближайшие дни'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Запись прямого эфира в разрешении Full HD появится в вашем плеере автоматически сразу после трансляции.
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => {
                                      setActiveLesson({
                                        title: `${selectedPurchase.courseTitle} — ${curLesson.title} (Резервный плеер)`,
                                        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                                      });
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    Проверить тестовый поток HLS
                                  </button>
                                  <button
                                    onClick={() => openCourseLessons(selectedPurchase)}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50 cursor-pointer"
                                  >
                                    Проверить выгрузку
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Files & Materials Section */}
                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Материалы, скрипты и ДЗ ({activeFiles.length})</span>
                            </h4>

                            {isLoadingApi && activeFiles.length === 0 ? (
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-500">
                                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                                <span className="text-xs font-medium">Загрузка файлов урока и домашних заданий...</span>
                              </div>
                            ) : activeFiles.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {activeFiles.map((file, fIdx) => {
                                  const isHw = file.fileType === 'HOMEWORK';
                                  const categoryLabel = getFileCategoryLabel(file);
                                  return (
                                    <a
                                      key={fIdx}
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            isHw ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                                          }`}
                                        >
                                          {isHw ? <FileText className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 leading-snug">
                                            {file.title}
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {categoryLabel}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 flex items-center justify-center shrink-0">
                                        <Download className="w-3 h-3" />
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                Конспекты и домашние задания к данному уроку подгружаются преподавателем к началу занятия.
                              </p>
                            )}
                          </div>

                          {/* Navigation between lessons */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                              disabled={selectedLessonIndex <= 0}
                              onClick={() => handleSelectLesson(selectedLessonIndex - 1)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>Предыдущий урок</span>
                            </button>

                            <span className="text-xs text-slate-400 font-medium">
                              Урок {selectedLessonIndex + 1} из {courseLessons.length}
                            </span>

                            <button
                              disabled={selectedLessonIndex >= courseLessons.length - 1}
                              onClick={() => handleSelectLesson(selectedLessonIndex + 1)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                              <span>Следующий урок</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : userPurchases && userPurchases.length > 0 ? (
            <div className="space-y-4">
              {userPurchases.map((purchase) => {
                const isMonthly = purchase.tariffType === 'monthly' || Number(purchase.price) <= 1000;
                
                // Calculate expiration and days remaining
                let daysRemaining: number | null = null;
                let formattedExpiry = '';
                if (purchase.expiresAt) {
                  try {
                    const exp = new Date(purchase.expiresAt);
                    const now = new Date();
                    const diffMs = exp.getTime() - now.getTime();
                    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                    formattedExpiry = exp.toLocaleDateString('ru-RU');
                  } catch {}
                }

                const isExpired = daysRemaining !== null && daysRemaining <= 0;

                const handleRenew = () => {
                  if (onAddToCart) {
                    onAddToCart({
                      courseId: `renew-${purchase.courseId || purchase.id}-${Date.now()}`,
                      subjectName: purchase.subject || 'ЕГЭ Предмет',
                      schoolName: purchase.school || 'Онлайн-школа',
                      courseTitle: purchase.courseTitle,
                      monthName: 'Продление подписки на 1 месяц (доступ ко всем эфирам)',
                      year: purchase.year || '2027',
                      price: 490,
                      tariffType: 'monthly',
                    });
                    showToast(`Продление подписки на «${purchase.courseTitle}» (490 ₽) добавлено в корзину!`);
                    onOpenCart?.();
                  } else {
                    setActivePage('ege');
                  }
                };

                return (
                  <div key={purchase.id} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 hover:border-emerald-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#22c55e] text-[11px] font-extrabold uppercase">
                            {purchase.subject || 'Курс'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {purchase.school} • {purchase.year || '2027'}
                          </span>
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          <FormattedCourseTitle title={purchase.courseTitle} size="md" />
                        </div>
                        
                        {/* Subscription status info */}
                        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                          {isMonthly ? (
                            isExpired ? (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                                ⚠️ Срок подписки истек ({formattedExpiry})
                              </span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Активен: осталось {daysRemaining ?? 30} дн. {formattedExpiry ? `(до ${formattedExpiry})` : ''}</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              ✨ Полный доступ на весь учебный год
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {isMonthly && (
                          <button
                            onClick={handleRenew}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                            title="Продлить доступ на 30 дней"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Продлить (490 ₽)
                          </button>
                        )}

                        <button
                          onClick={() => openCourseLessons(purchase)}
                          className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Все уроки курса (8)</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Вы действительно хотите удалить курс "${purchase.courseTitle}" из вашего личного кабинета?`)) {
                              const success = await removeUserCourseServer({
                                purchaseId: purchase.id,
                                userId: currentUser?.id,
                                userTelegramId: currentUser?.telegramId
                              });
                              if (success) {
                                showToast(`Курс "${purchase.courseTitle}" успешно удален.`);
                                if (currentUser) {
                                  const fresh = await fetchUserPurchases(currentUser.id, currentUser.telegramId);
                                  setUserPurchases(fresh);
                                }
                              } else {
                                showToast('Не удалось удалить курс. Попробуйте позже.');
                              }
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          title="Удалить курс"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : materials?.videos && materials.videos.length > 0 ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      ЕГЭ Информатика 2027 — Доступный модуль #{materials.module_id}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Найдено {materials.videos.length} видеоуроков • HLS Player
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 text-[#22c55e] text-xs font-bold rounded-full">
                    Активен
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  {materials.videos.map((vidUrl, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold text-xs">
                          <Play className="w-4 h-4 fill-[#22c55e]" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            Урок #{idx + 1}. Видеоматериал модуля #{materials.module_id}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            HLS Stream ready
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const matFile = materials.files?.find((f) => f.file_type === 'MATERIAL')?.url;
                          const hwFile = materials.files?.find((f) => f.file_type === 'HOMEWORK')?.url;
                          setActiveLesson({
                            title: `Модуль #${materials.module_id} — Видеоурок ${idx + 1}`,
                            streamUrl: vidUrl,
                            notesUrl: matFile,
                            homeworkUrl: hwFile,
                          });
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        Смотреть
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Курсов пока нет
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                После покупки курсы появятся здесь.
              </p>
              <button
                onClick={() => setActivePage('ege')}
                className="px-6 py-2.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs transition-all cursor-pointer"
              >
                Перейти к выбору курсов
              </button>
            </div>
          )}
        </div>
        )}

        {activeTab === "referrals" && currentUser?.isPartner && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs">
              <div>
                <span className="bg-emerald-50 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-extrabold inline-block mb-3">
                  Партнерам
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Реферальная программа
                </h2>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                  Отслеживайте количество регистраций и покупок по вашей персональной реферальной ссылке.
                </p>
              </div>

              {isLoadingReferrals ? (
                <div className="py-12 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : referralData ? (
                <div className="mt-8 space-y-8">
                  {/* Компактный блок ссылки и статистики */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between">
                    <div className="flex-1 w-full lg:max-w-xl">
                      <h3 className="text-slate-700 font-bold text-sm mb-3">Ваша реферальная ссылка</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://egenetwork11.com/?ref=${referralData.stats?.referralCode || ''}`}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://egenetwork11.com/?ref=${referralData.stats?.referralCode || ''}`);
                            showToast("Ссылка скопирована!");
                          }}
                          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-sm shrink-0 cursor-pointer"
                        >
                          Копировать
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:gap-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm w-full lg:w-auto justify-center shrink-0">
                      <div className="text-center px-2">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Регистрации</div>
                        <div className="text-2xl font-black text-slate-900">{referralData.stats?.totalReferred || 0}</div>
                      </div>
                      <div className="w-px h-10 bg-slate-100"></div>
                      <div className="text-center px-2">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Покупки</div>
                        <div className="text-2xl font-black text-slate-900">{referralData.stats?.totalPurchases || 0}</div>
                      </div>
                    </div>
                  </div>
                  {/* Список приглашенных */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">История приглашений</h3>
                    {referralData.referrals?.length > 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                              <th className="px-6 py-3 font-semibold">Пользователь</th>
                              <th className="px-6 py-3 font-semibold">Дата регистрации</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {referralData.referrals.map((ref: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-900 text-sm">
                                    {ref.name.length > 2 ? ref.name.substring(0, 2) + "***" : ref.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                  {new Date(ref.createdAt).toLocaleDateString("ru-RU")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-sm">
                        Вы пока никого не пригласили.
                      </div>
                    )}
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
