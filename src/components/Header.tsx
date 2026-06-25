import React, { useRef, useEffect } from 'react';
import {
  Activity, Users, BookOpen, Calendar, Award,
  Sun, Moon, Bell, X, PlusCircle, Search, Menu, ChevronDown, ChevronLeft
} from 'lucide-react';
import { LanguageKey, translations } from '../translations';
import { NotificationItem } from '../types';

interface HeaderProps {
  t: Record<string, string>;
  lang: LanguageKey;
  role: 'coach' | 'student';
  theme: 'light' | 'dark';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notifications: NotificationItem[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (v: boolean) => void;
  isNotiHistoryOpen: boolean;
  setIsNotiHistoryOpen: (v: boolean) => void;
  selectedNotiId: string | null;
  setSelectedNotiId: (v: string | null) => void;
  newNoti: Partial<NotificationItem> | null;
  setNewNoti: (v: Partial<NotificationItem> | null) => void;
  handleRoleToggle: (role: 'coach' | 'student') => void;
  handleLangToggle: (lang: LanguageKey) => void;
  handleThemeToggle: () => void;
  handleSaveNoti: (e: React.FormEvent) => void;
  handleDeleteNoti: (id: string) => void;
  translateViToEn: (text: string) => Promise<string | null>;
  translationTimeoutRef: React.MutableRefObject<Record<string, NodeJS.Timeout>>;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  navStack: string[];
  goBack: () => void;
  sortedNotifications: NotificationItem[];
}

export default function Header({
  t, lang, role, theme, searchQuery, setSearchQuery,
  notifications, isMobileMenuOpen, setIsMobileMenuOpen,
  isMobileSearchOpen, setIsMobileSearchOpen,
  isNotiHistoryOpen, setIsNotiHistoryOpen,
  selectedNotiId, setSelectedNotiId,
  newNoti, setNewNoti,
  handleRoleToggle, handleLangToggle, handleThemeToggle,
  handleSaveNoti, handleDeleteNoti,
  translateViToEn, translationTimeoutRef,
  setActiveTab, activeTab, navStack, goBack, sortedNotifications
}: HeaderProps) {
  const notiRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isNotiHistoryOpen) return;
    function handleClick(e: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setIsNotiHistoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isNotiHistoryOpen, setIsNotiHistoryOpen]);

  return (
    <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 sticky top-0 z-30 shadow-xl" style={{ paddingTop: 'var(--sat)' }}>
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* LEFT: BACK + APP BRAND */}
          <div className="flex items-center gap-3">
            {navStack.length > 0 && (
              <button
                onClick={goBack}
                className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div onClick={() => { setActiveTab('dashboard'); }} className="flex items-center gap-1.5 cursor-pointer">
              <img src="/pwa-192x192.png" alt="PP" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-rose-500/20" />
              <div className="flex flex-col leading-none">
                <h1 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight leading-[16px]">{t.appTitle}</h1>
                <span className="text-[9px] font-mono text-rose-500 font-bold uppercase tracking-wider leading-[10px]">Combat never ends</span>
              </div>
            </div>
          </div>

          {/* RIGHT: THEME & TOOLS */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-rose-500" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => handleLangToggle(lang === 'vi' ? 'en' : 'vi')}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 text-[10px] font-black text-zinc-600 dark:text-zinc-400 cursor-pointer"
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>


            {/* NOTIFICATIONS */}
            <div className="relative" ref={notiRef}>
              <button
                onClick={() => setIsNotiHistoryOpen(!isNotiHistoryOpen)}
                className="relative p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-zinc-400" />
                {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-zinc-950 rounded-full text-[6px] font-black text-white flex items-center justify-center animate-pulse">
                    {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length}
                  </span>
                )}
              </button>

              {isNotiHistoryOpen && (
                  <div className="absolute right-0 mt-3.5 z-50 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl p-4 space-y-3 font-sans animate-slideDown overflow-visible">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" />
                        {lang === 'vi' ? 'Thông báo' : 'Notifications'}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded-full font-bold">
                        {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length}
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 no-scrollbar-y">
                      {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length > 0 ? (
                        sortedNotifications.filter(n => role === 'coach' || n.isPublic).map((noti) => (
                          <div
                            key={noti.id}
                            onClick={() => { setSelectedNotiId(noti.id); setIsNotiHistoryOpen(false); }}
                            className={`p-2.5 rounded-xl space-y-1 text-left relative group cursor-pointer transition-all ${
                              selectedNotiId === noti.id
                                ? 'bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800'
                                : 'bg-zinc-50 dark:bg-zinc-950/65 border border-zinc-150 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="bg-zinc-200 dark:bg-zinc-800 text-[8px] text-zinc-650 dark:text-zinc-450 font-mono px-1 py-0.5 rounded font-bold">{noti.date}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[7px] uppercase font-black tracking-wider border ${
                                noti.type === 'success'
                                  ? 'bg-emerald-500/10 text-emerald-655 dark:text-emerald-400 border-emerald-500/20'
                                  : noti.type === 'warning'
                                    ? 'bg-amber-500/10 text-amber-655 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-sky-500/10 text-sky-650 dark:text-sky-400 border-sky-500/20'
                              }`}>
                                {lang === 'vi' ? (noti.type === 'success' ? 'Thành công' : noti.type === 'warning' ? 'Cảnh báo' : 'Thông tin') : noti.type.toUpperCase()}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-zinc-900 dark:text-white tracking-tight">
                              {lang === 'vi' ? noti.titleVI : noti.titleEN}
                            </h5>
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-450 leading-relaxed line-clamp-2">
                              {lang === 'vi' ? noti.contentVI : noti.contentEN}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic text-center py-4">{t.noNoti}</p>
                      )}
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH OVERLAY ROW */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-2 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 animate-slideDown">
          <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0 animate-pulse" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer font-bold shrink-0 ml-1.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* TABS NAVIGATION PANEL (DESKTOP ONLY) */}
      <div className="hidden md:block bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-1.5 min-w-max">
            {[
              { id: 'dashboard', label: t.tabDashboard, icon: <Activity className="w-4 h-4" /> },
              { id: 'students', label: t.tabStudents, icon: <Users className="w-4 h-4" /> },
              { id: 'curriculum', label: t.tabCurriculum, icon: <BookOpen className="w-4 h-4" /> },
              { id: 'sessions', label: t.tabSessions, icon: <Calendar className="w-4 h-4" /> },
              { id: 'about', label: t.tabAbout, icon: <Award className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-rose-500 text-rose-500'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-750'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE SETTINGS DRAWER (HAMBURGER MENU) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-80 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-white p-5 shadow-2xl h-full animate-slideRight" style={{ paddingTop: 'calc(1.25rem + var(--sat,0px))', paddingBottom: 'var(--sab,0px)' }}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-rose-500" />
                <span className="font-black text-xs uppercase tracking-wider text-rose-500">
                  {lang === 'vi' ? 'Cài đặt' : 'Settings'}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-6 no-scrollbar">
              {/* ROLE PICKER */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === 'vi' ? 'Vai Trò' : 'User Role'}
                </span>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => { handleRoleToggle('coach'); setIsMobileMenuOpen(false); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      role === 'coach' ? 'bg-rose-600 text-white shadow-sm font-black' : 'text-zinc-400'
                    }`}
                  >
                    🛠 {lang === 'vi' ? 'HLV' : 'Coach'}
                  </button>
                  <button
                    onClick={() => { handleRoleToggle('student'); setIsMobileMenuOpen(false); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      role === 'student' ? 'bg-rose-600 text-white shadow-sm font-black' : 'text-zinc-400'
                    }`}
                  >
                    👥 {lang === 'vi' ? 'Học Viên' : 'Student'}
                  </button>
                </div>
              </div>

              {/* LANGUAGE PICKER */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === 'vi' ? 'Ngôn ngữ' : 'Language'}
                </span>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => handleLangToggle('vi')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      lang === 'vi' ? 'bg-zinc-800 text-rose-500 font-black border border-zinc-700' : 'text-zinc-400'
                    }`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    onClick={() => handleLangToggle('en')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      lang === 'en' ? 'bg-zinc-800 text-rose-500 font-black border border-zinc-700' : 'text-zinc-400'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* QUICK NAV */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === 'vi' ? 'Điều hướng' : 'Navigation'}
                </span>
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: t.tabDashboard, icon: <Activity className="w-4 h-4" /> },
                    { id: 'students', label: t.tabStudents, icon: <Users className="w-4 h-4" /> },
                    { id: 'curriculum', label: t.tabCurriculum, icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'sessions', label: t.tabSessions, icon: <Calendar className="w-4 h-4" /> },
                    { id: 'about', label: t.tabAbout, icon: <Award className="w-4 h-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-rose-600/10 text-rose-500 border border-rose-500/20'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
