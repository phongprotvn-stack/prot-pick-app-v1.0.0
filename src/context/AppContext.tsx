import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { collection, doc, onSnapshot, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Student, CurriculumSkill, LessonPlan, Session, NotificationItem, CoachProfile } from '../types';
import { initialStudents, initialSkills, initialLessonPlans, initialSessions, initialNotifications, defaultCoach } from '../data';
import { translations, LanguageKey } from '../translations';

// ========== COMPRESS IMAGE HELPER ==========
export const compressImage = (base64Str: string, maxWidth = 300, maxHeight = 300, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
      } else {
        if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality)); }
      else { resolve(base64Str); }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// ========== CONTEXT SHAPE ==========
export interface AppContextType {
  lang: LanguageKey; setLang: (l: LanguageKey) => void;
  theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void;
  role: 'coach' | 'student'; setRole: (r: 'coach' | 'student') => void;
  dbCoachPin: string;
  students: Student[]; skillsList: CurriculumSkill[]; lessonPlans: LessonPlan[];
  sessions: Session[]; notifications: NotificationItem[]; coach: CoachProfile;
  activeTab: string; setActiveTab: (t: string) => void;
  navStack: string[]; goBack: () => void;
  searchQuery: string; setSearchQuery: (q: string) => void;
  selectedStudentId: string; setSelectedStudentId: (id: string) => void;
  editingStudent: Partial<Student> | null; setEditingStudent: (s: Partial<Student> | null) => void;
  editingPlan: Partial<LessonPlan> | null; setEditingPlan: (p: Partial<LessonPlan> | null) => void;
  newSession: Partial<Session> | null; setNewSession: (s: Partial<Session> | null) => void;
  editingSessionId: string | null; setEditingSessionId: (id: string | null) => void;
  newNoti: Partial<NotificationItem> | null; setNewNoti: (n: Partial<NotificationItem> | null) => void;
  newSkill: Partial<CurriculumSkill> | null; setNewSkill: (s: Partial<CurriculumSkill> | null) => void;
  newMediaUrl: string; setNewMediaUrl: (u: string) => void;
  newMediaType: 'video' | 'photo' | 'local_photo'; setNewMediaType: (t: 'video' | 'photo' | 'local_photo') => void;
  customLegendNotes: string; setCustomLegendNotes: (n: string) => void;
  sessionSearchQuery: string; setSessionSearchQuery: (q: string) => void;
  sessionDateFilter: string; setSessionDateFilter: (d: string) => void;
  selectedSkillForHistory: CurriculumSkill | null; setSelectedSkillForHistory: (s: CurriculumSkill | null) => void;
  isEditingCoachAvatar: boolean; setIsEditingCoachAvatar: (v: boolean) => void;
  tempCoachAvatar: string; setTempCoachAvatar: (t: string) => void;
  isEditingStudentAvatar: boolean; setIsEditingStudentAvatar: (v: boolean) => void;
  tempStudentAvatar: string; setTempStudentAvatar: (t: string) => void;
  isPinModalOpen: boolean; setIsPinModalOpen: (v: boolean) => void;
  pinInputValue: string; setPinInputValue: (v: string) => void;
  pinModalError: string; setPinModalError: (e: string) => void;
  isChangingPin: boolean; setIsChangingPin: (v: boolean) => void;
  currentPinValueForChange: string; setCurrentPinValueForChange: (v: string) => void;
  newPinValue1: string; setNewPinValue1: (v: string) => void;
  newPinValue2: string; setNewPinValue2: (v: string) => void;
  isNotiHistoryOpen: boolean; setIsNotiHistoryOpen: (v: boolean) => void;
  selectedNotiId: string | null; setSelectedNotiId: (v: string | null) => void;
  toastMessage: string | null;
  isMobileMenuOpen: boolean; setIsMobileMenuOpen: (v: boolean) => void;
  isMobileSearchOpen: boolean; setIsMobileSearchOpen: (v: boolean) => void;
  chartContainerRefForHistory: React.RefObject<HTMLDivElement | null>;
  translationTimeoutRef: React.MutableRefObject<Record<string, NodeJS.Timeout>>;
  t: Record<string, string>;
  sortedNotifications: NotificationItem[];
  resolvedStudents: Student[];
  activeStudent: Student | undefined;
  filteredStudents: Student[];
  filteredPlans: LessonPlan[];
  filteredSessions: Session[];
  getAverageRating: (student: Student) => number;
  getStrongestSkills: (student: Student) => { name: string; score: number }[];
  getNeedImprovementSkills: (student: Student) => { name: string; score: number }[];
  handleRoleToggle: (newRole: 'coach' | 'student') => void;
  handleLangToggle: (newLang: LanguageKey) => void;
  handleThemeToggle: () => void;
  handleSaveStudent: (e: React.FormEvent) => void;
  handleDeleteStudent: (id: string) => void;
  handleSavePlan: (e: React.FormEvent) => void;
  handleSaveSkill: (e: React.FormEvent) => void;
  handleSaveSession: (e: React.FormEvent, forceStatus?: 'Scheduled' | 'Completed') => void;
  handleDeleteSession: (id: string) => void;
  handleSaveNoti: (e: React.FormEvent) => void;
  handleDeleteNoti: (id: string) => void;
  handleDirectSkillRate: (studentId: string, skillName: string, score: number) => void;
  handleUpdateCoachAvatar: () => void;
  handleUpdateStudentAvatar: () => void;
  handleAddMedia: () => void;
  handleSaveLegend: () => void;
  showToast: (msg: string) => void;
  translateViToEn: (text: string) => Promise<string | null>;
  futureIdeas: { id: string; titleVI: string; titleEN: string }[];
  votedIdeas: Record<string, boolean>;
  setVotedIdeas: (v: Record<string, boolean>) => void;
  isFutureIdeasOpen: boolean;
  setIsFutureIdeasOpen: (v: boolean) => void;
  syncStudents: (data: Student[]) => void;
  syncSkills: (data: CurriculumSkill[]) => void;
  syncLessonPlans: (data: LessonPlan[]) => void;
  syncSessions: (data: Session[]) => void;
  syncNotifications: (data: NotificationItem[]) => void;
  syncCoach: (data: CoachProfile) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ========== HELPERS ==========
function getLocalOrSet<T>(key: string, fallback: T): T {
  const items = localStorage.getItem(key);
  if (items) { try { return JSON.parse(items); } catch { return fallback; } }
  else { localStorage.setItem(key, JSON.stringify(fallback)); return fallback; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // === PERSISTED STATE ===
  const [dbCoachPin, setDbCoachPin] = useState('1234');
  const [lang, setLangState] = useState<LanguageKey>('vi');
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [role, setRole] = useState<'coach' | 'student'>('student');
  const [students, setStudents] = useState<Student[]>([]);
  const [skillsList, setSkillsList] = useState<CurriculumSkill[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [coach, setCoach] = useState<CoachProfile>(defaultCoach);
  const [customLegendNotes, setCustomLegendNotes] = useState('');

  // === UI STATE ===
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [navStack, setNavStack] = useState<string[]>([]);
  const setActiveTab = (tab: string) => {
    setActiveTabState(prev => {
      if (prev !== tab) setNavStack(s => [...s.slice(-10), prev]);
      return tab;
    });
  };
  const goBack = () => {
    setNavStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const prevTab = newStack.pop()!;
      setActiveTabState(prevTab);
      return newStack;
    });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isFutureIdeasOpen, setIsFutureIdeasOpen] = useState(false);
  const [votedIdeas, setVotedIdeas] = useState<Record<string, boolean>>({});
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<LessonPlan> | null>(null);
  const [newSession, setNewSession] = useState<Partial<Session> | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newNoti, setNewNoti] = useState<Partial<NotificationItem> | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<CurriculumSkill> | null>(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'video' | 'photo' | 'local_photo'>('video');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionDateFilter, setSessionDateFilter] = useState('');
  const [selectedSkillForHistory, setSelectedSkillForHistory] = useState<CurriculumSkill | null>(null);
  const chartContainerRefForHistory = useRef<HTMLDivElement>(null);
  const [isEditingCoachAvatar, setIsEditingCoachAvatar] = useState(false);
  const [tempCoachAvatar, setTempCoachAvatar] = useState('');
  const [isEditingStudentAvatar, setIsEditingStudentAvatar] = useState(false);
  const [tempStudentAvatar, setTempStudentAvatar] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInputValue, setPinInputValue] = useState('');
  const [pinModalError, setPinModalError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinValueForChange, setCurrentPinValueForChange] = useState('');
  const [newPinValue1, setNewPinValue1] = useState('');
  const [newPinValue2, setNewPinValue2] = useState('');
  const [isNotiHistoryOpen, setIsNotiHistoryOpen] = useState(false);
  const [selectedNotiId, setSelectedNotiId] = useState<string | null>(null);
  const translationTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // === WRAPPERS THAT PERSIST TO LOCALSTORAGE ===
  const setLang = (l: LanguageKey) => { setLangState(l); localStorage.setItem('protpick_lang', l); };
  const setTheme = (t: 'light' | 'dark') => { setThemeState(t); localStorage.setItem('protpick_theme', t); };

  // === TRANSLATIONS ===
  const t = translations[lang];

  // === SCROLL TO LATEST ON HISTORY CHART OPEN ===
  useEffect(() => {
    if (selectedSkillForHistory && chartContainerRefForHistory.current) {
      setTimeout(() => { chartContainerRefForHistory.current?.scrollTo({ left: chartContainerRefForHistory.current.scrollWidth, behavior: 'smooth' }); }, 100);
    }
  }, [selectedSkillForHistory]);

  // === AUTO-TRANSLATE SESSION FEEDBACK VI→EN ===
  useEffect(() => {
    if (!newSession?.coachFeedbackVI) return;
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(newSession.coachFeedbackVI || '')}`);
        const data = await res.json();
        if (data?.[0]) {
          const translated = data[0].map((x: any) => x[0]).join('');
          setNewSession(prev => prev ? { ...prev, coachFeedbackEN: translated } : null);
        }
      } catch (err) { console.error("Auto translate error:", err); }
    }, 800);
    return () => clearTimeout(delayDebounce);
  }, [newSession?.coachFeedbackVI]);

  // === FIREBASE: SEED + LISTEN ===
  useEffect(() => {
    const savedLang = localStorage.getItem('protpick_lang') as LanguageKey;
    if (savedLang) setLangState(savedLang);
    const savedTheme = localStorage.getItem('protpick_theme') as 'light' | 'dark';
    if (savedTheme) setThemeState(savedTheme);

    setStudents(getLocalOrSet<Student[]>('protpick_students', initialStudents));
    setSkillsList(initialSkills.sort((a, b) => {
      const order = [
        'Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop',
        'Reset', 'Flick', 'Roll', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
      ];
      const idxA = order.indexOf(a.name);
      const idxB = order.indexOf(b.name);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    }));
    localStorage.setItem('protpick_skills', JSON.stringify(initialSkills));
    setLessonPlans(getLocalOrSet<LessonPlan[]>('protpick_lessonplans', initialLessonPlans));
    setSessions(getLocalOrSet<Session[]>('protpick_sessions', initialSessions));
    setNotifications(getLocalOrSet<NotificationItem[]>('protpick_notifications', initialNotifications));
    setCoach(getLocalOrSet<CoachProfile>('protpick_coach', defaultCoach));
    const savedLegend = localStorage.getItem('protpick_legend_notes');
    if (savedLegend) setCustomLegendNotes(savedLegend);
    else setCustomLegendNotes('[Phongprot] Hướng dẫn bổ sung tài liệu cầm vợt xoay cổ tay, di chuyển phản công dink sâu, chiến thuật ép góc dink biên bếp trái tay...');
    const savedPin = localStorage.getItem('protpick_coach_pin') || '1234';
    setDbCoachPin(savedPin);

    const unsubscribes: (() => void)[] = [];

    const initFirebaseData = async () => {
      try {
        const refStudents = collection(db, 'students');
        const snapStudents = await getDocs(refStudents);
        if (snapStudents.empty) { for (const s of initialStudents) await setDoc(doc(db, 'students', s.id), s); }

        const refSkills = collection(db, 'skills');
        const snapSkills = await getDocs(refSkills);
        if (snapSkills.empty) { for (const s of initialSkills) await setDoc(doc(db, 'skills', s.id), s); }

        const refLessonPlans = collection(db, 'lessonplans');
        const snapLessonPlans = await getDocs(refLessonPlans);
        if (snapLessonPlans.empty) { for (const lp of initialLessonPlans) await setDoc(doc(db, 'lessonplans', lp.id), lp); }

        const refSessions = collection(db, 'sessions');
        const snapSessions = await getDocs(refSessions);
        if (snapSessions.empty) { for (const s of initialSessions) await setDoc(doc(db, 'sessions', s.id), s); }

        const refNotis = collection(db, 'notifications');
        const snapNotis = await getDocs(refNotis);
        if (snapNotis.empty) { for (const n of initialNotifications) await setDoc(doc(db, 'notifications', n.id), n); }

        const refCoachDoc = doc(db, 'settings', 'coach');
        const snapCoach = await getDoc(refCoachDoc);
        if (!snapCoach.exists()) await setDoc(refCoachDoc, defaultCoach);

        const refLegendDoc = doc(db, 'settings', 'legend');
        const snapLegend = await getDoc(refLegendDoc);
        if (!snapLegend.exists()) await setDoc(refLegendDoc, { notes: '[Phongprot] Hướng dẫn bổ sung tài liệu cầm vợt xoay cổ tay, di chuyển phản công dink sâu, chiến thuật ép góc dink biên bếp trái tay...' });

        const refPinDoc = doc(db, 'settings', 'security');
        const snapPin = await getDoc(refPinDoc);
        if (!snapPin.exists()) await setDoc(refPinDoc, { pin: '1234' });
      } catch (err) { console.error("Firebase seed error:", err); }
    };

    initFirebaseData().then(() => {
      unsubscribes.push(
        onSnapshot(collection(db, 'students'), (snap) => {
          const list: Student[] = []; snap.forEach(d => list.push(d.data() as Student));
          if (list.length > 0) { setStudents(list); localStorage.setItem('protpick_students', JSON.stringify(list)); }
        })
      );
      unsubscribes.push(
        onSnapshot(collection(db, 'skills'), (snap) => {
          let list: CurriculumSkill[] = []; snap.forEach(d => list.push(d.data() as CurriculumSkill));
          if (list.length > 0) {
            // Normalize old category values → new ones + sort by canonical order
            const canonicalOrder = ['Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop', 'Reset', 'Flick', 'Roll', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'];
            const catMap: Record<string, string> = {
              'Basics': 'BASICS', 'Dink & Soft': 'ADVANCEDS', 'Hard Drives': 'ADVANCEDS',
              'Defense & Reset': 'ADVANCEDS', 'Tactics & Footwork': 'TACTICS'
            };
            const normalizeCat = (name: string, oldCat: string): string => {
              const mapped = catMap[oldCat] || oldCat;
              return (name === 'Lob' && oldCat !== 'ADVANCEDS') ? 'ADVANCEDS' : mapped;
            };
            let changed = false;
            list = list.map(s => {
              const newCat = normalizeCat(s.name, s.category);
              if (newCat !== s.category) changed = true;
              return { ...s, category: (newCat as CurriculumSkill['category']) };
            });
            list.sort((a, b) => {
              const ia = canonicalOrder.indexOf(a.name), ib = canonicalOrder.indexOf(b.name);
              return (ia !== -1 ? ia : 999) - (ib !== -1 ? ib : 999);
            });
            setSkillsList(list);
            localStorage.setItem('protpick_skills', JSON.stringify(list));
            // Update Firebase if old data was migrated
            if (changed) snap.forEach(d => {
              const skill = d.data() as CurriculumSkill;
              const newCat = normalizeCat(skill.name, skill.category);
              if (newCat !== skill.category) updateDoc(doc(db, 'skills', d.id), { category: (newCat as CurriculumSkill['category']) });
            });
          }
        })
      );
      unsubscribes.push(
        onSnapshot(collection(db, 'lessonplans'), (snap) => {
          const list: LessonPlan[] = []; snap.forEach(d => list.push(d.data() as LessonPlan));
          if (list.length > 0) { setLessonPlans(list); localStorage.setItem('protpick_lessonplans', JSON.stringify(list)); }
        })
      );
      unsubscribes.push(
        onSnapshot(collection(db, 'sessions'), (snap) => {
          const list: Session[] = []; snap.forEach(d => list.push(d.data() as Session));
          if (list.length > 0) { setSessions(list); localStorage.setItem('protpick_sessions', JSON.stringify(list)); }
        })
      );
      unsubscribes.push(
        onSnapshot(collection(db, 'notifications'), (snap) => {
          const list: NotificationItem[] = []; snap.forEach(d => list.push(d.data() as NotificationItem));
          if (list.length > 0) { setNotifications(list); localStorage.setItem('protpick_notifications', JSON.stringify(list)); }
        })
      );
      unsubscribes.push(
        onSnapshot(doc(db, 'settings', 'coach'), (snap) => {
          if (snap.exists()) { const data = snap.data() as CoachProfile; setCoach(data); localStorage.setItem('protpick_coach', JSON.stringify(data)); }
        })
      );
      unsubscribes.push(
        onSnapshot(doc(db, 'settings', 'legend'), (snap) => {
          if (snap.exists()) { const data = snap.data() as { notes: string }; setCustomLegendNotes(data.notes); localStorage.setItem('protpick_legend_notes', data.notes); }
        })
      );
      unsubscribes.push(
        onSnapshot(doc(db, 'settings', 'security'), (snap) => {
          if (snap.exists()) { const data = snap.data() as { pin: string }; setDbCoachPin(data.pin); localStorage.setItem('protpick_coach_pin', data.pin); }
        })
      );
    });

    return () => { unsubscribes.forEach(sub => sub()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === SYNC FUNCTIONS ===
  const syncStudents = async (data: Student[]) => {
    setStudents(data); localStorage.setItem('protpick_students', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(i => i.id));
      for (const s of students) { if (!currentIds.has(s.id)) await deleteDoc(doc(db, 'students', s.id)); }
      for (const item of data) await setDoc(doc(db, 'students', item.id), item);
    } catch (err) { console.error("sync students error:", err); }
  };
  const syncSkills = async (data: CurriculumSkill[]) => {
    setSkillsList(data); localStorage.setItem('protpick_skills', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(i => i.id));
      for (const s of skillsList) { if (!currentIds.has(s.id)) await deleteDoc(doc(db, 'skills', s.id)); }
      for (const item of data) await setDoc(doc(db, 'skills', item.id), item);
    } catch (err) { console.error("sync skills error:", err); }
  };
  const syncLessonPlans = async (data: LessonPlan[]) => {
    setLessonPlans(data); localStorage.setItem('protpick_lessonplans', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(i => i.id));
      for (const s of lessonPlans) { if (!currentIds.has(s.id)) await deleteDoc(doc(db, 'lessonplans', s.id)); }
      for (const item of data) await setDoc(doc(db, 'lessonplans', item.id), item);
    } catch (err) { console.error("sync lessonplans error:", err); }
  };
  const syncSessions = async (data: Session[]) => {
    setSessions(data); localStorage.setItem('protpick_sessions', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(i => i.id));
      for (const s of sessions) { if (!currentIds.has(s.id)) await deleteDoc(doc(db, 'sessions', s.id)); }
      for (const item of data) await setDoc(doc(db, 'sessions', item.id), item);
    } catch (err) { console.error("sync sessions error:", err); }
  };
  const syncNotifications = async (data: NotificationItem[]) => {
    setNotifications(data); localStorage.setItem('protpick_notifications', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(i => i.id));
      for (const s of notifications) { if (!currentIds.has(s.id)) await deleteDoc(doc(db, 'notifications', s.id)); }
      for (const item of data) await setDoc(doc(db, 'notifications', item.id), item);
    } catch (err) { console.error("sync notifications error:", err); }
  };
  const syncCoach = async (updatedCoach: CoachProfile) => {
    setCoach(updatedCoach); localStorage.setItem('protpick_coach', JSON.stringify(updatedCoach));
    try { await setDoc(doc(db, 'settings', 'coach'), updatedCoach); } catch (err) { console.error("sync coach error:", err); }
  };

  // === TOAST ===
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  // === TRANSLATE ===
  const translateViToEn = async (text: string): Promise<string | null> => {
    if (!text?.trim()) return null;
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=vi|en`);
      const data = await res.json();
      return data?.responseData?.translatedText || null;
    } catch (err) { console.error("Translate error:", err); return null; }
  };

  // === DERIVED DATA ===
  const sortedNotifications = useMemo(() =>
    [...notifications].sort((a, b) => {
      const dc = (b.date || '').localeCompare(a.date || '');
      return dc !== 0 ? dc : (b.id || '').localeCompare(a.id || '');
    }), [notifications]);

  const getAverageRating = (student: Student) => {
    const scores = Object.values(student.skills);
    if (scores.length === 0) return 0;
    return parseFloat((scores.reduce((a, s) => a + s, 0) / scores.length).toFixed(1));
  };

  const getStrongestSkills = (student: Student) =>
    Object.entries(student.skills).filter(([, s]) => s >= 4).map(([n, s]) => ({ name: n, score: s }));

  const getNeedImprovementSkills = (student: Student) =>
    Object.entries(student.skills).filter(([, s]) => s <= 2).map(([n, s]) => ({ name: n, score: s }));

  const resolvedStudents = useMemo(() =>
    students.map(student => {
      const studentSessions = sessions.filter(s => s.studentId === student.id && s.status === 'Completed')
        .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
      const mergedSkills = { ...student.skills };
      studentSessions.forEach(session => {
        if (session.skillScores) {
          Object.entries(session.skillScores).forEach(([skillName, score]) => {
            if (score !== undefined) mergedSkills[skillName] = score;
          });
        }
      });
      return { ...student, skills: mergedSkills };
    }), [students, sessions]);

  const activeStudent = resolvedStudents.find(s => s.id === (selectedStudentId || resolvedStudents[0]?.id));

  const filteredStudents = useMemo(() =>
    resolvedStudents.filter(s => {
      const match = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.targetGoal.toLowerCase().includes(searchQuery.toLowerCase());
      return role === 'student' ? (s.isPublic && match) : match;
    }), [resolvedStudents, searchQuery, role]);

  const filteredPlans = useMemo(() =>
    lessonPlans.filter(p => {
      const title = (lang === 'vi' ? p.titleVI : p.titleEN).toLowerCase();
      const desc = (lang === 'vi' ? p.descriptionVI : p.descriptionEN).toLowerCase();
      const match = title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
      return role === 'student' ? (p.isPublic && match) : match;
    }), [lessonPlans, lang, searchQuery, role]);

  const filteredSessions = useMemo(() =>
    sessions.filter(s => {
      const student = resolvedStudents.find(st => st.id === s.studentId);
      const plan = lessonPlans.find(lp => lp.id === s.lessonPlanId);
      const planTitle = plan ? (lang === 'vi' ? plan.titleVI : plan.titleEN) : '';
      const query = sessionSearchQuery.toLowerCase().trim();
      const dateQuery = sessionDateFilter.trim();
      const matchesNameOrTitle = query === '' || s.title.toLowerCase().includes(query) ||
        (student?.name || '').toLowerCase().includes(query) || planTitle.toLowerCase().includes(query);
      const matchesDate = dateQuery === '' || s.date === dateQuery;
      const matchesGlobal = searchQuery === '' || s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || planTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const isMatched = matchesNameOrTitle && matchesDate && matchesGlobal;
      return role === 'student' ? (s.isPublic && isMatched) : isMatched;
    }), [sessions, resolvedStudents, lessonPlans, lang, sessionSearchQuery, sessionDateFilter, searchQuery, role]);

  // === HANDLERS ===
  const handleRoleToggle = (newRole: 'coach' | 'student') => {
    if (newRole === 'coach') { setPinInputValue(''); setPinModalError(''); setIsChangingPin(false); setIsPinModalOpen(true); }
    else { setRole('student'); localStorage.setItem('protpick_role', 'student'); showToast(`${t.activeRole}: ${t.roleStudent}`); }
  };
  const handleLangToggle = (newLang: LanguageKey) => { setLang(newLang); };
  const handleThemeToggle = () => { setTheme(theme === 'light' ? 'dark' : 'light'); };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent?.name) return;
    if (editingStudent.id) {
      const updated = students.map(s => s.id === editingStudent.id ? { ...s, ...editingStudent } as Student : s);
      syncStudents(updated); showToast(lang === 'vi' ? "Cập nhật học viên thành công!" : "Student details saved!");
    } else {
      const defaultSkillScores: Record<string, number> = {};
      skillsList.forEach(s => { defaultSkillScores[s.name] = 1; });
      const newRecord: Student = {
        id: 'std_' + Date.now(), name: editingStudent.name || 'New Pupil',
        avatar: editingStudent.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        level: editingStudent.level || '1.0-2.0', joiningDate: editingStudent.joiningDate || new Date().toISOString().split('T')[0],
        isPublic: editingStudent.isPublic !== undefined ? editingStudent.isPublic : true, skills: { ...defaultSkillScores, ...(editingStudent.skills || {}) },
        targetGoal: editingStudent.targetGoal || '', notes: editingStudent.notes || '', phone: editingStudent.phone || '',
        email: editingStudent.email || '', nationality: editingStudent.nationality || 'Việt Nam', dominantHand: editingStudent.dominantHand || 'Phải'
      };
      syncStudents([...students, newRecord]); setSelectedStudentId(newRecord.id);
      showToast(lang === 'vi' ? "Thêm học viên thành công!" : "New student registered!");
    }
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm(t.deleteConfirm)) { syncStudents(students.filter(s => s.id !== id)); showToast(lang === 'vi' ? "Xóa học viên thành công" : "Student deleted"); if (selectedStudentId === id) setSelectedStudentId(''); }
  };

  const handleUpdateCoachAvatar = () => {
    if (!tempCoachAvatar) return; syncCoach({ ...coach, avatar: tempCoachAvatar }); setIsEditingCoachAvatar(false);
    showToast(lang === 'vi' ? "Đã thay đổi ảnh đại diện HLV!" : "Coach profile picture updated!");
  };

  const handleUpdateStudentAvatar = () => {
    if (!activeStudent || !tempStudentAvatar) return;
    const updated = students.map(s => s.id === activeStudent.id ? { ...s, avatar: tempStudentAvatar } : s);
    syncStudents(updated); setIsEditingStudentAvatar(false);
    showToast(lang === 'vi' ? "Đã cập nhật ảnh học viên!" : "Student profile picture updated!");
  };

  const handleDirectSkillRate = (studentId: string, skillName: string, score: number) => {
    if (role !== 'coach') return;
    const updated = students.map(st => {
      if (st.id === studentId) return { ...st, skills: { ...st.skills, [skillName]: score } };
      return st;
    });
    syncStudents(updated);
    const studentSessions = sessions.filter(s => s.studentId === studentId && s.status === 'Completed')
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    if (studentSessions.length > 0) {
      const targetSession = studentSessions.find(s => s.skillScores?.[skillName] !== undefined) || studentSessions[0];
      if (targetSession) {
        syncSessions(sessions.map(s => s.id === targetSession.id ? { ...s, skillScores: { ...(s.skillScores || {}), [skillName]: score } } : s));
      }
    }
    showToast(`Updated ${skillName} to ${score}/5`);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill?.name) return;
    const skillObj: CurriculumSkill = { id: 'skill_' + Date.now(), name: newSkill.name, category: newSkill.category || 'BASICS', descriptionVI: newSkill.descriptionVI || '', descriptionEN: newSkill.descriptionEN || '' };
    syncSkills([...skillsList, skillObj]);
    syncStudents(students.map(s => s.skills[skillObj.name] === undefined ? { ...s, skills: { ...s.skills, [skillObj.name]: 2 } } : s));
    showToast(lang === 'vi' ? `Đã thêm kỹ năng ${skillObj.name}` : `Skill ${skillObj.name} added`); setNewSkill(null);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.titleVI) return;
    if (editingPlan.id) {
      syncLessonPlans(lessonPlans.map(p => p.id === editingPlan.id ? { ...p, ...editingPlan } as LessonPlan : p));
      showToast("Saved plan");
    } else {
      syncLessonPlans([...lessonPlans, { id: 'lp_' + Date.now(), titleVI: editingPlan.titleVI || '', titleEN: editingPlan.titleEN || '', descriptionVI: editingPlan.descriptionVI || '', descriptionEN: editingPlan.descriptionEN || '', skillsFocused: editingPlan.skillsFocused || [], durationMin: editingPlan.durationMin || 60, isPublic: editingPlan.isPublic !== undefined ? editingPlan.isPublic : true }]);
      showToast("New plan added");
    }
    setEditingPlan(null);
  };

  const handleSaveSession = (e: React.FormEvent, forceStatus?: 'Scheduled' | 'Completed') => {
    if (e) e.preventDefault();
    if (!newSession?.studentId || !newSession?.lessonPlanId) { alert(lang === 'vi' ? "Vui lòng chọn Học Viên và Giáo Án Áp Dụng" : "Please select Student and Lesson Plan"); return; }
    const finalStatus = forceStatus || newSession.status || 'Scheduled';

    const buildSessionObj = (id: string): Session => ({
      id, studentId: newSession.studentId || '', date: newSession.date || new Date().toISOString().split('T')[0],
      lessonPlanId: newSession.lessonPlanId || '', title: newSession.title || 'Coaching Session',
      durationMin: Number(newSession.durationMin) || 60, notes: finalStatus === 'Completed' ? (newSession.notes || '') : '',
      status: finalStatus, skillScores: finalStatus === 'Completed' ? (newSession.skillScores || {}) : {},
      isPublic: newSession.isPublic !== undefined ? newSession.isPublic : true,
      coachFeedbackVI: finalStatus === 'Completed' ? (newSession.coachFeedbackVI || '') : '',
      coachFeedbackEN: finalStatus === 'Completed' ? (newSession.coachFeedbackEN || '') : '',
      location: newSession.location || ''
    });

    if (editingSessionId) {
      syncSessions(sessions.map(s => s.id === editingSessionId ? buildSessionObj(s.id) : s));
      if (finalStatus === 'Completed') {
        const st = students.find(s => s.id === newSession.studentId);
        if (st) {
          const updatedSkills = { ...st.skills };
          Object.entries(newSession.skillScores || {}).forEach(([n, r]) => { updatedSkills[n] = Number(r) || 1; });
          syncStudents(students.map(s => s.id === newSession.studentId ? { ...s, skills: updatedSkills } : s));
        }
      }
      showToast(lang === 'vi' ? "Đã cập nhật!" : "Session updated!");
      setNewSession(null); setEditingSessionId(null);
    } else {
      const sessionObj = buildSessionObj('sess_' + Date.now());
      syncSessions([sessionObj, ...sessions]);
      if (finalStatus === 'Completed' && Object.keys(sessionObj.skillScores).length > 0) {
        const st = students.find(s => s.id === sessionObj.studentId);
        if (st) {
          const updatedSkills = { ...st.skills };
          Object.entries(sessionObj.skillScores).forEach(([n, r]) => { updatedSkills[n] = Number(r) || 1; });
          syncStudents(students.map(s => s.id === sessionObj.studentId ? { ...s, skills: updatedSkills } : s));
        }
      }
      showToast(finalStatus === 'Completed' ? (lang === 'vi' ? "Đã hoàn thành buổi học!" : "Session completed!") : (lang === 'vi' ? "Đã lên lịch!" : "Session scheduled!"));
      setNewSession(null);
    }
  };

  const handleDeleteSession = (id: string) => {
    if (confirm(t.deleteConfirm)) { syncSessions(sessions.filter(s => s.id !== id)); showToast("Session removed"); }
  };

  const handleSaveNoti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoti?.titleVI || !newNoti?.contentVI) return;
    syncNotifications([{ id: 'noti_' + Date.now(), titleVI: newNoti.titleVI || '', titleEN: newNoti.titleEN || '', contentVI: newNoti.contentVI || '', contentEN: newNoti.contentEN || '', date: newNoti.date || new Date().toISOString().split('T')[0], type: newNoti.type || 'info', isPublic: newNoti.isPublic !== undefined ? newNoti.isPublic : true }, ...notifications]);
    showToast(lang === 'vi' ? "Đã đăng thông báo!" : "Broadcasted!"); setNewNoti(null);
  };

  const handleDeleteNoti = (id: string) => {
    if (confirm(t.deleteConfirm)) { syncNotifications(notifications.filter(n => n.id !== id)); showToast("Notification deleted"); }
  };

  const handleAddMedia = () => {
    if (!newMediaUrl) return;
    let mediaUrl = newMediaUrl;
    if (newMediaType === 'video') {
      const match = newMediaUrl.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match?.[2]?.length === 11) mediaUrl = match[2];
    }
    const updated = { ...coach };
    if (newMediaType === 'video') updated.youtubeYoutIds = [...coach.youtubeYoutIds, mediaUrl];
    else updated.photos = [...coach.photos, mediaUrl];
    syncCoach(updated); setNewMediaUrl(''); showToast("Media added!");
  };

  const handleSaveLegend = async () => {
    localStorage.setItem('protpick_legend_notes', customLegendNotes);
    try { await setDoc(doc(db, 'settings', 'legend'), { notes: customLegendNotes }); } catch (err) { console.error(err); }
    showToast(lang === 'vi' ? "Lưu thành công!" : "Legend saved!");
  };

  const futureIdeas = [
    { id: 'f1', titleVI: '🤖 Tích hợp phân tích AI trận đấu bóng qua Camera', titleEN: '🤖 AI Video Analysis for tactical tracking' },
    { id: 'f2', titleVI: '📊 Đồng bộ hóa trực tiếp chỉ số DUPR cá nhân học viên', titleEN: '📊 Real-time official DUPR API score matching' },
    { id: 'f3', titleVI: '🏓 Lịch sử giao lưu Pickleball đối kháng nội bộ giữa các học viên', titleEN: '🏓 Internal match records between pupils' },
    { id: 'f4', titleVI: '🥇 Bảng xếp hạng cộng đồng học viên hằng tháng', titleEN: '🥇 Monthly leaderboard and friendlies tournaments' },
    { id: 'f5', titleVI: '🔐 Đăng nhập tài khoản riêng cho từng học viên', titleEN: '🔐 Individual student accounts (future secured login)' },
  ];

  const value: AppContextType = {
    lang, setLang, theme, setTheme, role, setRole, dbCoachPin,
    students, skillsList, lessonPlans, sessions, notifications, coach,
    activeTab, setActiveTab, navStack, goBack, searchQuery, setSearchQuery, selectedStudentId, setSelectedStudentId,
    editingStudent, setEditingStudent, editingPlan, setEditingPlan,
    newSession, setNewSession, editingSessionId, setEditingSessionId,
    newNoti, setNewNoti, newSkill, setNewSkill,
    newMediaUrl, setNewMediaUrl, newMediaType, setNewMediaType,
    customLegendNotes, setCustomLegendNotes,
    sessionSearchQuery, setSessionSearchQuery, sessionDateFilter, setSessionDateFilter,
    selectedSkillForHistory, setSelectedSkillForHistory,
    isEditingCoachAvatar, setIsEditingCoachAvatar, tempCoachAvatar, setTempCoachAvatar,
    isEditingStudentAvatar, setIsEditingStudentAvatar, tempStudentAvatar, setTempStudentAvatar,
    isPinModalOpen, setIsPinModalOpen, pinInputValue, setPinInputValue, pinModalError, setPinModalError,
    isChangingPin, setIsChangingPin, currentPinValueForChange, setCurrentPinValueForChange,
    newPinValue1, setNewPinValue1, newPinValue2, setNewPinValue2,
    isNotiHistoryOpen, setIsNotiHistoryOpen, selectedNotiId, setSelectedNotiId, toastMessage,
    isMobileMenuOpen, setIsMobileMenuOpen, isMobileSearchOpen, setIsMobileSearchOpen,
    chartContainerRefForHistory, translationTimeoutRef, t,
    sortedNotifications, resolvedStudents, activeStudent,
    filteredStudents, filteredPlans, filteredSessions,
    getAverageRating, getStrongestSkills, getNeedImprovementSkills,
    handleRoleToggle, handleLangToggle, handleThemeToggle,
    handleSaveStudent, handleDeleteStudent, handleSavePlan, handleSaveSkill,
    handleSaveSession, handleDeleteSession, handleSaveNoti, handleDeleteNoti,
    handleDirectSkillRate, handleUpdateCoachAvatar, handleUpdateStudentAvatar,
    handleAddMedia, handleSaveLegend, showToast, translateViToEn,
    futureIdeas, votedIdeas, setVotedIdeas, isFutureIdeasOpen, setIsFutureIdeasOpen,
    syncStudents, syncSkills, syncLessonPlans, syncSessions, syncNotifications, syncCoach,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}