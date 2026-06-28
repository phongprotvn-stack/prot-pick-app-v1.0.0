import React, { useRef, useEffect, useState } from 'react';
import {
  Activity, Users, BookOpen, Calendar, Award,
  Sun, Moon, Bell, X, PlusCircle, Search, Menu,
  ChevronDown, ChevronLeft, ChevronRight,
  HelpCircle, Star, Share2, Copy, Check, Edit2, Trash2, GripVertical
} from 'lucide-react';
import { LanguageKey, translations } from '../translations';
import { NotificationItem } from '../types';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HelpCategory } from '../types';

interface SortableHelpItemProps {
  key?: string;
  cat: HelpCategory;
  lang: LanguageKey;
  role: 'coach' | 'student';
  editForm: { titleVI: string; titleEN: string; contentVI: string; contentEN: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ titleVI: string; titleEN: string; contentVI: string; contentEN: string }>>;
  editingCatId: string | null;
  helpExpandedId: string | null;
  setHelpExpandedId: (v: string | null) => void;
  setEditingCatId: (v: string | null) => void;
  handleSaveEdit: (id: string) => void;
  handleEditCategory: (cat: HelpCategory) => void;
  handleDeleteCategory: (id: string) => void;
}

function SortableHelpItem({
  cat, lang, role, editForm, setEditForm,
  editingCatId, helpExpandedId, setHelpExpandedId, setEditingCatId,
  handleSaveEdit, handleEditCategory, handleDeleteCategory,
}: SortableHelpItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isExpanded = helpExpandedId === cat.id;
  const isEditing = editingCatId === cat.id;

  return (
    <div ref={setNodeRef} style={style} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      {isEditing ? (
        /* ── INLINE EDIT FORM ── */
        <div className="p-4 space-y-3">
          {lang === 'vi' ? (
            <>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tiêu đề</label>
              <input value={editForm.titleVI} onChange={e => setEditForm(f => ({ ...f, titleVI: e.target.value }))}
                className="w-full text-sm p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-black dark:text-white" />
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nội dung</label>
              <textarea value={editForm.contentVI} onChange={e => setEditForm(f => ({ ...f, contentVI: e.target.value }))} rows={4}
                className="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-black dark:text-white" />
            </>
          ) : (
            <>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Title</label>
              <input value={editForm.titleEN} onChange={e => setEditForm(f => ({ ...f, titleEN: e.target.value }))}
                className="w-full text-sm p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-black dark:text-white" />
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Content</label>
              <textarea value={editForm.contentEN} onChange={e => setEditForm(f => ({ ...f, contentEN: e.target.value }))} rows={4}
                className="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-black dark:text-white" />
            </>
          )}
          <div className="flex gap-2">
            <button onClick={() => handleSaveEdit(cat.id)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
              {lang === 'vi' ? 'Lưu' : 'Save'}
            </button>
            <button onClick={() => setEditingCatId(null)}
              className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-xs font-bold py-2 rounded-xl cursor-pointer">
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : (
        /* ── VIEW MODE ── */
        <>
          <div className="flex items-center">
            {role === 'coach' && (
              <button {...attributes} {...listeners}
                className="p-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing touch-none">
                <GripVertical className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setHelpExpandedId(isExpanded ? null : cat.id)}
              className="flex-1 flex items-center justify-between py-3 pr-4 text-left cursor-pointer"
            >
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{lang === 'vi' ? cat.titleVI : cat.titleEN}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-140 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {isExpanded && (
            <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line border-t border-zinc-100 dark:border-zinc-800 pt-3">
              {lang === 'vi' ? cat.contentVI : cat.contentEN}
            </div>
          )}
          {/* Coach edit/delete buttons */}
          {role === 'coach' && (
            <div className="flex justify-end gap-1.5 px-4 pb-3">
              <button onClick={() => handleEditCategory(cat)}
                className="text-[10px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer">
                <Edit2 className="w-3 h-3" /> {lang === 'vi' ? 'Sửa' : 'Edit'}
              </button>
              <button onClick={() => handleDeleteCategory(cat.id)}
                className="text-[10px] font-bold text-red-600 hover:text-red-500 flex items-center gap-1 cursor-pointer">
                <Trash2 className="w-3 h-3" /> {lang === 'vi' ? 'Xóa' : 'Delete'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
  dbCoachPin: string;
  setRole: (r: 'coach' | 'student') => void;
  showToast: (msg: string) => void;
  helpCategories: import('../types').HelpCategory[];
  syncHelpCategories: (data: import('../types').HelpCategory[]) => void;
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
  setActiveTab, activeTab, navStack, goBack, sortedNotifications,
  dbCoachPin, setRole, showToast,
  helpCategories, syncHelpCategories,
}: HeaderProps) {
  const notiRef = useRef<HTMLDivElement>(null);
  const [isPinInputOpen, setIsPinInputOpen] = useState(false);
  const [menuPinInput, setMenuPinInput] = useState('');
  const [menuPinError, setMenuPinError] = useState('');
  const [pinDisplayP, setPinDisplayP] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Sub-view states for hamburger menu
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [helpExpandedId, setHelpExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Edit states for help categories ──
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ titleVI: '', titleEN: '', contentVI: '', contentEN: '' });
  function handleAddCategory() {
    const id = 'cat_' + Date.now();
    const defaults = lang === 'vi'
      ? { titleVI: '📝 Danh mục mới', titleEN: '', contentVI: 'Nội dung...', contentEN: '' }
      : { titleVI: '', titleEN: '📝 New Category', contentVI: '', contentEN: 'Content...' };
    syncHelpCategories([...helpCategories, { id, ...defaults }]);
    setEditingCatId(id);
    setEditForm(defaults);
  }
  function handleEditCategory(cat: import('../types').HelpCategory) { setEditingCatId(cat.id); setEditForm({ titleVI: cat.titleVI, titleEN: cat.titleEN, contentVI: cat.contentVI, contentEN: cat.contentEN }); }
  function handleSaveEdit(id: string) { syncHelpCategories(helpCategories.map(c => c.id === id ? { ...c, ...editForm } : c)); setEditingCatId(null); }
  function handleDeleteCategory(id: string) {
    if (!confirm(lang === 'vi' ? 'Xóa danh mục này?' : 'Delete this category?')) return;
    syncHelpCategories(helpCategories.filter(c => c.id !== id));
    if (editingCatId === id) setEditingCatId(null);
    if (helpExpandedId === id) setHelpExpandedId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = helpCategories.findIndex(c => c.id === active.id);
    const newIdx = helpCategories.findIndex(c => c.id === over.id);
    syncHelpCategories(arrayMove(helpCategories, oldIdx, newIdx));
  }

  // Rating stats (placeholder data)
  const ratingStats = {
    total: 24,
    average: 4.2,
    distribution: { 5: 15, 4: 5, 3: 3, 2: 1, 1: 0 }
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <header className="bg-gradient-to-r from-red-600 to-orange-500 sticky top-0 z-30 shadow-xl shadow-red-600/20" style={{ paddingTop: 'var(--sat)' }}>
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* LEFT: BACK + APP BRAND */}
          <div className="flex items-center gap-3">
            {navStack.length > 0 && (
              <button
                onClick={goBack}
                className="p-2.5 bg-white/20 backdrop-blur-sm border-0 rounded-xl text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white/20 backdrop-blur-sm border-0 rounded-xl text-white/90 hover:bg-white/30 cursor-pointer"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div onClick={() => { setActiveTab('dashboard'); }} className="flex items-center gap-1.5 cursor-pointer">
              <img src="/pwa-192x192.png" alt="PP" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-black/20" />
              <div className="flex flex-col leading-none">
                <h1 className="text-sm font-black text-white tracking-tight leading-[16px] text-center">{t.appTitle}</h1>
                <span className="text-[9px] font-mono text-white/80 font-bold uppercase tracking-wider leading-[10px] text-center">{t.slogan}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: THEME & TOOLS */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2.5 bg-white/20 backdrop-blur-sm border-0 rounded-xl hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-white" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2.5 bg-white/20 backdrop-blur-sm border-0 rounded-xl hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => handleLangToggle(lang === 'vi' ? 'en' : 'vi')}
              className="p-2.5 bg-white/20 backdrop-blur-sm border-0 rounded-xl hover:bg-white/30 transition-all active:scale-95 text-[10px] font-black text-white cursor-pointer"
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>


            {/* NOTIFICATIONS */}
            <div className="relative" ref={notiRef}>
              <button
                onClick={() => setIsNotiHistoryOpen(!isNotiHistoryOpen)}
                className="relative p-2.5 bg-white/20 backdrop-blur-sm border-0 rounded-xl hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-white" />
                {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 border-2 border-red-600 rounded-full text-[6px] font-black text-red-900 flex items-center justify-center animate-pulse">
                    {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length}
                  </span>
                )}
              </button>

              {isNotiHistoryOpen && (
                  <div className="absolute right-0 mt-3.5 z-50 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl p-4 space-y-3 font-sans animate-slideDown overflow-visible">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
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
                                ? 'bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800'
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
        <div className="px-4 py-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 animate-slideDown">
          <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-red-500 mr-2 shrink-0 animate-pulse" />
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
      <div className="hidden md:block bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 px-4 md:px-6">
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
                    ? 'border-red-500 text-red-600'
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
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-80 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-white p-5 shadow-2xl h-full animate-slideRight" style={{ paddingTop: 'calc(1.25rem + var(--sat,0px))', paddingBottom: 'var(--sab,0px)' }}>
            {/* MENU HEADER with role badge */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-850 shrink-0">
              <div className="flex items-center gap-2">
                {showHelpCenter || showRating || showShare ? (
                  <button
                    onClick={() => { setShowHelpCenter(false); setShowRating(false); setShowShare(false); setHelpExpandedId(null); }}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Menu className="w-4 h-4 text-red-500" />
                )}
                <span className="font-black text-xs uppercase tracking-wider text-red-500">
                  {showHelpCenter ? (lang === 'vi' ? 'Trung tâm trợ giúp' : 'Help Center')
                    : showRating ? (lang === 'vi' ? 'Đánh giá ứng dụng' : 'Rate App')
                    : showShare ? (lang === 'vi' ? 'Giới thiệu bạn bè' : 'Refer Friends')
                    : (lang === 'vi' ? 'Cài đặt' : 'Settings')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* ROLE BADGE - P (Coach) / T (Student) */}
                {!showHelpCenter && !showRating && !showShare && (
                  <button
                    onClick={() => {
                      if (role === 'coach') {
                        setRole('student');
                        localStorage.setItem('protpick_role', 'student');
                        setIsPinInputOpen(false);
                        setPinDisplayP(false);
                        setMenuPinInput('');
                        setMenuPinError('');
                        showToast(lang === 'vi'
                          ? '👤 Đã chuyển sang chế độ Học viên'
                          : '👤 Switched to Student mode');
                        return;
                      }
                      setPinDisplayP(true);
                      setIsPinInputOpen(true);
                      setMenuPinInput('');
                      setMenuPinError('');
                      setTimeout(() => {
                        pinInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 150);
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                      pinDisplayP || role === 'coach'
                        ? 'bg-red-500/15 text-red-500 border border-red-500/30 hover:bg-red-500/25'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-red-500 border border-zinc-200 dark:border-zinc-800'
                    }`}
                    title={role === 'coach'
                      ? (lang === 'vi' ? 'Nhấn để chuyển sang Học viên' : 'Tap to switch to Student')
                      : (lang === 'vi' ? 'Nhấn để chuyển sang HLV' : 'Tap to switch to Coach')}
                  >
                    {pinDisplayP || role === 'coach' ? 'P' : 'T'}
                  </button>
                )}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setShowHelpCenter(false); setShowRating(false); setShowShare(false); setHelpExpandedId(null); }}
                  className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MENU BODY */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 no-scrollbar min-h-0">
              {/* ───────── HELP CENTER SUB-VIEW ───────── */}
              {showHelpCenter && (
                <div className="space-y-3">
                  {role === 'coach' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={helpCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {helpCategories.map(cat => <SortableHelpItem key={cat.id} cat={cat}
                          lang={lang} role={role} editForm={editForm} setEditForm={setEditForm}
                          editingCatId={editingCatId} helpExpandedId={helpExpandedId}
                          setHelpExpandedId={setHelpExpandedId} setEditingCatId={setEditingCatId}
                          handleSaveEdit={handleSaveEdit} handleEditCategory={handleEditCategory}
                          handleDeleteCategory={handleDeleteCategory} />)}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    helpCategories.map(cat => <SortableHelpItem key={cat.id} cat={cat}
                      lang={lang} role={role} editForm={editForm} setEditForm={setEditForm}
                      editingCatId={editingCatId} helpExpandedId={helpExpandedId}
                      setHelpExpandedId={setHelpExpandedId} setEditingCatId={setEditingCatId}
                      handleSaveEdit={handleSaveEdit} handleEditCategory={handleEditCategory}
                      handleDeleteCategory={handleDeleteCategory} />)
                  )}
                  {/* Coach add button */}
                  {role === 'coach' && (
                    <button onClick={handleAddCategory}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all cursor-pointer">
                      <PlusCircle className="w-4 h-4" />
                      {lang === 'vi' ? 'Thêm danh mục' : 'Add Category'}
                    </button>
                  )}
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center pt-2 italic">
                    {lang === 'vi' ? 'Nội dung sẽ được cập nhật chi tiết trong các phiên bản sau' : 'Content will be updated in future versions'}
                  </p>
                </div>
              )}

              {/* ───────── RATING SUB-VIEW ───────── */}
              {showRating && (
                <div className="space-y-5">
                  {/* Overall rating hero */}
                  <div className="text-center space-y-2">
                    <div className="text-5xl font-black text-amber-500">{ratingStats.average.toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${
                          star <= Math.round(ratingStats.average)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-300 dark:text-zinc-600'
                        }`} />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {ratingStats.total} {lang === 'vi' ? 'đánh giá' : 'reviews'}
                    </p>
                  </div>

                  {/* Distribution bars */}
                  <div className="space-y-2.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = ratingStats.distribution[star as keyof typeof ratingStats.distribution];
                      const pct = ratingStats.total > 0 ? Math.round((count / ratingStats.total) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-right font-bold text-zinc-600 dark:text-zinc-400 shrink-0">{star} ★</span>
                          <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 h-4 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: star >= 4 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : star >= 3 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #9ca3af, #6b7280)'
                              }}
                            />
                          </div>
                          <span className="w-14 text-right text-zinc-500 dark:text-zinc-400 font-mono shrink-0">{count} {lang === 'vi' ? 'đg' : 'rev'}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 text-center">
                    <button
                      onClick={() => {
                        const url = 'https://prot-pick.vercel.app';
                        window.open(url, '_blank');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      {lang === 'vi' ? 'Viết đánh giá' : 'Write a review'}
                    </button>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 italic">
                      {lang === 'vi' ? 'Dữ liệu đánh giá sẽ được cập nhật khi có người dùng thực tế' : 'Review data will be updated when real users join'}
                    </p>
                  </div>
                </div>
              )}

              {/* ───────── SHARE SUB-VIEW ───────── */}
              {showShare && (
                <div className="space-y-5">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                      <Share2 className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                        {lang === 'vi' ? 'Chia sẻ PROT PICK' : 'Share PROT PICK'}
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {lang === 'vi'
                          ? 'Giới thiệu bạn bè cùng tập luyện Pickleball với hệ thống quản lý huấn luyện chuyên nghiệp!'
                          : 'Invite friends to train Pickleball with a professional coaching management system!'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Copy link button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://prot-pick.vercel.app').then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }).catch(() => {
                          // Fallback
                          const textArea = document.createElement('textarea');
                          textArea.value = 'https://prot-pick.vercel.app';
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <><Check className="w-4 h-4 text-emerald-500" /> {lang === 'vi' ? 'Đã sao chép!' : 'Copied!'}</>
                      ) : (
                        <><Copy className="w-4 h-4" /> {lang === 'vi' ? 'Sao chép liên kết' : 'Copy link'}</>
                      )}
                    </button>

                    {/* Native share */}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'PROT PICK - Pickleball Coaching',
                            text: lang === 'vi'
                              ? '📣 Tham gia tập luyện Pickleball cùng PROT PICK! Hệ thống quản lý huấn luyện chuyên nghiệp.'
                              : '📣 Join Pickleball training with PROT PICK! Professional coaching management system.',
                            url: 'https://prot-pick.vercel.app'
                          }).catch(() => {});
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-red-500 hover:bg-red-600 border border-red-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      {lang === 'vi' ? 'Chia sẻ qua ứng dụng khác' : 'Share via other apps'}
                    </button>

                    {/* Quick share via messaging */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(lang === 'vi'
                          ? '📣 Tham gia tập luyện Pickleball cùng PROT PICK! https://prot-pick.vercel.app'
                          : '📣 Join Pickleball training with PROT PICK! https://prot-pick.vercel.app')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://prot-pick.vercel.app')}&quote=${encodeURIComponent(lang === 'vi'
                          ? '📣 Tham gia tập luyện Pickleball cùng PROT PICK!'
                          : '📣 Join Pickleball training with PROT PICK!')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────── MAIN MENU (DEFAULT) ───────── */}
              {!showHelpCenter && !showRating && !showShare && (
                <>
                  {/* QUICK NAV */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
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
                              ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PIN INPUT */}
                  {isPinInputOpen && (
                    <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest block font-bold">
                          {lang === 'vi' ? 'Xác thực HLV' : 'Coach Auth'}
                        </span>
                        <button
                          onClick={() => { setIsPinInputOpen(false); setPinDisplayP(false); setMenuPinInput(''); setMenuPinError(''); }}
                          className="text-[9px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-bold cursor-pointer"
                        >
                          {lang === 'vi' ? 'Đóng' : 'Close'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={pinInputRef}
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          value={menuPinInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setMenuPinInput(val);
                            setMenuPinError('');
                            if (val.length === 4) {
                              if (val === dbCoachPin) {
                                setRole('coach');
                                setPinDisplayP(false);
                                setIsPinInputOpen(false);
                                setIsMobileMenuOpen(false);
                                setMenuPinInput('');
                                setMenuPinError('');
                                showToast(lang === 'vi'
                                  ? '\u{1F513} \u0110\u00E3 m\u1EDF kh\xF3a quy\u1EC1n Ch\u1EC9nh s\u1EEDa HLV th\xE0nh c\xF4ng!'
                                  : '\u{1F513} Coach Edit privilege activated!');
                              } else {
                                setMenuPinError(lang === 'vi' ? 'M\xE3 PIN kh\xF4ng ch\xEDnh x\xE1c!' : 'Incorrect PIN!');
                                setMenuPinInput('');
                              }
                            }
                          }}
                          className="flex-1 px-3 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-center font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 placeholder-zinc-400 dark:placeholder-zinc-600"
                          placeholder="* * * *"
                          autoFocus
                        />
                      </div>
                      {menuPinError && (
                        <p className="text-[11px] text-red-500 font-bold">{menuPinError}</p>
                      )}
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
                        {lang === 'vi'
                          ? 'Nh\xE3p m\xE3 PIN 4 s\u1ED1 \u0111\u1EC3 x\xE1c th\u1EF1c quy\u1EC1n Ch\u1EC9nh s\u1EEDa HLV.'
                          : 'Enter 4-digit PIN to verify Coach edit privileges.'}
                      </p>
                    </div>
                  )}

                  {/* KHÁC - OTHER SECTION */}
                  <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                      {lang === 'vi' ? 'KHÁC' : 'OTHER'}
                    </span>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setShowHelpCenter(true); setShowRating(false); setShowShare(false); setHelpExpandedId(null); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 text-red-500" />
                          {lang === 'vi' ? 'Trung tâm trợ giúp' : 'Help Center'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => { setShowRating(true); setShowHelpCenter(false); setShowShare(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <Star className="w-4 h-4 text-amber-500" />
                          {lang === 'vi' ? 'Đánh giá ứng dụng' : 'Rate App'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => { setShowShare(true); setShowHelpCenter(false); setShowRating(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <Share2 className="w-4 h-4 text-emerald-500" />
                          {lang === 'vi' ? 'Giới thiệu bạn bè' : 'Refer Friends'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            {/* VERSION FOOTER */}
            <div className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-3 pb-1 flex items-center justify-center gap-1.5 shrink-0 z-10">
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
                ProtPick <span className="text-red-500 font-black">v1.0.0</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                {lang === 'vi' ? 'Pickleball Coaching' : 'Pickleball Coaching'}
              </span>
            </div>
          </div>  {/* ← closes flex-1 overflow-y-auto */}
        </div>
      </div>
      )}
    </header>
  );
}
