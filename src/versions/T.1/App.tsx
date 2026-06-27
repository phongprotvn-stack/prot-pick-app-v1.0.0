import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  PlusCircle,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  User,
  ChevronDown,
  Bell,
  Star,
  Zap,
  Info,
  Layers,
  TrendingUp,
  Sun,
  Moon,
  Video,
  Flame,
  Plus,
  Compass,
  Vote,
  Activity,
  Youtube,
  Upload,
  Link,
  Image,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  X,
  Menu
} from 'lucide-react';

import { Student, CurriculumSkill, LessonPlan, Session, NotificationItem, CoachProfile, LevelType } from './types';
import { initialStudents, initialSkills, initialLessonPlans, initialSessions, initialNotifications, defaultCoach } from './data';
import { translations, LanguageKey } from './translations';
import AudioPlayer from './components/AudioPlayer';
import RadarChart from './components/RadarChart';
import { collection, doc, onSnapshot, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Helper function to compress large image files/base64 data using HTML5 Canvas safely
const compressImage = (base64Str: string, maxWidth = 300, maxHeight = 300, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export default function App() {
  // Database Coach PIN state synchronized from Firebase
  const [dbCoachPin, setDbCoachPin] = useState('1234');

  // Locale / Language State
  const [lang, setLang] = useState<LanguageKey>('vi');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Role Access State: 'coach' (Editor) or 'student' (Viewer who only sees public contents, can't write)
  const [role, setRole] = useState<'coach' | 'student'>('student');

  // Database States
  const [students, setStudents] = useState<Student[]>([]);
  const [skillsList, setSkillsList] = useState<CurriculumSkill[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [coach, setCoach] = useState<CoachProfile>(defaultCoach);

  // Active UI Controls
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'curriculum' | 'sessions' | 'about'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Dropdown Waiting Lists for Future Ideas
  const [isFutureIdeasOpen, setIsFutureIdeasOpen] = useState(false);
  const [votedIdeas, setVotedIdeas] = useState<Record<string, boolean>>({});

  // Form Modals / Expandable Edit Controls
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<LessonPlan> | null>(null);
  const [newSession, setNewSession] = useState<Partial<Session> | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newNoti, setNewNoti] = useState<Partial<NotificationItem> | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<CurriculumSkill> | null>(null);

  // Custom addition states
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'video' | 'photo' | 'local_photo'>('video');
  const [customLegendNotes, setCustomLegendNotes] = useState('');

  // Sessions list filtering search/date
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionDateFilter, setSessionDateFilter] = useState('');

  // Historical chart selected skill state
  const [selectedSkillForHistory, setSelectedSkillForHistory] = useState<CurriculumSkill | null>(null);
  const chartContainerRefForHistory = useRef<HTMLDivElement>(null);

  // States for live avatar modification
  const [isEditingCoachAvatar, setIsEditingCoachAvatar] = useState(false);
  const [tempCoachAvatar, setTempCoachAvatar] = useState('');
  const [isEditingStudentAvatar, setIsEditingStudentAvatar] = useState(false);
  const [tempStudentAvatar, setTempStudentAvatar] = useState('');

  // PIN Verification and PIN management states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInputValue, setPinInputValue] = useState('');
  const [pinModalError, setPinModalError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false); // Mode: false for login, true for changing PIN
  const [currentPinValueForChange, setCurrentPinValueForChange] = useState('');
  const [newPinValue1, setNewPinValue1] = useState('');
  const [newPinValue2, setNewPinValue2] = useState('');

  // Notification history popover state and debounce translation references
  const [isNotiHistoryOpen, setIsNotiHistoryOpen] = useState(false);
  const translationTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Toast / Status Notification Center Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile Web Menu & Search Overlay States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Scroll historical timeline chart to the newest date (right end) on open
  useEffect(() => {
    if (selectedSkillForHistory && chartContainerRefForHistory.current) {
      setTimeout(() => {
        if (chartContainerRefForHistory.current) {
          chartContainerRefForHistory.current.scrollLeft = chartContainerRefForHistory.current.scrollWidth;
        }
      }, 100);
    }
  }, [selectedSkillForHistory]);

  // Debounced auto-translation from Vietnamese feedback to English
  useEffect(() => {
    if (!newSession?.coachFeedbackVI) {
      return;
    }
    const delayDebounce = setTimeout(async () => {
      const viText = newSession.coachFeedbackVI || '';
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(viText)}`);
        const data = await res.json();
        if (data && data[0]) {
          const translated = data[0].map((x: any) => x[0]).join('');
          setNewSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              coachFeedbackEN: translated
            };
          });
        }
      } catch (err) {
        console.error("Auto translate error:", err);
      }
    }, 800); // 800ms debounce
    return () => clearTimeout(delayDebounce);
  }, [newSession?.coachFeedbackVI]);

  // Load Database from LocalStorage/Firebase or seed defaults
  useEffect(() => {
    const savedLang = localStorage.getItem('protpick_lang') as LanguageKey;
    if (savedLang) setLang(savedLang);

    const savedTheme = localStorage.getItem('protpick_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);

    // Initial local cache hydration for lightning fast UI render
    function getLocalOrSet<T>(key: string, fallback: T): T {
      const items = localStorage.getItem(key);
      if (items) {
        try { return JSON.parse(items); } catch (e) { return fallback; }
      } else {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
    }

    setStudents(getLocalOrSet<Student[]>('protpick_students', initialStudents));
    setSkillsList(getLocalOrSet<CurriculumSkill[]>('protpick_skills', initialSkills));
    setLessonPlans(getLocalOrSet<LessonPlan[]>('protpick_lessonplans', initialLessonPlans));
    setSessions(getLocalOrSet<Session[]>('protpick_sessions', initialSessions));
    setNotifications(getLocalOrSet<NotificationItem[]>('protpick_notifications', initialNotifications));
    setCoach(getLocalOrSet<CoachProfile>('protpick_coach', defaultCoach));

    const savedLegend = localStorage.getItem('protpick_legend_notes');
    if (savedLegend) {
      setCustomLegendNotes(savedLegend);
    } else {
      setCustomLegendNotes('[Phongprot] Hướng dẫn bổ sung tài liệu cầm vợt xoay cổ tay, di chuyển phản công dink sâu, chiến thuật ép góc dink biên bếp trái tay...');
    }

    const savedPin = localStorage.getItem('protpick_coach_pin') || '1234';
    setDbCoachPin(savedPin);

    // Real-time Firebase Synchronization
    const unsubscribes: (() => void)[] = [];

    const initFirebaseData = async () => {
      try {
        // Search and Seed if database tables are empty
        const refStudents = collection(db, 'students');
        const snapStudents = await getDocs(refStudents);
        if (snapStudents.empty) {
          for (const s of initialStudents) {
            await setDoc(doc(db, 'students', s.id), s);
          }
        }

        const refSkills = collection(db, 'skills');
        const snapSkills = await getDocs(refSkills);
        if (snapSkills.empty) {
          for (const s of initialSkills) {
            await setDoc(doc(db, 'skills', s.id), s);
          }
        }

        const refLessonPlans = collection(db, 'lessonplans');
        const snapLessonPlans = await getDocs(refLessonPlans);
        if (snapLessonPlans.empty) {
          for (const lp of initialLessonPlans) {
            await setDoc(doc(db, 'lessonplans', lp.id), lp);
          }
        }

        const refSessions = collection(db, 'sessions');
        const snapSessions = await getDocs(refSessions);
        if (snapSessions.empty) {
          for (const s of initialSessions) {
            await setDoc(doc(db, 'sessions', s.id), s);
          }
        }

        const refNotis = collection(db, 'notifications');
        const snapNotis = await getDocs(refNotis);
        if (snapNotis.empty) {
          for (const n of initialNotifications) {
            await setDoc(doc(db, 'notifications', n.id), n);
          }
        }

        const refCoachDoc = doc(db, 'settings', 'coach');
        const snapCoach = await getDoc(refCoachDoc);
        if (!snapCoach.exists()) {
          await setDoc(refCoachDoc, defaultCoach);
        }

        const refLegendDoc = doc(db, 'settings', 'legend');
        const snapLegend = await getDoc(refLegendDoc);
        if (!snapLegend.exists()) {
          await setDoc(refLegendDoc, { notes: '[Phongprot] Hướng dẫn bổ sung tài liệu cầm vợt xoay cổ tay, di chuyển phản công dink sâu, chiến thuật ép góc dink biên bếp trái tay...' });
        }

        const refPinDoc = doc(db, 'settings', 'security');
        const snapPin = await getDoc(refPinDoc);
        if (!snapPin.exists()) {
          await setDoc(refPinDoc, { pin: '1234' }); // Seeding current master pin is '1234'
        }
      } catch (err) {
        console.error("Error checking or seeding Firebase Firestore database:", err);
      }
    };

    initFirebaseData().then(() => {
      // 1. Subscribe Students
      unsubscribes.push(
        onSnapshot(collection(db, 'students'), (snap) => {
          const list: Student[] = [];
          snap.forEach((doc) => {
            list.push(doc.data() as Student);
          });
          if (list.length > 0) {
            setStudents(list);
            localStorage.setItem('protpick_students', JSON.stringify(list));
          }
        })
      );

      // 2. Subscribe Skills
      unsubscribes.push(
        onSnapshot(collection(db, 'skills'), (snap) => {
          const list: CurriculumSkill[] = [];
          snap.forEach((doc) => {
            list.push(doc.data() as CurriculumSkill);
          });
          if (list.length > 0) {
            setSkillsList(list);
            localStorage.setItem('protpick_skills', JSON.stringify(list));
          }
        })
      );

      // 3. Subscribe Lesson Plans
      unsubscribes.push(
        onSnapshot(collection(db, 'lessonplans'), (snap) => {
          const list: LessonPlan[] = [];
          snap.forEach((doc) => {
            list.push(doc.data() as LessonPlan);
          });
          if (list.length > 0) {
            setLessonPlans(list);
            localStorage.setItem('protpick_lessonplans', JSON.stringify(list));
          }
        })
      );

      // 4. Subscribe Sessions
      unsubscribes.push(
        onSnapshot(collection(db, 'sessions'), (snap) => {
          const list: Session[] = [];
          snap.forEach((doc) => {
            list.push(doc.data() as Session);
          });
          if (list.length > 0) {
            setSessions(list);
            localStorage.setItem('protpick_sessions', JSON.stringify(list));
          }
        })
      );

      // 5. Subscribe Notifications
      unsubscribes.push(
        onSnapshot(collection(db, 'notifications'), (snap) => {
          const list: NotificationItem[] = [];
          snap.forEach((doc) => {
            list.push(doc.data() as NotificationItem);
          });
          if (list.length > 0) {
            setNotifications(list);
            localStorage.setItem('protpick_notifications', JSON.stringify(list));
          }
        })
      );

      // 6. Subscribe Coach Profile
      unsubscribes.push(
        onSnapshot(doc(db, 'settings', 'coach'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as CoachProfile;
            setCoach(data);
            localStorage.setItem('protpick_coach', JSON.stringify(data));
          }
        })
      );

      // 7. Subscribe Legend
      unsubscribes.push(
        onSnapshot(doc(db, 'settings', 'legend'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as { notes: string };
            setCustomLegendNotes(data.notes);
            localStorage.setItem('protpick_legend_notes', data.notes);
          }
        })
      );

      // 8. Subscribe Security/PIN
      unsubscribes.push(
        onSnapshot(doc(db, 'settings', 'security'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as { pin: string };
            setDbCoachPin(data.pin);
            localStorage.setItem('protpick_coach_pin', data.pin);
          }
        })
      );
    });

    return () => {
      unsubscribes.forEach(sub => sub());
    };
  }, []);

  // Sync utilities which write securely to Firestore
  const syncStudents = async (data: Student[]) => {
    setStudents(data);
    localStorage.setItem('protpick_students', JSON.stringify(data));
    try {
      // Delete from Firestore if deleted locally
      const currentIds = new Set(data.map(item => item.id));
      for (const s of students) {
        if (!currentIds.has(s.id)) {
          await deleteDoc(doc(db, 'students', s.id));
        }
      }
      // Upsert elements
      for (const item of data) {
        await setDoc(doc(db, 'students', item.id), item);
      }
    } catch (err) {
      console.error("Firestore sync students error:", err);
    }
  };

  const syncSkills = async (data: CurriculumSkill[]) => {
    setSkillsList(data);
    localStorage.setItem('protpick_skills', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(item => item.id));
      for (const s of skillsList) {
        if (!currentIds.has(s.id)) {
          await deleteDoc(doc(db, 'skills', s.id));
        }
      }
      for (const item of data) {
        await setDoc(doc(db, 'skills', item.id), item);
      }
    } catch (err) {
      console.error("Firestore sync skills error:", err);
    }
  };

  const syncLessonPlans = async (data: LessonPlan[]) => {
    setLessonPlans(data);
    localStorage.setItem('protpick_lessonplans', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(item => item.id));
      for (const s of lessonPlans) {
        if (!currentIds.has(s.id)) {
          await deleteDoc(doc(db, 'lessonplans', s.id));
        }
      }
      for (const item of data) {
        await setDoc(doc(db, 'lessonplans', item.id), item);
      }
    } catch (err) {
      console.error("Firestore sync lessonplans error:", err);
    }
  };

  const syncSessions = async (data: Session[]) => {
    setSessions(data);
    localStorage.setItem('protpick_sessions', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(item => item.id));
      for (const s of sessions) {
        if (!currentIds.has(s.id)) {
          await deleteDoc(doc(db, 'sessions', s.id));
        }
      }
      for (const item of data) {
        await setDoc(doc(db, 'sessions', item.id), item);
      }
    } catch (err) {
      console.error("Firestore sync sessions error:", err);
    }
  };

  const syncNotifications = async (data: NotificationItem[]) => {
    setNotifications(data);
    localStorage.setItem('protpick_notifications', JSON.stringify(data));
    try {
      const currentIds = new Set(data.map(item => item.id));
      for (const s of notifications) {
        if (!currentIds.has(s.id)) {
          await deleteDoc(doc(db, 'notifications', s.id));
        }
      }
      for (const item of data) {
        await setDoc(doc(db, 'notifications', item.id), item);
      }
    } catch (err) {
      console.error("Firestore sync notifications error:", err);
    }
  };

  // Sync Coach profile
  const syncCoach = async (updatedCoach: CoachProfile) => {
    setCoach(updatedCoach);
    localStorage.setItem('protpick_coach', JSON.stringify(updatedCoach));
    try {
      await setDoc(doc(db, 'settings', 'coach'), updatedCoach);
    } catch (err) {
      console.error("Firestore sync coach profile error:", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper for dynamic language translation lookup
  const t = translations[lang];

  // Auto-translate Vietnamese text to English via Google Translate (free, no key)
  const translateViToEn = async (text: string): Promise<string> => {
    if (!text || text.trim() === '') return '';
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
    } catch (err) {
      console.error("Auto-translation to EN failed:", err);
    }
    return '';
  };

  // Sort notifications descending by date, and then by ID (contains Date.now() timestamp!)
  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.id || '').localeCompare(a.id || '');
  });

  // Auto-calculated fields derived from Sessions and ratings
  // 1. Calculate Average overall rating of student based on their skills
  const getAverageRating = (student: Student) => {
    const scores = Object.values(student.skills);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return parseFloat((sum / scores.length).toFixed(1));
  };

  // 2. Identify student's strongest skills (>3 points)
  const getStrongestSkills = (student: Student) => {
    return Object.entries(student.skills)
      .filter(([_, score]) => score >= 4)
      .map(([name, score]) => ({ name, score }));
  };

  // 3. Identify student's area to improve (<=2 points)
  const getNeedImprovementSkills = (student: Student) => {
    return Object.entries(student.skills)
      .filter(([_, score]) => score <= 2)
      .map(([name, score]) => ({ name, score }));
  };

  // Derive students with their latest session skills merged on-the-fly
  const resolvedStudents = React.useMemo(() => {
    return students.map(student => {
      // Find all completed sessions for this student
      const studentSessions = sessions
        .filter(s => s.studentId === student.id && s.status === 'Completed')
        .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

      const mergedSkills = { ...student.skills };

      studentSessions.forEach(session => {
        if (session.skillScores) {
          Object.entries(session.skillScores).forEach(([skillName, score]) => {
            if (score !== undefined) {
              mergedSkills[skillName] = score;
            }
          });
        }
      });

      return {
        ...student,
        skills: mergedSkills
      };
    });
  }, [students, sessions]);

  // Get active selected student object
  const activeStudent = resolvedStudents.find(s => s.id === (selectedStudentId || resolvedStudents[0]?.id));

  // Switch role and update UI accordingly
  const handleRoleToggle = (newRole: 'coach' | 'student') => {
    if (newRole === 'coach') {
      setPinInputValue('');
      setPinModalError('');
      setIsChangingPin(false);
      setIsPinModalOpen(true);
    } else {
      setRole('student');
      localStorage.setItem('protpick_role', 'student');
      showToast(`${t.activeRole}: ${t.roleStudent}`);
    }
  };

  // Switch language
  const handleLangToggle = (newLang: LanguageKey) => {
    setLang(newLang);
    localStorage.setItem('protpick_lang', newLang);
  };

  // Switch theme
  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('protpick_theme', nextTheme);
  };

  // Filter items based on active search bar
  const filteredStudents = resolvedStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.targetGoal.toLowerCase().includes(searchQuery.toLowerCase());
    if (role === 'student') {
      return s.isPublic && matchSearch;
    }
    return matchSearch;
  });

  const filteredPlans = lessonPlans.filter(p => {
    const titleVal = lang === 'vi' ? p.titleVI : p.titleEN;
    const descVal = lang === 'vi' ? p.descriptionVI : p.descriptionEN;
    const matchSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        descVal.toLowerCase().includes(searchQuery.toLowerCase());
    if (role === 'student') return p.isPublic && matchSearch;
    return matchSearch;
  });

  const filteredSessions = sessions.filter(s => {
    const student = resolvedStudents.find(st => st.id === s.studentId);
    const plan = lessonPlans.find(lp => lp.id === s.lessonPlanId);
    const planTitle = plan ? (lang === 'vi' ? plan.titleVI : plan.titleEN) : '';
    
    const query = sessionSearchQuery.toLowerCase().trim();
    const dateQuery = sessionDateFilter.trim();
    
    const matchesNameOrTitle = query === '' || 
      s.title.toLowerCase().includes(query) ||
      (student?.name || '').toLowerCase().includes(query) ||
      planTitle.toLowerCase().includes(query);
      
    const matchesDate = dateQuery === '' || s.date === dateQuery;
    
    const matchesGlobalSearch = searchQuery === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      planTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
    const isMatched = matchesNameOrTitle && matchesDate && matchesGlobalSearch;
    
    if (role === 'student') return s.isPublic && isMatched;
    return isMatched;
  });

  // Handle adding new student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent?.name) return;

    if (editingStudent.id) {
      // Edit mode
      const updated = students.map(s => s.id === editingStudent.id ? { ...s, ...editingStudent } as Student : s);
      syncStudents(updated);
      showToast(lang === 'vi' ? "Cập nhật học viên thành công!" : "Student details saved successfully!");
    } else {
      // Add mode
      const defaultSkillScores: Record<string, number> = {};
      skillsList.forEach(s => {
        defaultSkillScores[s.name] = 2; // default entry level baseline
      });

      const newRecord: Student = {
        id: 'std_' + Date.now(),
        name: editingStudent.name || 'New Pupil',
        avatar: editingStudent.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        level: editingStudent.level || '1.0-2.0',
        joiningDate: editingStudent.joiningDate || new Date().toISOString().split('T')[0],
        isPublic: editingStudent.isPublic !== undefined ? editingStudent.isPublic : true,
        skills: { ...defaultSkillScores, ...(editingStudent.skills || {}) },
        targetGoal: editingStudent.targetGoal || '',
        notes: editingStudent.notes || '',
        phone: editingStudent.phone || '',
        email: editingStudent.email || '',
        nationality: editingStudent.nationality || 'Việt Nam',
        dominantHand: editingStudent.dominantHand || 'Phải'
      };
      syncStudents([...students, newRecord]);
      setSelectedStudentId(newRecord.id);
      showToast(lang === 'vi' ? "Thêm học viên thành công!" : "New student registered!");
    }
    setEditingStudent(null);
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      syncStudents(students.filter(s => s.id !== id));
      showToast(lang === 'vi' ? "Xóa học viên thành công" : "Student deleted");
      if (selectedStudentId === id) setSelectedStudentId('');
    }
  };

  // Update Coach Avatar live
  const handleUpdateCoachAvatar = () => {
    if (!tempCoachAvatar) return;
    const updatedCoach = { ...coach, avatar: tempCoachAvatar };
    syncCoach(updatedCoach);
    setIsEditingCoachAvatar(false);
    showToast(lang === 'vi' ? "Đã thay đổi ảnh đại diện HLV!" : "Coach profile picture updated!");
  };

  // Update Student Avatar live
  const handleUpdateStudentAvatar = () => {
    if (!activeStudent || !tempStudentAvatar) return;
    const updated = students.map(s => {
      if (s.id === activeStudent.id) {
        return {
          ...s,
          avatar: tempStudentAvatar
        };
      }
      return s;
    });
    syncStudents(updated);
    setIsEditingStudentAvatar(false);
    showToast(lang === 'vi' ? "Đã cập nhật ảnh học viên!" : "Student profile picture updated!");
  };

  // Quick rating grade directly in profile view for Coach
  const handleDirectSkillRate = (studentId: string, skillName: string, score: number) => {
    if (role !== 'coach') return;
    const updated = students.map(st => {
      if (st.id === studentId) {
        return {
          ...st,
          skills: {
            ...st.skills,
            [skillName]: score
          }
        };
      }
      return st;
    });
    syncStudents(updated);

    // Sync latest completed session to prevent on-the-fly resolvedStudents from overwriting this score
    const studentSessions = sessions
      .filter(s => s.studentId === studentId && s.status === 'Completed')
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    
    if (studentSessions.length > 0) {
      const targetSession = studentSessions.find(s => s.skillScores && s.skillScores[skillName] !== undefined) || studentSessions[0];
      if (targetSession) {
        const updatedSessions = sessions.map(s => {
          if (s.id === targetSession.id) {
            return {
              ...s,
              skillScores: {
                ...(s.skillScores || {}),
                [skillName]: score
              }
            };
          }
          return s;
        });
        syncSessions(updatedSessions);
      }
    }

    showToast(`Updated ${skillName} to ${score}/5`);
  };

  // Save new skill in Curriculum
  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill?.name) return;

    const skillObj: CurriculumSkill = {
      id: 'skill_' + Date.now(),
      name: newSkill.name,
      category: newSkill.category || 'Basics',
      descriptionVI: newSkill.descriptionVI || '',
      descriptionEN: newSkill.descriptionEN || ''
    };

    const updatedSkills = [...skillsList, skillObj];
    syncSkills(updatedSkills);

    // Propagate skills to existing students
    const updated = students.map(s => {
      if (s.skills[skillObj.name] === undefined) {
        return {
          ...s,
          skills: {
            ...s.skills,
            [skillObj.name]: 2 // baseline
          }
        };
      }
      return s;
    });
    syncStudents(updated);

    showToast(lang === 'vi' ? `Đã thêm kỹ năng ${skillObj.name}` : `Skill ${skillObj.name} added`);
    setNewSkill(null);
  };

  // Save Lesson Plan
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.titleVI) return;

    if (editingPlan.id) {
      const updated = lessonPlans.map(p => p.id === editingPlan.id ? { ...p, ...editingPlan } as LessonPlan : p);
      syncLessonPlans(updated);
      showToast("Saved plan");
    } else {
      const newRecord: LessonPlan = {
        id: 'lp_' + Date.now(),
        titleVI: editingPlan.titleVI || '',
        titleEN: editingPlan.titleEN || '',
        descriptionVI: editingPlan.descriptionVI || '',
        descriptionEN: editingPlan.descriptionEN || '',
        skillsFocused: editingPlan.skillsFocused || [],
        durationMin: editingPlan.durationMin || 60,
        isPublic: editingPlan.isPublic !== undefined ? editingPlan.isPublic : true
      };
      syncLessonPlans([...lessonPlans, newRecord]);
      showToast("New general lesson plan added");
    }
    setEditingPlan(null);
  };

  // Handle building new coaching Session (completed or scheduled)
  const handleSaveSession = (e: React.FormEvent, forceStatus?: 'Scheduled' | 'Completed') => {
    if (e) e.preventDefault();
    if (!newSession?.studentId || !newSession?.lessonPlanId) {
      alert(lang === 'vi' ? "Vui lòng chọn Học Viên và Giáo Án Áp Dụng" : "Please select Student and Lesson Plan target");
      return;
    }

    const finalStatus = forceStatus || newSession.status || 'Scheduled';

    if (editingSessionId) {
      // Editing / Reviewing an existing session
      const updatedSessions = sessions.map(s => {
        if (s.id === editingSessionId) {
          return {
            ...s,
            studentId: newSession.studentId || '',
            date: newSession.date || new Date().toISOString().split('T')[0],
            lessonPlanId: newSession.lessonPlanId || '',
            title: newSession.title || 'Coaching Session',
            durationMin: Number(newSession.durationMin) || 60,
            notes: newSession.notes || '',
            status: finalStatus,
            skillScores: finalStatus === 'Completed' ? (newSession.skillScores || {}) : {},
            isPublic: newSession.isPublic !== undefined ? newSession.isPublic : true,
            coachFeedbackVI: finalStatus === 'Completed' ? (newSession.coachFeedbackVI || '') : '',
            coachFeedbackEN: finalStatus === 'Completed' ? (newSession.coachFeedbackEN || '') : '',
            location: newSession.location || ''
          };
        }
        return s;
      });

      syncSessions(updatedSessions);

      // If completed, update student profile attributes immediately!
      if (finalStatus === 'Completed') {
        const studentToUpdate = students.find(s => s.id === newSession.studentId);
        if (studentToUpdate) {
          const updatedSkills = { ...studentToUpdate.skills };
          Object.entries(newSession.skillScores || {}).forEach(([sName, rating]) => {
            updatedSkills[sName] = Number(rating) || 1;
          });

          const updatedStudents = students.map(s => {
            if (s.id === newSession.studentId) {
              return { ...s, skills: updatedSkills };
            }
            return s;
          });
          syncStudents(updatedStudents);
        }
      }

      showToast(lang === 'vi' ? "Đã cập nhật đổi trạng thái & hoàn thiện đánh giá!" : "Updated session evaluation details!");
      setNewSession(null);
      setEditingSessionId(null);
    } else {
      // Direct session generation
      const sessionObj: Session = {
        id: 'sess_' + Date.now(),
        studentId: newSession.studentId || '',
        date: newSession.date || new Date().toISOString().split('T')[0],
        lessonPlanId: newSession.lessonPlanId || '',
        title: newSession.title || 'Coaching Session',
        durationMin: Number(newSession.durationMin) || 60,
        notes: finalStatus === 'Completed' ? (newSession.notes || '') : '',
        status: finalStatus,
        skillScores: finalStatus === 'Completed' ? (newSession.skillScores || {}) : {},
        isPublic: newSession.isPublic !== undefined ? newSession.isPublic : true,
        coachFeedbackVI: finalStatus === 'Completed' ? (newSession.coachFeedbackVI || '') : '',
        coachFeedbackEN: finalStatus === 'Completed' ? (newSession.coachFeedbackEN || '') : '',
        location: newSession.location || ''
      };

      const updatedSessions = [sessionObj, ...sessions];
      syncSessions(updatedSessions);

      // If completed, update student profile attributes immediately!
      if (finalStatus === 'Completed' && Object.keys(sessionObj.skillScores).length > 0) {
        const studentToUpdate = students.find(s => s.id === sessionObj.studentId);
        if (studentToUpdate) {
          const updatedSkills = { ...studentToUpdate.skills };
          Object.entries(sessionObj.skillScores).forEach(([sName, rating]) => {
            updatedSkills[sName] = Number(rating) || 1;
          });

          const updatedStudents = students.map(s => {
            if (s.id === sessionObj.studentId) {
              return { ...s, skills: updatedSkills };
            }
            return s;
          });
          syncStudents(updatedStudents);
        }
      }

      showToast(lang === 'vi' 
        ? (finalStatus === 'Completed' ? "Đã hoàn thành buổi học & cập nhật kết quả!" : "Đã lên lịch chờ cho buổi dạy!")
        : (finalStatus === 'Completed' ? "Session completed & scores auto-updated!" : "Session scheduled successfully!")
      );
      setNewSession(null);
    }
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      syncSessions(sessions.filter(s => s.id !== id));
      showToast("Session removed");
    }
  };

  // Post Notification / Announcement
  const handleSaveNoti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoti?.titleVI || !newNoti?.contentVI) return;

    const notiItem: NotificationItem = {
      id: 'noti_' + Date.now(),
      titleVI: newNoti.titleVI || '',
      titleEN: newNoti.titleEN || '',
      contentVI: newNoti.contentVI || '',
      contentEN: newNoti.contentEN || '',
      date: newNoti.date || new Date().toISOString().split('T')[0],
      type: newNoti.type || 'info',
      isPublic: newNoti.isPublic !== undefined ? newNoti.isPublic : true
    };

    syncNotifications([notiItem, ...notifications]);
    showToast(lang === 'vi' ? "Đã đăng thông báo cho học viên!" : "New status broadcasted!");
    setNewNoti(null);
  };

  // Delete Announcement
  const handleDeleteNoti = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      syncNotifications(notifications.filter(n => n.id !== id));
      showToast("Notification deleted");
    }
  };

  // Add video/photo to Coach Profile About tab
  const handleAddMedia = () => {
    if (!newMediaUrl) return;

    let mediaUrlInput = newMediaUrl;
    // Extract youtube video ID if it is a whole link
    if (newMediaType === 'video') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = newMediaUrl.match(regExp);
      if (match && match[2].length === 11) {
        mediaUrlInput = match[2];
      }
    }

    const updatedCoach = { ...coach };
    if (newMediaType === 'video') {
      updatedCoach.youtubeYoutIds = [...coach.youtubeYoutIds, mediaUrlInput];
    } else {
      updatedCoach.photos = [...coach.photos, mediaUrlInput];
    }

    syncCoach(updatedCoach);
    setNewMediaUrl('');
    showToast("Media component loaded successfully");
  };

  // Save Legend Notes
  const handleSaveLegend = async () => {
    localStorage.setItem('protpick_legend_notes', customLegendNotes);
    try {
      await setDoc(doc(db, 'settings', 'legend'), { notes: customLegendNotes });
    } catch (err) {
      console.error(err);
    }
    showToast(lang === 'vi' ? "Lưu tài liệu chú giải thành công!" : "Custom evaluation legend updated!");
  };

  // Future ideas backlogs
  const futureIdeas = [
    { id: 'f1', titleVI: '🤖 Tích hợp phân tích AI trận đấu bóng qua Camera', titleEN: '🤖 AI Video Analysis for tactical tracking' },
    { id: 'f2', titleVI: '📊 Đồng bộ hóa trực tiếp chỉ số DUPR cá nhân học viên', titleEN: '📊 Real-time official DUPR API score matching' },
    { id: 'f3', titleVI: '📅 Hệ thống đặt sân & lịch hẹn slot tập của Phongprot', titleEN: '📅 Live Court booking slot coordinator' },
    { id: 'f4', titleVI: '👟 Tư vấn và Review vợt, dụng cụ bóng chuyên sâu', titleEN: '👟 Pro-shop paddle & accessories reviews' },
    { id: 'f5', titleVI: '🥗 Giáo án dinh dưỡng & thể lực bổ trợ phản xạ nhanh', titleEN: '🥗 Reflex agility exercises & dietary plans' }
  ];

  const handleVoteIdea = (id: string) => {
    setVotedIdeas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    showToast(t.voted);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-zinc-950 text-zinc-100' : 'bg-stone-50/70 text-zinc-900'}`} id="prot-pick-app">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Activity className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SETTINGS DRAWER (HAMBURGER MENU) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer content panel */}
          <div className="relative flex flex-col w-80 max-w-[85vw] bg-zinc-950 border-r border-zinc-850 text-white p-5 shadow-2xl h-full animate-slideRight animate-duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                <span className="font-sans font-black text-sm uppercase tracking-wider text-rose-500">
                  {lang === 'vi' ? 'Cài đặt hệ thống' : 'System Settings'}
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-6 no-scrollbar">
              {/* ROLE PICKER */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === 'vi' ? 'Vai Trò / User Role' : 'User Role'}
                </span>
                <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => { handleRoleToggle('coach'); setIsMobileMenuOpen(false); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      role === 'coach' ? 'bg-rose-600 text-white shadow-sm font-black' : 'text-zinc-400'
                    }`}
                  >
                    🛠 HLV Phong
                  </button>
                  <button
                    onClick={() => { handleRoleToggle('student'); setIsMobileMenuOpen(false); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      role === 'student' ? 'bg-rose-600 text-white shadow-sm font-black' : 'text-zinc-400'
                    }`}
                  >
                    👥 Học Viên
                  </button>
                </div>
              </div>

              {/* LANGUAGE PICKER */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === 'vi' ? 'Ngôn ngữ' : 'Language'}
                </span>
                <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
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

              {/* THEME TOGGLE */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === 'vi' ? 'Giao diện' : 'Color Theme'}
                </span>
                <button
                  onClick={handleThemeToggle}
                  className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <span className="text-zinc-300">
                    {theme === 'dark' ? (lang === 'vi' ? 'Chế độ tối (Dark)' : 'Dark Theme') : (lang === 'vi' ? 'Chế độ sáng (Light)' : 'Light Theme')}
                  </span>
                  <div className="p-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-350">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>

              {/* MUSIC CONTROLLER FOR MOBILE */}
              <div className="space-y-2 pt-2 border-t border-zinc-850">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold mb-1">
                  {lang === 'vi' ? 'Nhạc nền Lofi' : 'Lofi Music Settings'}
                </span>
                <AudioPlayer lang={lang} role={role} compact={false} />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-850 text-center space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">
                PROT PICK Huấn Luyện
              </span>
              <span className="text-[10px] font-black text-rose-600 tracking-widest font-mono">
                {coach.slogan}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION WITH SOFT RED ACCENTS & CONTROLS */}
      <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-850 text-white shadow-md">
        
        {/* DESKTOP HEADER (MD AND LARGER SCREEN) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 md:px-6 py-4 items-center justify-between gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none hover:opacity-90 transition-all duration-200"
            onClick={() => {
              setActiveTab('dashboard');
              setSearchQuery('');
              setSelectedStudentId('');
            }}
            title={lang === 'vi' ? "Quay lại Bảng Điều Khiển" : "Back to Dashboard"}
          >
            <span className="text-3xl">🏓</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">{t.appTitle}</h1>
                <span className="bg-rose-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  {coach.slogan}
                </span>
                <span className="bg-zinc-800 text-[10px] text-zinc-300 font-mono px-2 py-0.5 rounded-md border border-zinc-700">
                  vT.1
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono tracking-wide">{t.appSub} — HLV {coach.name}</p>
            </div>
          </div>

          {/* GLOBAL SETTINGS TOOLBAR */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* COMPACT MUSIC PLAYER */}
            <AudioPlayer lang={lang} role={role} compact={true} />

            {/* ROLE SWITCHER */}
            <div className="bg-zinc-800 p-1 rounded-xl flex items-center border border-zinc-700">
              <button
                onClick={() => handleRoleToggle('coach')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'coach'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🛠 {lang === 'vi' ? 'HLV Phong' : 'Coach Phong'}
              </button>
              <button
                onClick={() => handleRoleToggle('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👥 {lang === 'vi' ? 'Học Viên' : 'Student'}
              </button>
            </div>

            {/* BILINGUAL LANGUAGE SWITCH */}
            <div className="bg-zinc-800 p-1 rounded-xl flex items-center border border-zinc-700">
              <button
                onClick={() => handleLangToggle('vi')}
                className={`px-2 py-1 text-xs font-bold rounded-lg ${lang === 'vi' ? 'bg-zinc-700 text-rose-450' : 'text-zinc-400'}`}
                title="Tiếng Việt"
              >
                VN
              </button>
              <button
                onClick={() => handleLangToggle('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg ${lang === 'en' ? 'bg-zinc-700 text-rose-450' : 'text-zinc-400'}`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* NOTIFICATION BELL WITH HISTORY DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsNotiHistoryOpen(!isNotiHistoryOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
                  isNotiHistoryOpen 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md' 
                    : 'bg-zinc-800 hover:bg-zinc-705 border-zinc-700 text-zinc-300'
                }`}
                title={lang === 'vi' ? "Lịch sử thông báo" : "Announcement History"}
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => role === 'coach' || n.isPublic).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-650 bg-rose-600 text-white text-[9px] font-bold px-1 rounded-full border border-zinc-900">
                    {notifications.filter(n => role === 'coach' || n.isPublic).length}
                  </span>
                )}
              </button>

              {isNotiHistoryOpen && (
                <div className="absolute right-0 mt-3.5 z-50 w-80 md:w-96 bg-zinc-90 w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl p-4 space-y-3 font-sans animate-slideDown overflow-visible">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" />
                      {lang === 'vi' ? 'Lịch sử thông báo' : 'Notification History'}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded-full font-bold">
                      {notifications.filter(n => role === 'coach' || n.isPublic).length}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 no-scrollbar-y">
                    {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length > 0 ? (
                      sortedNotifications.filter(n => role === 'coach' || n.isPublic).map((noti) => (
                        <div key={noti.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/65 border border-zinc-150 dark:border-zinc-850 hover:border-zinc-205 dark:hover:border-zinc-800 rounded-xl space-y-1.5 text-left relative group">
                          <div className="flex items-center justify-between gap-2">
                            <span className="bg-zinc-200 dark:bg-zinc-800 text-[9px] text-zinc-600 dark:text-zinc-400 font-mono px-1.5 py-0.5 rounded font-bold">{noti.date}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-wider border ${
                                noti.type === 'success' 
                                  ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20' 
                                  : noti.type === 'warning' 
                                    ? 'bg-amber-500/10 text-amber-655 dark:text-amber-400 border-amber-500/20' 
                                    : 'bg-sky-505 bg-sky-500/10 text-sky-650 dark:text-sky-400 border-sky-500/20'
                              }`}>
                                {lang === 'vi' ? (noti.type === 'success' ? 'Thành công' : noti.type === 'warning' ? 'Cảnh báo' : 'Thông tin') : noti.type.toUpperCase()}
                              </span>
                              {role === 'coach' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNoti(noti.id)}
                                  className="text-zinc-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer ml-1"
                                  title="Delete announcement from history"
                                >
                                  ❌
                                </button>
                              )}
                            </div>
                          </div>
                          <h5 className="font-bold text-xs text-zinc-900 dark:text-white tracking-tight">
                            {lang === 'vi' ? noti.titleVI : noti.titleEN}
                          </h5>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-450 leading-relaxed">
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

            {/* LIGHT/DARK TOGGLE */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-705 border border-zinc-700 text-zinc-300 transition-all cursor-pointer"
              title={t.themeToggle}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* MOBILE HEADER (MOBILE DEVICE SCREEN) */}
        <div className="flex md:hidden max-w-7xl mx-auto px-4 py-3 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 cursor-pointer"
              title="Menu"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div 
              className="flex items-center gap-1.5 cursor-pointer select-none"
              onClick={() => {
                setActiveTab('dashboard');
                setSearchQuery('');
                setSelectedStudentId('');
              }}
            >
              <span className="text-2xl">🏓</span>
              <div>
                <div className="flex items-center gap-1">
                  <h1 className="text-base font-black tracking-tight text-white">{t.appTitle}</h1>
                  <span className="bg-rose-600 text-[8px] text-white px-1 py-0.5 rounded-md font-bold uppercase">
                    vT.1
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search toggler button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMobileSearchOpen 
                  ? 'bg-rose-600 border-rose-500 text-white shadow-md' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
              title="Tìm kiếm"
              type="button"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotiHistoryOpen(!isNotiHistoryOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
                  isNotiHistoryOpen 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md' 
                    : 'bg-zinc-800 hover:bg-zinc-705 border-zinc-700 text-zinc-300'
                }`}
                title="Thông báo"
                type="button"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => role === 'coach' || n.isPublic).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-650 bg-rose-600 text-white text-[8px] font-bold px-1 rounded-full border border-zinc-900">
                    {notifications.filter(n => role === 'coach' || n.isPublic).length}
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
                      {notifications.filter(n => role === 'coach' || n.isPublic).length}
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 no-scrollbar-y">
                    {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length > 0 ? (
                      sortedNotifications.filter(n => role === 'coach' || n.isPublic).map((noti) => (
                        <div key={noti.id} className="p-2.5 bg-zinc-50 dark:bg-zinc-950/65 border border-zinc-150 dark:border-zinc-850 hover:border-zinc-205 dark:hover:border-zinc-800 rounded-xl space-y-1 text-left relative group">
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
                          <p className="text-[10px] text-zinc-600 dark:text-zinc-450 leading-relaxed">
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

        {/* MOBILE SEARCH OVERLAY ROW */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 py-2 bg-zinc-950 border-t border-zinc-850 animate-slideDown">
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-zinc-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer font-bold shrink-0 ml-1.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* TABS NAVIGATION PANEL (DESKTOP ONLY) */}
        <div className="hidden md:block bg-zinc-950 border-t border-zinc-850 px-4 md:px-6">
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
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-zinc-400 hover:text-zinc-100 hover:border-zinc-750'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-24 md:py-6" id="protpick-main-canvas">

        {/* TOP STATUS SUB-BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* LATEST ANNOUNCEMENT BOX - PREMIUM HIGH-CONTRAST GLASS PANEL */}
          <div className="lg:col-span-2 col-span-1 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/60 rounded-3xl p-6 shadow-md dark:shadow-none hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between" id="protpick-notification-center">
            <div className="absolute right-4 top-4 opacity-[0.06] dark:opacity-10 pointer-events-none">
              <Bell className="w-24 h-24 text-rose-500 dark:text-rose-400/60" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest font-mono">
                <Bell className="w-4 h-4 animate-bounce text-rose-600 dark:text-rose-400" />
                <span>{t.notifications}</span>
              </div>
              
              {sortedNotifications.filter(n => role === 'coach' || n.isPublic).length > 0 ? (
                (() => {
                  const latestNoti = sortedNotifications.filter(n => role === 'coach' || n.isPublic)[0];
                  return (
                    <div className="space-y-2">
                       <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                        {lang === 'vi' ? latestNoti.titleVI : latestNoti.titleEN}
                      </h3>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans max-w-2xl">
                        {lang === 'vi' ? latestNoti.contentVI : latestNoti.contentEN}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        <span className="bg-zinc-100 dark:bg-zinc-800/40 px-2 py-0.5 rounded font-bold">{latestNoti.date}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider border ${
                          latestNoti.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/30' 
                            : latestNoti.type === 'warning' 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/30' 
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-450 border-sky-500/30'
                        }`}>
                          {t[`noti${latestNoti.type.charAt(0).toUpperCase() + latestNoti.type.slice(1) as 'Success' | 'Warning' | 'Info'}`]}
                        </span>
                        {!latestNoti.isPublic && (
                          <span className="bg-zinc-150 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 text-[8px] border border-zinc-200 dark:border-zinc-750 px-1.5 py-0.5 rounded-md font-bold">Private</span>
                        )}
                        {role === 'coach' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteNoti(latestNoti.id)}
                            className="text-zinc-500 hover:text-rose-500 hover:underline transition-colors ml-auto cursor-pointer font-bold"
                          >
                            Delete Announcement
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-zinc-500 italic">{t.noNoti}</p>
              )}
            </div>

            {role === 'coach' && !newNoti && (
              <button
                type="button"
                onClick={() => setNewNoti({ titleVI: '', titleEN: '', contentVI: '', contentEN: '', type: 'info', isPublic: true })}
                className="mt-4 text-xs text-rose-650 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {t.sendNotification}
              </button>
            )}

            {/* Notification Create Form block */}
            {newNoti && (
              <form onSubmit={handleSaveNoti} className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3 text-zinc-900 dark:text-zinc-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">Tiêu đề (VI) — <span className="text-[10px] text-rose-500 font-normal">Tự động dịch sang EN</span></label>
                    <input
                      type="text"
                      required
                      value={newNoti.titleVI}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewNoti({ ...newNoti, titleVI: val });
                        
                        if (translationTimeoutRef.current.title) {
                          clearTimeout(translationTimeoutRef.current.title);
                        }
                        
                        if (val.trim()) {
                          translationTimeoutRef.current.title = setTimeout(async () => {
                            const trans = await translateViToEn(val);
                            if (trans) {
                              setNewNoti(prev => prev ? { ...prev, titleEN: trans } : null);
                            }
                          }, 800);
                        }
                      }}
                      className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">Title (EN)</label>
                    <input
                      type="text"
                      required
                      value={newNoti.titleEN}
                      onChange={(e) => setNewNoti({ ...newNoti, titleEN: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold font-sans">Nội dung (VI) — <span className="text-[10px] text-rose-500 font-normal">Tự động dịch sang EN</span></label>
                    <textarea
                      required
                      value={newNoti.contentVI}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewNoti({ ...newNoti, contentVI: val });
                        
                        if (translationTimeoutRef.current.content) {
                          clearTimeout(translationTimeoutRef.current.content);
                        }
                        
                        if (val.trim()) {
                          translationTimeoutRef.current.content = setTimeout(async () => {
                            const trans = await translateViToEn(val);
                            if (trans) {
                              setNewNoti(prev => prev ? { ...prev, contentEN: trans } : null);
                            }
                          }, 1000);
                        }
                      }}
                      className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl h-20 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold font-sans">Content (EN)</label>
                    <textarea
                      required
                      value={newNoti.contentEN}
                      onChange={(e) => setNewNoti({ ...newNoti, contentEN: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl h-20 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <select
                      value={newNoti.type}
                      onChange={(e) => setNewNoti({ ...newNoti, type: e.target.value as any })}
                      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 rounded-xl p-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                    </select>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-650 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={newNoti.isPublic ?? true}
                        onChange={(e) => setNewNoti({ ...newNoti, isPublic: e.target.checked })}
                        className="accent-rose-500 rounded cursor-pointer"
                      />
                      <span>{t.notiPublicToggle}</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setNewNoti(null)} className="px-3.5 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-400 rounded-xl cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors">{t.addNotiBtn}</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ----------------- TAB: DASHBOARD ----------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn" id="tab-dashboard-panel">
            {/* UNIVERSAL SEARCH BAR BAR */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
              <Search className="w-5 h-5 text-rose-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-none text-sm focus:outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-zinc-400 hover:text-zinc-250 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* STATS HERO GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: t.statsTotalStudents, val: filteredStudents.length, icon: <Users className="w-5 h-5" />, desc: "Active on profile log" },
                { title: t.statsTotalSessions, val: sessions.filter(s => s.status === 'Completed').length, icon: <CheckCircle2 className="w-5 h-5" />, desc: "Historical aggregate" },
                { title: t.statsAvgRating, val: resolvedStudents.length > 0 ? (resolvedStudents.reduce((acc, s) => acc + getAverageRating(s), 0) / resolvedStudents.length).toFixed(1) + " / 5.0" : "0.0", icon: <Star className="w-5 h-5 text-yellow-500" />, desc: "Across all 16 attributes" },
                { title: t.statsCompletionRate, val: "88%", icon: <TrendingUp className="w-5 h-5" />, desc: "Weekly attendance sync" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-855 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-mono tracking-wider block uppercase">{stat.title}</span>
                    <span className="text-2xl font-black text-rose-500 mt-1 block">{stat.val}</span>
                    <span className="text-[10px] text-zinc-400 mt-1 block font-mono">{stat.desc}</span>
                  </div>
                  <div className="bg-rose-500/10 text-rose-500 p-3 rounded-2xl">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* SKILLS DISTRIBUTED BAR CHART */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                  {t.skillsRadarOverview}
                </h3>
                
                <div className="space-y-3 pt-2">
                  {[...skillsList].sort((a, b) => {
                    const order = [
                      'Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop', 
                      'Flick', 'Roll', 'Reset', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
                    ];
                    const idxA = order.indexOf(a.name);
                    const idxB = order.indexOf(b.name);
                    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
                  }).map((skill) => {
                    const qualifiedPupils = resolvedStudents.filter(st => (st.skills[skill.name] || 0) >= 3).length;
                    const totalPupilsCount = resolvedStudents.length || 1;
                    const percent = Math.round((qualifiedPupils / totalPupilsCount) * 100);

                    return (
                      <div key={skill.id} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-300">
                          <span className="font-bold">{skill.name}</span>
                          <span className="font-mono text-[11px]">
                            {qualifiedPupils}/{totalPupilsCount} students ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-rose-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HIGH PERFORMERS & UPCOMING SESSIONS */}
              <div className="space-y-6">
                
                {/* RANKING CARDS */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                    {t.highPerformers}
                  </h3>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                    {[...resolvedStudents]
                      .sort((a, b) => getAverageRating(b) - getAverageRating(a))
                      .slice(0, 3)
                      .map((stu, i) => (
                        <div
                          key={stu.id}
                          onClick={() => { setSelectedStudentId(stu.id); setActiveTab('students'); }}
                          className="flex items-center gap-3 py-3 hover:bg-rose-500/5 px-2 rounded-xl transition-all cursor-pointer"
                        >
                          <span className="font-mono text-sm font-black text-rose-500">#0{i+1}</span>
                          <img src={stu.avatar} className="w-9 h-9 rounded-full object-cover border border-rose-500" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-100">{stu.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono">Level {stu.level}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-lg text-[10px] font-black text-rose-500 font-mono">
                              <Star className="w-3 h-3 fill-rose-500" />
                              <span>{getAverageRating(stu)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* UPCOMING SESSIONS */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    {t.upcomingSessions}
                  </h3>

                  <div className="space-y-3">
                    {sessions
                      .filter(s => s.status === 'Scheduled')
                      .slice(0, 3)
                      .map((sess) => {
                        const stu = resolvedStudents.find(s => s.id === sess.studentId);
                        return (
                          <div key={sess.id} className="p-3 bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 bg-amber-500 text-[8px] text-zinc-950 px-2 py-0.5 rounded-bl-xl font-bold uppercase">
                              {t.uncompletedSession}
                            </div>
                            <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-100 leading-tight">{sess.title}</h5>
                            <div className="flex items-center gap-2 mt-2">
                              {stu && <img src={stu.avatar} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />}
                              <span className="text-[10px] text-zinc-650 dark:text-zinc-300 font-bold">{stu?.name || 'Unknown Student'}</span>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-zinc-200 dark:border-zinc-900 space-y-1">
                              <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                                <span>📅 {sess.date}</span>
                                <span>⏱ {sess.durationMin} Min</span>
                              </div>
                              {sess.location && (
                                <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold truncate flex items-center gap-1 font-sans">
                                  <span>📍</span>
                                  <span>{sess.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}


        {/* ----------------- TAB: STUDENTS (FM CARD) ----------------- */}
        {activeTab === 'students' && (
          <div className="space-y-8 animate-fadeIn" id="tab-students-panel">
            
            {/* INSTRUCTOR PANEL TOOLS */}
            {role === 'coach' && (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setEditingStudent({ name: '', targetGoal: '', notes: '', phone: '', email: '', level: '1.0-2.0', isPublic: true })}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {t.addStudent}
                </button>
              </div>
            )}

            {/* EXPANDED STUDENT EDIT MODEL */}
            {editingStudent && (
              <form onSubmit={handleSaveStudent} className="bg-white dark:bg-zinc-900 border-2 border-rose-500 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {editingStudent.id ? t.editStudent : t.addStudent}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Name / Tên học viên *</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.name || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-black dark:text-white"
                      placeholder="e.g. Nguyễn Minh Hải"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Avatar URL</label>
                    <input
                      type="text"
                      value={editingStudent.avatar || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, avatar: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-black dark:text-white"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">DUPR Simplified Level</label>
                    <select
                      value={editingStudent.level || '1.0-2.0'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, level: e.target.value as LevelType })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-black dark:text-white"
                    >
                      <option value="1.0-2.0">Mức độ 1.0 - 2.0 (Newbie)</option>
                      <option value="2.5">Mức độ 2.5 (Novice)</option>
                      <option value="3.0">Mức độ 3.0 (Intermediate)</option>
                      <option value="3.5">Mức độ 3.5 (Medium Advanced)</option>
                      <option value="4.0">Mức độ 4.0 (Advanced Pro)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Phone</label>
                    <input
                      type="text"
                      value={editingStudent.phone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-black dark:text-white"
                      placeholder="09..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Email</label>
                    <input
                      type="email"
                      value={editingStudent.email || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-black dark:text-white"
                      placeholder="email@domain.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Quốc tịch / Nationality</label>
                    <select
                      value={editingStudent.nationality || 'Việt Nam'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, nationality: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-2xl text-black dark:text-white focus:outline-none"
                    >
                      <option value="Việt Nam">🇻🇳 Việt Nam</option>
                      <option value="Mỹ">🇺🇸 Mỹ (USA)</option>
                      <option value="Hàn Quốc">🇰🇷 Hàn Quốc (Korea)</option>
                      <option value="Nhật Bản">🇯🇵 Nhật Bản (Japan)</option>
                      <option value="Úc">🇦🇺 Úc (Australia)</option>
                      <option value="Đức">🇩🇪 Đức (Germany)</option>
                      <option value="Đài Loan">🇹🇼 Đài Loan</option>
                      <option value="Singapore">🇸🇬 Singapore</option>
                      <option value="Malaysia">🇲🇾 Malaysia</option>
                      <option value="Thái Lan">🇹🇭 Thái Lan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Tay thuận / Dominant Hand</label>
                    <select
                      value={editingStudent.dominantHand || 'Phải'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, dominantHand: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-2xl text-black dark:text-white focus:outline-none"
                    >
                      <option value="Phải">🏓 Phải (Right-handed)</option>
                      <option value="Trái">🏓 Trái (Left-handed)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400">Ngày gia nhập / Joined Date</label>
                    <input
                      type="date"
                      value={editingStudent.joiningDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEditingStudent({ ...editingStudent, joiningDate: e.target.value })}
                      className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-2xl text-black dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400">Target Goal / Mục tiêu học tập</label>
                  <input
                    type="text"
                    value={editingStudent.targetGoal || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, targetGoal: e.target.value })}
                    className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-black dark:text-white"
                    placeholder="e.g. Nâng lên trình 3.5 thi đấu kết hợp dink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400">Coach Secret Dossier / Ghi chú tâm huyết của Thầy</label>
                  <textarea
                    value={editingStudent.notes || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                    className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-2xl h-24 text-black dark:text-white"
                    placeholder="Ghi nhận lỗi bộ pháp chân, tâm lý hay có nôn nóng..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={editingStudent.isPublic ?? true}
                      onChange={(e) => setEditingStudent({ ...editingStudent, isPublic: e.target.checked })}
                      className="rounded border-zinc-750 bg-zinc-950 text-rose-500 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>{t.publicState} ({editingStudent.isPublic ? t.statusPublic : t.statusPrivate})</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-xl text-xs font-bold text-zinc-350 cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 px-6 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* PUPILS LIST STRIP */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
              {filteredStudents.map(s => {
                const isSelected = activeStudent?.id === s.id;
                const scoreAvg = getAverageRating(s);

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left min-w-[210px] cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500 ring-2 ring-rose-500/20'
                        : 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-850 hover:border-rose-400 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <img src={s.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-300 dark:border-zinc-800" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate max-w-[110px]">{s.name}</span>
                        {!s.isPublic && (
                          <span className="text-[7px] text-zinc-400 bg-zinc-800 border border-zinc-750 px-1 py-0.5 rounded uppercase">Private</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono">D.Rating: {scoreAvg}/5.0 (Lv {s.level})</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FM-STYLE VIRTUAL PLAYER DISPLAY CARD */}
            {activeStudent ? (
              <div className="space-y-6" id="football-manager-coaching-profile">
                
                {/* COMBINED DETAILS HEADER */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-rose-955/20 to-transparent pointer-events-none"></div>
                  
                  {/* PUBLIC FLAG WATERMARK AND ACTIONS */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      activeStudent.isPublic ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-red-400 border border-zinc-700'
                    }`}>
                      {activeStudent.isPublic ? t.statusPublic : t.statusPrivate}
                    </span>

                    {role === 'coach' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingStudent(activeStudent)}
                          className="bg-zinc-800 hover:bg-zinc-750 text-white p-2 rounded-xl transition-colors cursor-pointer"
                          title={t.editStudent}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(activeStudent.id)}
                          className="bg-zinc-800 hover:bg-rose-950 text-rose-500 p-2 rounded-xl transition-colors cursor-pointer"
                          title={t.deleteStudent}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <img
                          src={activeStudent.avatar}
                          alt="student card avatar"
                          className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-rose-500 shadow-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white font-mono text-center font-black rounded-lg px-2 py-0.5 text-xs shadow">
                          LV {activeStudent.level}
                        </div>
                      </div>

                      {/* Mode to change Student Avatar */}
                      {role === 'coach' && (
                        <div className="mt-1 flex flex-col items-center">
                          {isEditingStudentAvatar ? (
                            <div className="flex flex-col gap-1.5 w-44 bg-zinc-50 dark:bg-zinc-955 p-2 rounded-xl border border-zinc-205 dark:border-zinc-850">
                              <span className="text-[8px] font-bold text-zinc-400 block">Dán link ảnh:</span>
                              <input
                                type="text"
                                value={tempStudentAvatar}
                                onChange={(e) => setTempStudentAvatar(e.target.value)}
                                placeholder="Dán URL ảnh (URL)..."
                                className="text-[9px] p-1 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none w-full"
                              />
                              <div className="w-full border-t border-zinc-220 dark:border-zinc-800 my-0.5"></div>
                              <span className="text-[8px] font-bold text-zinc-400 block">Hoặc tải file từ máy:</span>
                              <label className="w-full flex items-center justify-center p-1 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded cursor-pointer hover:border-rose-500 transition-all text-center">
                                <Upload className="w-3 h-3 text-zinc-400 mr-1" />
                                <span className="text-[8px] text-zinc-400">Chọn tệp ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                          compressImage(reader.result, 200, 200, 0.7).then(setTempStudentAvatar);
                                          showToast(lang === 'vi' ? "Đã nạp file ảnh học viên!" : "Student image file loaded!");
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              <div className="flex gap-1 justify-center pt-1 w-full">
                                <button
                                  type="button"
                                  onClick={handleUpdateStudentAvatar}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] py-0.5 rounded font-bold cursor-pointer"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingStudentAvatar(false)}
                                  className="flex-1 bg-zinc-700 hover:bg-zinc-650 text-zinc-300 text-[9px] py-0.5 rounded font-bold cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setTempStudentAvatar(activeStudent.avatar); setIsEditingStudentAvatar(true); }}
                              className="text-[10px] text-rose-500 hover:text-rose-450 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              Thay đổi ảnh
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center md:text-left flex-1">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest">{t.studentProfile}</div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">{activeStudent.name}</h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-805 text-zinc-900 dark:text-zinc-200 border border-zinc-220 dark:border-zinc-700 rounded-lg text-xs font-black shadow-xs">
                          {(() => {
                            const nat = activeStudent.nationality || 'Việt Nam';
                            switch (nat) {
                              case 'Việt Nam': return '🇻🇳 Việt Nam';
                              case 'Mỹ': return '🇺🇸 Mỹ';
                              case 'Hàn Quốc': return '🇰🇷 Hàn Quốc';
                              case 'Nhật Bản': return '🇯🇵 Nhật Bản';
                              case 'Úc': return '🇦🇺 Úc';
                              case 'Đức': return '🇩🇪 Đức';
                              case 'Đài Loan': return '🇹🇼 Đài Loan';
                              case 'Singapore': return '🇸🇬 Singapore';
                              case 'Malaysia': return '🇲🇾 Malaysia';
                              case 'Thái Lan': return '🇹🇭 Thải Lan';
                              default: return `🌏 ${nat}`;
                            }
                          })()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-zinc-300 font-mono">
                        <span>📅 Joined: {activeStudent.joiningDate}</span>
                        {activeStudent.phone && <span>📞 {activeStudent.phone}</span>}
                        {activeStudent.email && <span>✉ {activeStudent.email}</span>}
                        <span className="text-pink-400 font-bold flex items-center gap-1">
                          🏓 Tay thuận: <span className="text-rose-500 font-black uppercase text-xs">{activeStudent.dominantHand || 'Phải'}</span>
                        </span>
                      </div>

                      <div className="pt-2">
                        <div className="text-zinc-400 text-[10px] uppercase font-mono tracking-wide">{t.progressBar}</div>
                        {(() => {
                          const avg = getAverageRating(activeStudent);
                          const progressPercent = Math.min(100, Math.round((avg / 5.0) * 100));
                          const blocksCount = Math.round(progressPercent / 10);
                          const emptyBlocks = 10 - blocksCount;
                          const barString = '█'.repeat(blocksCount) + '░'.repeat(emptyBlocks);

                          return (
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                              <span className="font-mono text-rose-500 tracking-tighter text-sm">{barString}</span>
                              <span className="text-xs font-mono text-zinc-350 font-bold">({progressPercent}%)</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center min-w-[130px]">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">{t.studentRating}</span>
                      <span className="text-3xl font-black text-rose-500 tracking-tight mt-1 block">
                        {getAverageRating(activeStudent)}
                      </span>
                      <div className="flex items-center justify-center mt-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const score = getAverageRating(activeStudent);
                          return (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${score >= idx + 1 ? 'fill-amber-400' : 'text-zinc-800'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETAILED STATS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT: ATTRIBUTES & RADAR CHART */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <h4 className="text-sm font-black uppercase tracking-wider text-rose-505 text-rose-600 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-rose-600" />
                          {t.attributes}
                        </h4>
                        <span className="text-xs text-zinc-405 font-bold uppercase tracking-wider">
                          {lang === 'vi' ? "16 Kỹ năng cơ bản" : "16 Core Skills"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <RadarChart skillsList={skillsList} studentSkills={activeStudent.skills} size={280} />

                        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar text-xs">
                          {[...skillsList].sort((a, b) => {
                            const order = [
                              'Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop', 
                              'Flick', 'Roll', 'Reset', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
                            ];
                            const idxA = order.indexOf(a.name);
                            const idxB = order.indexOf(b.name);
                            return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
                          }).map((skill) => {
                            const score = activeStudent.skills[skill.name] || 1;
                            
                            let scoreColor = 'bg-stone-850 text-stone-400 border border-stone-800';
                            if (score === 3) scoreColor = 'bg-sky-505 bg-sky-500/10 text-sky-400 border border-sky-500/20';
                            if (score === 4) scoreColor = 'bg-emerald-505 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                            if (score === 5) scoreColor = 'bg-rose-505 bg-rose-500/10 text-rose-450 border border-rose-500/25 font-black animate-pulse';

                            return (
                              <div key={skill.id} className="flex items-center justify-between p-2.5 bg-zinc-100/30 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                                <div 
                                  onClick={() => setSelectedSkillForHistory(skill)}
                                  className="flex-1 pr-3 cursor-pointer group hover:opacity-85 transition-opacity"
                                  title="Xem lịch sử đánh giá kỹ năng này"
                                >
                                  <div className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-rose-500 flex items-center gap-1">
                                    <span>{skill.name}</span>
                                    <TrendingUp className="w-3 h-3 text-zinc-400 group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                  <div className="text-[10px] text-zinc-450 font-sans leading-relaxed">
                                    {lang === 'vi' ? skill.descriptionVI : skill.descriptionEN}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {role === 'coach' ? (
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map((grade) => (
                                        <button
                                          key={grade}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDirectSkillRate(activeStudent.id, skill.name, grade);
                                          }}
                                          className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[9px] font-bold cursor-pointer transition-all ${
                                            score === grade
                                              ? 'bg-rose-600 text-white font-extrabold'
                                              : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-705 text-zinc-650 dark:text-zinc-400'
                                          }`}
                                        >
                                          {grade}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black ${scoreColor}`}>
                                      {score}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* EVALUATION LEGENDS */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
                        <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Info className="w-4 h-4" />
                          {t.levelDescriptionTitle}
                        </h4>
                        
                        {role === 'coach' && (
                          <button
                            onClick={handleSaveLegend}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] px-3 py-1 rounded-lg cursor-pointer"
                          >
                            Save Document
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-650 dark:text-zinc-305 leading-relaxed">
                        <div className="space-y-2">
                          <p className="border-l-2 border-rose-500 pl-2">{t.levelDesc1_2}</p>
                          <p className="border-l-2 border-rose-500 pl-2">{t.levelDesc2_5}</p>
                          <p className="border-l-2 border-rose-500 pl-2">{t.levelDesc3_0}</p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="border-l-2 border-rose-500 pl-2">{t.levelDesc3_5}</p>
                            <p className="border-l-2 border-rose-500 pl-2">{t.levelDesc4_0}</p>
                          </div>
                          
                          <div className="bg-zinc-100/50 dark:bg-zinc-950 p-2.5 border border-zinc-150 dark:border-zinc-900 rounded-xl space-y-1.5">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Coach Legend Notepad:</div>
                            {role === 'coach' ? (
                              <textarea
                                value={customLegendNotes}
                                onChange={(e) => setCustomLegendNotes(e.target.value)}
                                className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-100 h-20"
                                placeholder={t.levelNotesPlaceholder}
                              />
                            ) : (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-line font-mono">{customLegendNotes || t.levelNotesPlaceholder}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 mt-3">
                        <h5 className="text-xs font-black text-rose-500 uppercase tracking-wide mb-1.5">{t.scoreGuide}</h5>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed mb-3">{t.scoreGuideDesc}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                          <div className="p-2 border border-rose-500/10 rounded-lg">1: {t.score1.substring(8)}</div>
                          <div className="p-2 border border-rose-500/10 rounded-lg">2: {t.score2.substring(8)}</div>
                          <div className="p-2 border border-rose-500/10 rounded-lg">3: {t.score3.substring(8)}</div>
                          <div className="p-2 border border-rose-500/10 rounded-lg">4: {t.score4.substring(8)}</div>
                          <div className="p-2 border border-rose-500/10 rounded-lg">5: {t.score5.substring(8)}</div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT PANEL DATA WRAPPERS */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* STRONGEST */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-emerald-500" />
                        {t.strongestSkills}
                      </h4>
                      
                      {getStrongestSkills(activeStudent).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {getStrongestSkills(activeStudent).map(sk => (
                            <span key={sk.name} className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg">
                              ⚡ {sk.name} ({sk.score}/5)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">Chưa có chỉ số đạt mức 4-5 (Vũ khí thực chiến).</p>
                      )}
                    </div>

                    {/* TO IMPROVE */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-black uppercase text-rose-500 tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-rose-500" />
                        {t.needImprovement}
                      </h4>

                      {getNeedImprovementSkills(activeStudent).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {getNeedImprovementSkills(activeStudent).map(sk => (
                            <span key={sk.name} className="px-2.5 py-1 text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-lg">
                              ⚠️ {sk.name} ({sk.score}/5)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">Các chỉ số rèn luyện đều đạt mức trung bình trở lên.</p>
                      )}
                    </div>

                    {/* TARGETS */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-black uppercase text-rose-500 tracking-wider">🎯 Target Learning Goal</h4>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">{activeStudent.targetGoal || "Chưa thiết lập mục tiêu huấn luyện cụ thể."}</p>
                      
                      <div className="border-t border-zinc-150 dark:border-zinc-850 pt-3">
                        <div className="text-[10px] uppercase font-mono text-zinc-400 mb-1">HLV Dossier Notes:</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic font-serif leading-relaxed h-[130px] overflow-y-auto pr-1">
                          {role === 'coach' || activeStudent.isPublic ? activeStudent.notes : "🔒 Ghi chú mật lớp học phác họa chiến thuật HLV."}
                        </p>
                      </div>
                    </div>

                    {/* HISTORY LESSON LOGS */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-5 shadow-xs space-y-4">
                      <h4 className="text-xs font-black uppercase text-rose-500 tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2.5">
                        <Calendar className="w-4 h-4" />
                        {t.sessionHistory}
                      </h4>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {sessions
                          .filter(s => s.studentId === activeStudent.id)
                          .map((sess) => {
                            const plan = lessonPlans.find(lp => lp.id === sess.lessonPlanId);
                            const planTitle = plan ? (lang === 'vi' ? plan.titleVI : plan.titleEN) : '';

                            return (
                              <div key={sess.id} className="text-xs bg-zinc-100/50 dark:bg-zinc-955 p-3.5 border border-zinc-150 dark:border-zinc-900 rounded-2xl relative">
                                <div className="absolute top-2 right-2 flex items-center gap-1 font-mono text-[9px] text-zinc-400">
                                  <span>{sess.date}</span>
                                </div>
                                
                                <div className="font-extrabold text-zinc-800 dark:text-white leading-tight">{sess.title}</div>
                                <div className="text-[10px] text-zinc-400 mt-1">Plan: {planTitle}</div>

                                {Object.keys(sess.skillScores).length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {Object.entries(sess.skillScores).map(([key, sc]) => (
                                      <span key={key} className="text-[9px] font-mono bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                                        {key}: {sc}/5
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 italic leading-relaxed border-t border-dashed border-zinc-150 dark:border-zinc-850 pt-1.5">
                                  " {lang === 'vi' ? sess.coachFeedbackVI : sess.coachFeedbackEN} "
                                </p>
                              </div>
                            );
                          })}
                        {sessions.filter(s => s.studentId === activeStudent.id).length === 0 && (
                          <p className="text-xs text-zinc-400 py-4">Chưa có dữ liệu buổi huấn luyện nào được ghi chép.</p>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              <p className="text-center text-zinc-500 py-10">Chưa có học viên nào được thiết lập hoặc hiển thị.</p>
            )}

          </div>
        )}


        {/* ----------------- TAB: CURRICULUM & PLANS ----------------- */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8 animate-fadeIn" id="tab-curriculum-panel">
            
            {/* ADD SKILL FORM BLOCK */}
            {role === 'coach' && !newSkill && (
              <button
                onClick={() => setNewSkill({ name: '', category: 'Basics', descriptionVI: '', descriptionEN: '' })}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md cursor-pointer transition-colors"
              >
                + Bổ sung Kỹ năng mới vào Giáo án
              </button>
            )}

            {newSkill && (
              <form onSubmit={handleSaveSkill} className="bg-white dark:bg-zinc-900 border-2 border-rose-500 rounded-3xl p-6 shadow-xl space-y-3">
                <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest font-mono">Thêm Kỹ Năng Mới</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">Skill Name (EN) *</label>
                    <input
                      type="text"
                      required
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl focus:ring-1 focus:ring-rose-500"
                      placeholder="e.g. Backhand Drive"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">Category / Nhóm kỹ năng</label>
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                      className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl"
                    >
                      <option value="Basics">Basics (Trình nền tảng)</option>
                      <option value="Dink & Soft">Dink & Soft (Bóng nhỏ)</option>
                      <option value="Hard Drives">Hard Drives (Tấn công)</option>
                      <option value="Defense & Reset">Defense & Reset (Phản đòn & Chặn)</option>
                      <option value="Tactics & Footwork">Tactics & Footwork (Chiến thuật & Di chuyển)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">Mô tả tiếng Việt</label>
                    <input
                      type="text"
                      value={newSkill.descriptionVI}
                      onChange={(e) => setNewSkill({ ...newSkill, descriptionVI: e.target.value })}
                      className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">English Description</label>
                    <input
                      type="text"
                      value={newSkill.descriptionEN}
                      onChange={(e) => setNewSkill({ ...newSkill, descriptionEN: e.target.value })}
                      className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
                  <button type="button" onClick={() => setNewSkill(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg cursor-pointer">Hủy</button>
                  <button type="submit" className="px-5 py-1.5 bg-rose-600 text-white rounded-lg cursor-pointer">Lưu lại</button>
                </div>
              </form>
            )}

            {/* CURRICULUMS EDUCATION BLOCKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: 16 CORE SKILLS */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-5 h-5 animate-pulse" />
                  GIÁO ÁN 16 KỸ NĂNG HUẤN LUYỆN CHUẨN HOÁ
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Học viên tập luyện với HLV Phongprot được đánh giá sát sao, tự hào theo đuổi giáo trình bao quát đầy đủ cả kỹ năng mềm lẫn tư duy thực chiến đối kháng dưới áp lực.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {skillsList.map((skill, index) => {
                    return (
                      <div key={skill.id} className="p-3 bg-zinc-100/40 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Skill #{index + 1}</span>
                          <span className="text-[9px] bg-rose-500/10 text-rose-450 px-2 py-0.5 rounded-full font-bold uppercase">{skill.category}</span>
                        </div>
                        <h4 className="text-xs font-black text-zinc-800 dark:text-white">{skill.name}</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {lang === 'vi' ? skill.descriptionVI : skill.descriptionEN}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: DETAILED PLANS */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
                    <h3 className="text-sm font-black text-rose-505 text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      DANH SÁCH GIÁO ÁN KHÓA HỌC
                    </h3>
                    
                    {role === 'coach' && (
                      <button
                        onClick={() => setEditingPlan({ titleVI: '', titleEN: '', descriptionVI: '', descriptionEN: '', skillsFocused: [], durationMin: 60, isPublic: true })}
                        className="bg-zinc-850 hover:bg-zinc-800 p-1.5 rounded-lg text-rose-500 hover:text-white cursor-pointer"
                        title="Tạo giáo án mới"
                      >
                        <PlusCircle className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {editingPlan && (
                    <form onSubmit={handleSavePlan} className="bg-zinc-150/50 dark:bg-zinc-955 p-4 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-zinc-450">Tên giáo án (VI) *</label>
                          <input
                            type="text"
                            required
                            value={editingPlan.titleVI || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, titleVI: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-455">Lesson Plan Title (EN)</label>
                          <input
                            type="text"
                            value={editingPlan.titleEN || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, titleEN: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-zinc-455">Mô tả chi tiết (VI)</label>
                          <textarea
                            value={editingPlan.descriptionVI || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, descriptionVI: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg h-14"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-455">Description Detail (EN)</label>
                          <textarea
                            value={editingPlan.descriptionEN || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, descriptionEN: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg h-14"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-zinc-455">Thời lượng (phút)</label>
                          <input
                            type="number"
                            value={editingPlan.durationMin || 60}
                            onChange={(e) => setEditingPlan({ ...editingPlan, durationMin: Number(e.target.value) })}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-455">Trạng thái hiển thị</label>
                          <select
                            value={editingPlan.isPublic ? 'true' : 'false'}
                            onChange={(e) => setEditingPlan({ ...editingPlan, isPublic: e.target.value === 'true' })}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                          >
                            <option value="true">Công khai cho học viên</option>
                            <option value="false">Riêng tư bí mật</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-zinc-450 font-bold block">Skills Targeted / Kỹ năng tiêu điểm (Lựa chọn dán)</label>
                        <div className="flex flex-wrap gap-1.5 h-20 overflow-y-auto bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 p-2 rounded-lg text-[10px] text-white">
                          {skillsList.map(sk => {
                            const isChosen = (editingPlan.skillsFocused || []).includes(sk.name);
                            return (
                              <button
                                key={sk.name}
                                type="button"
                                onClick={() => {
                                  let prev = editingPlan.skillsFocused || [];
                                  if (isChosen) {
                                    prev = prev.filter(c => c !== sk.name);
                                  } else {
                                    prev = [...prev, sk.name];
                                  }
                                  setEditingPlan({ ...editingPlan, skillsFocused: prev });
                                }}
                                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  isChosen ? 'bg-rose-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {sk.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button type="button" onClick={() => setEditingPlan(null)} className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-lg cursor-pointer">Cancel</button>
                        <button type="submit" className="px-3.5 py-1 bg-rose-600 text-white font-bold rounded-lg cursor-pointer">{t.save}</button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {filteredPlans.map(plan => {
                      return (
                        <div key={plan.id} className="p-4 bg-zinc-100/30 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-2xl relative">
                          <span className="absolute top-3 right-3 text-[9px] font-mono bg-zinc-250 dark:bg-zinc-800 text-rose-500 border border-zinc-150 dark:border-zinc-800 px-2 py-0.5 rounded-full font-bold">
                            ⏱ {plan.durationMin} MIN
                          </span>

                          <h4 className="text-xs font-black text-zinc-800 dark:text-white pr-16 leading-tight">
                            {lang === 'vi' ? plan.titleVI : plan.titleEN}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                            {lang === 'vi' ? plan.descriptionVI : plan.descriptionEN}
                          </p>

                          {plan.skillsFocused.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-200 dark:border-zinc-900 flex flex-wrap gap-1">
                              {plan.skillsFocused.map(sk => (
                                <span key={sk} className="text-[9px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}

                          {role === 'coach' && (
                            <div className="flex items-center justify-end gap-2.5 mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-900 text-[10px]">
                              <span>Status: <strong className="text-rose-500">{plan.isPublic ? "Public" : "Private"}</strong></span>
                              <button
                                onClick={() => setEditingPlan(plan)}
                                className="text-zinc-500 hover:text-rose-500 cursor-pointer"
                              >
                                Edit Plan
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(t.deleteConfirm)) {
                                    syncLessonPlans(lessonPlans.filter(p => p.id !== plan.id));
                                    showToast("Plan deleted");
                                  }
                                }}
                                className="text-rose-500 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}


        {/* ----------------- TAB: SESSIONS & LOG NOTES ----------------- */}
        {activeTab === 'sessions' && (
          <div className="space-y-8 animate-fadeIn" id="tab-sessions-panel">

            {/* NEW SESSIONS LOG FORM */}
            {role === 'coach' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 id="session-form-heading" className="text-base font-black text-rose-505 text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-rose-600 animate-pulse" />
                  GHI LỊCH DẠY & ĐÁNH GIÁ HỌC VIÊN
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  Khi HLV Phongprot lên lịch dợt và đánh giá kỹ năng học tập, hệ thống sẽ đồng bộ thông tin thời gian thực. Bấm trực tiếp vào các buổi học ở Nhật Ký Luyện & Số Điểm phía dưới để điền tiếp đánh giá!
                </p>

                {(() => {
                  const isScheduledMode = (newSession?.status || 'Scheduled') === 'Scheduled';
                  return (
                    <form onSubmit={(e) => handleSaveSession(e)} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-zinc-400">Chọn Học Viên *</label>
                          <select
                            required
                            className="w-full p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                            value={newSession?.studentId || ''}
                            onChange={(e) => setNewSession({ ...newSession, studentId: e.target.value, skillScores: {} })}
                          >
                            <option value="">-- Lựa chọn Học viên --</option>
                            {resolvedStudents.map(s => (
                              <option key={s.id} value={s.id}>{s.name} (Lv {s.level})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-zinc-400">Chọn Giáo Án Áp Dụng *</label>
                          <select
                            required
                            className="w-full p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                            value={newSession?.lessonPlanId || ''}
                            onChange={(e) => {
                              const lp = lessonPlans.find(l => l.id === e.target.value);
                              setNewSession({
                                ...newSession,
                                lessonPlanId: e.target.value,
                                title: lp ? lp.titleVI : 'Coaching Session',
                                skillScores: {}
                              });
                            }}
                          >
                            <option value="">-- Lựa chọn Giáo án --</option>
                            {lessonPlans.map(lp => (
                              <option key={lp.id} value={lp.id}>{lp.titleVI}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-zinc-405">Thời gian buổi dạy *</label>
                          <input
                            type="date"
                            required
                            className="w-full p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                            value={newSession?.date || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-zinc-405">Địa điểm dạy</label>
                          <input
                            type="text"
                            placeholder="e.g. Sân Pickleball..."
                            className="w-full p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                            value={newSession?.location || ''}
                            onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-zinc-405">Thời lượng & Trạng thái</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Mins"
                              className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-xl text-center"
                              value={newSession?.durationMin || 60}
                              onChange={(e) => setNewSession({ ...newSession, durationMin: Number(e.target.value) })}
                            />
                            <select
                              className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-xl text-xs"
                              value={newSession?.status || 'Scheduled'}
                              onChange={(e) => setNewSession({ ...newSession, status: e.target.value as any })}
                            >
                              <option value="Scheduled">Lên lịch chờ</option>
                              <option value="Completed">Hoàn thành</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-zinc-400">Tiêu đề Buổi huấn luyện / Trận đánh</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-zinc-100 dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                          placeholder="e.g. Dợt bóng Dink Kitchen bền bỉ & Chặn bóng đột kích"
                          value={newSession?.title || ''}
                          onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                        />
                      </div>

                      {/* DYNAMIC SCORING CONTROLLER */}
                      {newSession?.lessonPlanId && (
                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-rose-500 tracking-wider block font-mono">
                              ⚙ CHẤM ĐIỂM CÁC KỸ NĂNG TIÊU ĐIỂM (Scale 1 - 5):
                            </span>
                            {isScheduledMode && (
                              <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                                Khóa chấm điểm (Chọn Trạng thái Hoàn thành để mở)
                              </span>
                            )}
                          </div>
                          
                          {(() => {
                            const plan = lessonPlans.find(lp => lp.id === newSession.lessonPlanId);
                            const skillsToRate = plan?.skillsFocused || ['Dink', 'Block', 'Reset'];

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                {skillsToRate.map(sk => {
                                  const currentScore = (newSession.skillScores || {})[sk] || 1;
                                  return (
                                    <div key={sk} className="flex items-center justify-between p-2.5 bg-zinc-100/50 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                                      <span className="font-black text-zinc-750 dark:text-zinc-300">{sk}</span>
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(val => (
                                          <button
                                            type="button"
                                            key={val}
                                            disabled={isScheduledMode}
                                            onClick={() => {
                                              if (isScheduledMode) return;
                                              const prevScores = newSession.skillScores || {};
                                              setNewSession({
                                                ...newSession,
                                                skillScores: { ...prevScores, [sk]: val }
                                              });
                                            }}
                                            className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                                              isScheduledMode ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-rose-600 hover:text-white'
                                            } ${
                                              currentScore === val
                                                ? 'bg-rose-600 text-white font-black'
                                                : 'bg-zinc-205 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                          >
                                            {val}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-zinc-400">
                            Nhận xét tổng quan & Đề xuất (Tiếng Việt) {isScheduledMode && "🔒 (Đã khoá, chuyển Hoàn Thành để gõ)"}
                          </label>
                          <textarea
                            disabled={isScheduledMode}
                            className={`w-full p-3 border text-black dark:text-white rounded-2xl h-20 transition-all ${
                              isScheduledMode 
                                ? 'bg-zinc-150/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                                : 'bg-zinc-100 dark:bg-zinc-955 border-zinc-250 dark:border-zinc-800'
                            }`}
                            placeholder={isScheduledMode ? "(Chỉ có thể nhập nhận xét khi thiết lập Trạng thái Hoàn thành)" : "Hải có tư duy ép bóng tốt. Đề xuất hôm sau dạy quả Roll xoáy mượt."}
                            value={newSession?.coachFeedbackVI || ''}
                            onChange={(e) => setNewSession({ ...newSession, coachFeedbackVI: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-zinc-450">
                            Coach Feedback summary (English Translation) {isScheduledMode && "🔒 (Dịch tự động)"}
                          </label>
                          <textarea
                            disabled={isScheduledMode}
                            className={`w-full p-3 border text-black dark:text-white rounded-2xl h-20 transition-all ${
                              isScheduledMode 
                                ? 'bg-zinc-150/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                                : 'bg-zinc-100 dark:bg-zinc-955 border-zinc-250 dark:border-zinc-800'
                            }`}
                            placeholder={isScheduledMode ? "(Tự động cập nhật dịch thuật sau khi gõ tiếng Việt)" : "Excellent pacing. Suggest next lesson cover deep backhand dinks."}
                            value={newSession?.coachFeedbackEN || ''}
                            onChange={(e) => setNewSession({ ...newSession, coachFeedbackEN: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-zinc-400">
                          HLV Ghi chú nội bộ giáo án (Chỉ Thầy xem hoặc Public) {isScheduledMode && "🔒"}
                        </label>
                        <input
                          type="text"
                          disabled={isScheduledMode}
                          className={`w-full p-3 border text-black dark:text-white rounded-2xl transition-all ${
                            isScheduledMode 
                              ? 'bg-zinc-150/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                              : 'bg-zinc-100 dark:bg-zinc-955 border-zinc-250 dark:border-zinc-800'
                          }`}
                          placeholder={isScheduledMode ? "(Chỉ nhập được khi ở trạng thái Hoàn thành)" : "Bài tập phụ trợ di chuyển bước đệm nhảy, bọc lót khi đồng đội chạy cứu bóng bổng..."}
                          value={newSession?.notes || ''}
                          onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2 justify-end text-xs font-bold pt-2">
                        {editingSessionId ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setNewSession(null);
                                setEditingSessionId(null);
                              }}
                              className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-305 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                            >
                              Huỷ chỉnh sửa
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSaveSession(e, 'Completed')}
                              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg cursor-pointer transition-all font-black"
                            >
                              Đánh giá
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setNewSession(null);
                                setEditingSessionId(null);
                              }}
                              className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-305 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                            >
                              Clear form
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSaveSession(e, 'Scheduled')}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer transition-all"
                            >
                              Lên lịch
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSaveSession(e, 'Completed')}
                              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg cursor-pointer transition-all"
                            >
                              Đánh giá
                            </button>
                          </>
                        )}
                      </div>
                    </form>
                  );
                })()}
              </div>
            )}

            {/* SESSIONS HISTORY LIST */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-150 dark:border-zinc-800">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-rose-505 text-rose-600 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    <Calendar className="w-5 h-5 flex-shrink-0 text-rose-605" />
                    NHẬT KÝ LUYỆN & SỐ ĐIỂM
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-wide">
                    {t.analyzeSkills}
                  </p>
                </div>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-mono">
                  {filteredSessions.length} total logs
                </span>
              </div>

              {/* SPECIALIZED SEARCH & FILTER BAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-450">🔍</span>
                  <input
                    type="text"
                    placeholder={lang === 'vi' ? "Tìm theo tên học viên hoặc giáo án..." : "Search by student name or lesson plan..."}
                    value={sessionSearchQuery}
                    onChange={(e) => setSessionSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-450">📅</span>
                  <input
                    type="date"
                    value={sessionDateFilter}
                    onChange={(e) => setSessionDateFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                  {sessionDateFilter && (
                    <button 
                      onClick={() => setSessionDateFilter('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-rose-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {filteredSessions.map((sess) => {
                  const student = resolvedStudents.find(s => s.id === sess.studentId);

                  return (
                    <div 
                      key={sess.id} 
                      onClick={(e) => {
                        if (role !== 'coach') return;
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                          return;
                        }
                        setEditingSessionId(sess.id);
                        setNewSession({ ...sess });
                        document.getElementById('session-form-heading')?.scrollIntoView({ behavior: 'smooth' });
                        showToast(lang === 'vi' ? "Đã chọn buổi học để đánh giá & chấm điểm!" : "Session selected for evaluation & grading!");
                      }}
                      className={`p-5 bg-zinc-100/30 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-2xl relative overflow-hidden transition-all text-xs ${
                        role === 'coach' 
                          ? 'cursor-pointer hover:border-rose-500 hover:ring-2 hover:ring-rose-500/15'
                          : 'hover:border-zinc-200 dark:hover:border-zinc-800'
                      }`}
                    >
                      
                      <span className={`absolute top-4 right-4 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        sess.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {sess.status === 'Completed' ? "Completed" : "Scheduled"}
                      </span>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {student && (
                            <img
                              src={student.avatar}
                              alt="student avatar snippet"
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-500/40"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-zinc-800 dark:text-white">{student?.name || 'Unknown Student'}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">Level {student?.level}</span>
                            </div>
                            <h4 className="text-xs font-bold text-rose-500 uppercase mt-0.5">{sess.title}</h4>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                          <span>📅 {sess.date}</span>
                          <span>⏱ {sess.durationMin} min</span>
                          {sess.location && (
                            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-455 font-bold font-sans">
                              <span>📍</span> {sess.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-405 uppercase font-mono block">HLV FEEDBACK & REVIEW:</span>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic font-serif leading-relaxed">
                            " {lang === 'vi' ? sess.coachFeedbackVI : sess.coachFeedbackEN} "
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-405 uppercase font-mono block">Chấm điểm kỹ năng thực chiến (Scale 1-5):</span>
                          {Object.keys(sess.skillScores).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(sess.skillScores).map(([key, value]) => (
                                <span key={key} className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-750 dark:text-zinc-350 px-2 py-0.5 rounded-lg font-extrabold">
                                  {key}: {value}/5
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">Chưa xếp hạng điểm số buổi này.</p>
                          )}
                        </div>

                      </div>

                      {sess.notes && (role === 'coach' || sess.isPublic) && (
                        <div className="mt-3.5 bg-rose-500/5 p-3 rounded-xl text-xs flex items-start gap-2 border border-rose-500/10">
                          <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-[10px] font-mono text-rose-500 uppercase block">HLV Lesson Execution Internal Note:</strong>
                            <p className="text-zinc-550 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">{sess.notes}</p>
                          </div>
                        </div>
                      )}

                      {role === 'coach' && (
                        <div className="mt-4 pt-2 border-t border-zinc-150 dark:border-zinc-850 flex justify-between items-center text-[10px]">
                          <span className="text-rose-600 dark:text-rose-450 font-extrabold animate-pulse">
                            👉 {lang === 'vi' ? "Nhấp vào khung này để đánh giá & chấm điểm!" : "Click this card to evaluate & grade!"}
                          </span>
                          <span>Visible state: <strong className="text-rose-500">{sess.isPublic ? "Public in card" : "Private Coach only"}</strong></span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(t.deleteConfirm)) handleDeleteSession(sess.id);
                            }}
                            className="text-rose-450 hover:text-rose-600 font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove logs
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}


        {/* ----------------- TAB: ABOUT COACH & COURSES ----------------- */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fadeIn" id="tab-about-panel">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: COACH RESUME */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs text-center space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={coach.avatar}
                      alt="phongprot avatar display"
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-rose-500 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-2 bg-rose-600 text-white p-2 rounded-full shadow animate-pulse">
                      <Flame className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Mode to change Coach Avatar URL */}
                  {role === 'coach' && (
                    <div className="flex flex-col items-center">
                      {isEditingCoachAvatar ? (
                        <div className="flex flex-col gap-2 w-full max-w-xs justify-center items-center mt-1 p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-2xl">
                          <span className="text-[10px] font-bold text-zinc-400 block">Dán Link ảnh từ web:</span>
                          <input
                            type="text"
                            value={tempCoachAvatar}
                            onChange={(e) => setTempCoachAvatar(e.target.value)}
                            placeholder="Dán link ảnh HLV (URL)..."
                            className="text-[10px] p-1.5 px-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none w-full text-center"
                          />
                          
                          <div className="w-full border-t border-zinc-200 dark:border-zinc-800 my-1"></div>
                          
                          <span className="text-[10px] font-bold text-zinc-400 block">Hoặc tải ảnh từ máy (PC/Mobile):</span>
                          <label className="w-full flex flex-col items-center justify-center p-2 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:border-rose-500 transition-all text-center">
                            <Upload className="w-4 h-4 text-zinc-400 mb-1" />
                            <span className="text-[9px] text-zinc-400">Chọn tệp ảnh từ thiết bị</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      compressImage(reader.result, 200, 200, 0.7).then(setTempCoachAvatar);
                                      showToast(lang === 'vi' ? "Đã nạp file ảnh cục bộ!" : "Local image file loaded!");
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <div className="flex gap-2 w-full pt-1">
                            <button
                              type="button"
                              onClick={handleUpdateCoachAvatar}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1 rounded-lg font-black cursor-pointer transition-colors shadow-xs"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingCoachAvatar(false)}
                              className="flex-1 bg-zinc-700 hover:bg-zinc-650 text-zinc-200 text-[10px] py-1 rounded-lg font-black cursor-pointer transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setTempCoachAvatar(coach.avatar); setIsEditingCoachAvatar(true); }}
                          className="text-[10px] text-rose-500 hover:text-rose-450 font-bold flex items-center justify-center gap-1 cursor-pointer mt-1"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          Thay đổi ảnh HLV
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tight">COACH {coach.name}</h3>
                    <span className="font-mono text-xs text-rose-500 font-extrabold uppercase tracking-wide">
                      ⚡ CHIẾN ĐẤU KHÔNG NGỪNG NGHỈ
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans text-justify bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-900">
                    {lang === 'vi' ? coach.aboutVI : coach.aboutEN}
                  </p>

                  <div className="pt-2 text-left space-y-2.5 text-xs border-t border-zinc-150 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>
                        <strong>Youtube:</strong>{' '}
                        <a
                          href="https://www.youtube.com/@phongprot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-500 hover:text-rose-400 font-bold transition-all hover:underline cursor-pointer"
                        >
                          @phongprot
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-zinc-400" />
                      <span>
                        <strong>Tiktok:</strong>{' '}
                        <a
                          href="https://www.tiktok.com/@phongprot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-500 hover:text-rose-400 font-bold transition-all hover:underline cursor-pointer"
                        >
                          @phongprot
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-rose-500" />
                      <span><strong>Sân tập:</strong> Cụm sân Pickleball HN & Sài Gòn</span>
                    </div>
                    
                    {role === 'coach' && (
                      <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPinValueForChange('');
                            setNewPinValue1('');
                            setNewPinValue2('');
                            setPinModalError('');
                            setIsChangingPin(true);
                            setIsPinModalOpen(true);
                          }}
                          className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-950 dark:text-zinc-200 text-[10px] py-1.5 px-3 rounded-lg font-black tracking-wider uppercase transition-colors border border-zinc-205 dark:border-zinc-750 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          🔑 Cài đặt Mã PIN HLV bảo mật
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                 {/* BATTLE GALLERY UPDATE */}
                {role === 'coach' && (
                  <div className="bg-white dark:bg-zinc-900 border border-rose-500/25 rounded-3xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-black text-rose-505 text-rose-600 uppercase tracking-widest font-mono">🛠 QUẢN LÝ VIDEO VÀ ẢNH GIAO LƯU</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold block">Loại Media</label>
                        <select
                          value={newMediaType}
                          onChange={(e) => { setNewMediaType(e.target.value as any); setNewMediaUrl(''); }}
                          className="w-full p-2 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-805 text-black dark:text-white rounded-lg focus:outline-none"
                        >
                          <option value="video">🎥 YouTube Video URL / ID</option>
                          <option value="photo">🔗 Link ảnh từ trang upload khác (URL)</option>
                          <option value="local_photo">💻 Tải ảnh trực tiếp từ máy (PC/Mobile)</option>
                        </select>
                      </div>

                      {newMediaType === 'local_photo' ? (
                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold block">Chọn tệp ảnh từ thiết bị</label>
                          <label className="w-full flex flex-col items-center justify-center p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-rose-500 transition-all text-center">
                            <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                            <span className="text-[10px] text-zinc-400">Chọn tệp ảnh từ ổ đĩa (.png, .jpg, .jpeg)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      compressImage(reader.result, 600, 600, 0.75).then(compressed => {
                                        setNewMediaUrl(compressed);
                                        showToast(lang === 'vi' ? "Đã nạp & tối ưu hóa ảnh từ máy!" : "Selected local photo (compressed)!");
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {newMediaUrl && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] text-emerald-500 font-mono">✅ Sẵn sàng tải lên (Kích thước: {Math.round(newMediaUrl.length / 1024)} KB)</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold block">Đường dẫn URL / ID Youtube</label>
                          <input
                            type="text"
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            placeholder={newMediaType === 'video' ? "https://www.youtube.com/watch?v=... hoặc Video ID" : "https://example.com/image.jpg"}
                            className="w-full p-2 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleAddMedia}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-colors"
                      >
                        {t.addMediaLink}
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT: COURSE OPTIONS & PLAYABLE MEDIA */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* COURSE DETAILS SECTION */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-5">
                  <h3 className="text-base font-black text-rose-505 text-rose-605 text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-5 h-5 animate-pulse" />
                    CÁC KHÓA HỌC PICKLEBALL THỰC CHIẾN - PHONGPROT
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {t.aboutCourseIntro}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                    {(() => {
                      const courses = lang === 'vi' ? coach.coursesVI : coach.coursesEN;
                      return courses.map((course, i) => (
                        <div key={i} className="p-4 bg-zinc-100/30 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-2xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                            HOT PACK
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-tight line-clamp-2">{course.title}</h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{course.desc}</p>
                          </div>
                          
                          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-2 text-[11px] font-mono font-black text-rose-500 text-right mt-1.5">
                            {course.price}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Course privileges */}
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-bold text-rose-500 uppercase block">{t.courseSpecial}</span>
                    <ul className="text-[11px] text-zinc-650 dark:text-zinc-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li>{t.courseSpecial1}</li>
                      <li>{t.courseSpecial2}</li>
                      <li>{t.courseSpecial3}</li>
                    </ul>
                  </div>
                </div>

                {/* YOUTUBE EMBED PLAYER */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-black text-rose-505 text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Video className="w-5 h-5 text-rose-600" />
                    {t.mediaSection}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coach.youtubeYoutIds.map((ytId, idx) => (
                      <div key={idx} className="space-y-1 relative group">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block flex justify-between items-center">
                          <span>🎥 Battle Video Showcase #{idx + 1}</span>
                          {role === 'coach' && (
                            <button
                              onClick={() => {
                                const updatedIds = coach.youtubeYoutIds.filter((_, i) => i !== idx);
                                const updated = { ...coach, youtubeYoutIds: updatedIds };
                                syncCoach(updated);
                                showToast("Video removed");
                              }}
                              className="text-rose-450 hover:text-rose-600 font-bold transition-all text-[9px] cursor-pointer"
                            >
                              Xóa
                            </button>
                          )}
                        </span>
                        <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden border border-zinc-800 shadow bg-black">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title="Pickleball combat play showcase"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Photos grid */}
                  <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-mono text-rose-500 font-bold block">📸 GIAO LƯU & TẬN HƯỞNG KHOẢNH KHẮC</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {coach.photos.map((ph, idx) => (
                        <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-900 bg-zinc-950 group">
                          <img
                            src={ph}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                            alt="pickleball session photo"
                            referrerPolicy="no-referrer"
                          />
                          {role === 'coach' && (
                            <button
                              onClick={() => {
                                const newPhotos = coach.photos.filter((_, i) => i !== idx);
                                const updated = { ...coach, photos: newPhotos };
                                syncCoach(updated);
                                showToast("Photo deleted");
                              }}
                              className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-md text-[9px] transition-all cursor-pointer"
                            >
                              Del
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inline adding form for photos/videos inside media section itself for extreme usability */}
                  {role === 'coach' && (
                    <div className="bg-zinc-50 dark:bg-zinc-955 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-3 mt-4 text-xs">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500 font-bold">
                        <PlusCircle className="w-4 h-4" />
                        <span>Đăng nhanh Video trận đấu hoặc Ảnh khoảnh khắc</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-400 text-[10px] uppercase block font-mono">Loại nội dung</label>
                          <select
                            value={newMediaType}
                            onChange={(e) => { setNewMediaType(e.target.value as any); setNewMediaUrl(''); }}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none text-black dark:text-white"
                          >
                            <option value="video">🎥 Trận đấu (YouTube ID hoặc URL đầy đủ)</option>
                            <option value="photo">🔗 Ảnh giao lưu (Dán URL liên kết ảnh)</option>
                            <option value="local_photo">💻 Tải ảnh trực tiếp từ máy (PC/Mobile dạng file)</option>
                          </select>
                        </div>

                        {newMediaType === 'local_photo' ? (
                          <div className="space-y-1">
                            <label className="text-zinc-400 text-[10px] uppercase block font-mono">Chọn tệp ảnh từ ổ đĩa</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      compressImage(reader.result, 600, 600, 0.75).then(compressed => {
                                        setNewMediaUrl(compressed);
                                        showToast(lang === 'vi' ? "Đã nạp & tối ưu hóa ảnh khoảnh khắc!" : "Moment photo compressed!");
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-rose-500/10 file:text-rose-500 hover:file:bg-rose-500/20 bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-zinc-400 text-[10px] uppercase block font-mono">
                              {newMediaType === 'video' ? "Dán Link YouTube hoặc Video ID" : "Dán Link ảnh liên kết (URL)"}
                            </label>
                            <input
                              type="text"
                              value={newMediaUrl}
                              onChange={(e) => setNewMediaUrl(e.target.value)}
                              placeholder={newMediaType === 'video' ? "https://www.youtube.com/watch?v=..." : "https://example.com/photo.jpg"}
                              className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleAddMedia}
                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Đăng lên Thư Viện Media
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER & DRAGDOWN WAITING MENUS */}
      <footer className="bg-zinc-900 border-t border-zinc-850 mt-16 text-zinc-400 py-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
          
          {/* DRAG-DOWN DROPDOWN SYSTEM FOR FUTURE IDEAS (Only visible in HLV Phong mode per Request 7) */}
          {role === 'coach' && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-inner">
              <button
                onClick={() => setIsFutureIdeasOpen(!isFutureIdeasOpen)}
                className="w-full flex items-center justify-between font-black text-rose-500 hover:text-rose-450 transition-colors text-xs tracking-wider uppercase cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 animate-spin" />
                  {t.futureMenuTitle}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFutureIdeasOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFutureIdeasOpen && (
                <div className="mt-4 space-y-3 border-t border-zinc-850/60 pt-4 animate-slideDown">
                  <p className="text-[11px] text-zinc-505 font-sans leading-relaxed mb-4">
                    {t.futureTip}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans">
                    {futureIdeas.map((idea) => {
                      const voted = votedIdeas[idea.id];
                      return (
                        <div
                          key={idea.id}
                          className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-rose-500/30 transition-all"
                        >
                          <div>
                            <h5 className="font-bold text-zinc-200 text-xs">{lang === 'vi' ? idea.titleVI : idea.titleEN}</h5>
                            <p className="text-[10px] text-zinc-450 font-mono mt-0.5">Status: Concept Backlog menu</p>
                          </div>
                          <button
                            onClick={() => handleVoteIdea(idea.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition-all ${
                              voted
                                ? 'bg-rose-600/15 text-rose-450 border border-rose-500/20'
                                : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-450'
                            }`}
                          >
                            <Vote className="w-3 h-3" />
                            <span>{voted ? "Voted 👍" : "Upvote"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/60 text-center md:text-left text-[11px]">
            <div>
              <p className="font-black text-rose-505 text-rose-600 uppercase tracking-widest">{t.appTitle} — Combat never ends 🏓</p>
              <p className="mt-1 text-zinc-500">100% Free Client-side Persistence, built with love for Phongprot & pupils.</p>
            </div>
            
            <div className="text-zinc-550 text-center md:text-right">
              <p>© 2026 PROT PICK SYSTEM. All copyrights reserved.</p>
              <p className="text-[10px] mt-0.5 text-zinc-650">Local Cache persistent active state</p>
            </div>
          </div>
        </div>
      </footer>

      {/* NATIVE PIN MODAL OVERLAY */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-zinc-900 border border-rose-500/25 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-805 transition cursor-pointer"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            {!isChangingPin ? (
              /* VERIFICATION / LOGIN MODE */
              <div className="space-y-6 text-zinc-100">
                <div className="text-center space-y-2">
                  <div className="bg-rose-500/10 text-rose-500 p-4 rounded-3xl inline-block mx-auto">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {lang === 'vi' ? 'XÁC THỰC QUYỀN HLV' : 'VERIFY COACH PRIVILEGE'}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    {lang === 'vi' 
                      ? 'Vui lòng nhập Mã PIN bảo mật để chuyển sang Chế độ HLV.' 
                      : 'Please enter the security PIN code to activate Coach Mode.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Invisible input to capture physical keyboard input */}
                  <div className="relative flex flex-col items-center justify-center p-2 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <input
                      type="tel"
                      pattern="[0-9]*"
                      maxLength={5}
                      autoFocus
                      value={pinInputValue}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        
                        // If there was an error, or if they had already filled 4 digits, start fresh with the last entered digit!
                        if (pinInputValue.length === 4 || pinModalError) {
                          val = val.slice(-1);
                          setPinModalError('');
                        } else if (val.length > 4) {
                          val = val.slice(0, 4);
                        }
                        
                        setPinInputValue(val);
                        setPinModalError('');
                        
                        if (val === dbCoachPin) {
                          setRole('coach');
                          localStorage.setItem('protpick_role', 'coach');
                          setActiveTab('about');
                          setIsPinModalOpen(false);
                          setPinInputValue('');
                          showToast(lang === 'vi' ? "🔓 Đã mở khóa quyền Sửa đổi HLV thành công! Tự động chuyển đến Hồ sơ HLV Phong." : "🔓 Coach Edit privilege activated! Redirecting to Coach Profile.");
                        } else if (val.length === 4) {
                          setTimeout(() => {
                            setPinModalError(lang === 'vi' ? "Mã PIN không chính xác! Hãy thử lại." : "Incorrect PIN! Please try again.");
                          }, 150);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      placeholder="Enter PIN"
                    />

                    {/* iOS-Style PIN dots display (Circle buttons that automatically fill sequentially) */}
                    <div className="flex justify-center items-center gap-6 my-4 select-none pointer-events-none">
                      {[0, 1, 2, 3].map((index) => {
                        const hasDigit = pinInputValue.length > index;
                        return (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                              hasDigit
                                ? 'bg-rose-500 border-rose-500 scale-115 shadow-md shadow-rose-500/25'
                                : 'bg-transparent border-zinc-600'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {pinModalError && (
                    <p className="text-xs text-rose-500 text-center font-bold animate-pulse">
                      ⚠️ {pinModalError}
                    </p>
                  )}
                </div>

                {/* VISUAL PHONE-STYLE QUICK PIN-PAD */}
                <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        let draft = pinInputValue;
                        if (draft.length === 4 || pinModalError) {
                          draft = '';
                          setPinModalError('');
                        }
                        if (draft.length < 4) {
                          const newVal = draft + num;
                          setPinInputValue(newVal);
                          if (newVal === dbCoachPin) {
                            setTimeout(() => {
                              setRole('coach');
                              localStorage.setItem('protpick_role', 'coach');
                              setActiveTab('about');
                              setIsPinModalOpen(false);
                              setPinInputValue('');
                              showToast(lang === 'vi' ? "🔓 Đã mở khóa quyền Sửa đổi HLV thành công! Tự động chuyển đến Hồ sơ HLV Phong." : "🔓 Coach Edit privilege activated! Redirecting to Coach Profile.");
                            }, 150);
                          } else if (newVal.length === 4) {
                            setTimeout(() => {
                              setPinModalError(lang === 'vi' ? "Mã PIN không chính xác! Hãy thử lại." : "Incorrect PIN! Please try again.");
                            }, 150);
                          }
                        }
                      }}
                      className="h-12 bg-zinc-800 hover:bg-zinc-700/80 active:scale-95 text-xl font-extrabold text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs border border-zinc-750"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPinInputValue('');
                      setPinModalError('');
                    }}
                    className="h-12 bg-zinc-800/40 hover:bg-zinc-800/80 hover:text-rose-500 active:scale-95 text-xs font-black text-zinc-400 rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    CLEAR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let draft = pinInputValue;
                      if (draft.length === 4 || pinModalError) {
                        draft = '';
                        setPinModalError('');
                      }
                      if (draft.length < 4) {
                        const newVal = draft + '0';
                        setPinInputValue(newVal);
                        if (newVal === dbCoachPin) {
                          setTimeout(() => {
                            setRole('coach');
                            localStorage.setItem('protpick_role', 'coach');
                            setActiveTab('about');
                            setIsPinModalOpen(false);
                            setPinInputValue('');
                            showToast(lang === 'vi' ? "🔓 Đã mở khóa quyền Sửa đổi HLV thành công! Tự động chuyển đến Hồ sơ HLV Phong." : "🔓 Coach Edit privilege activated! Redirecting to Coach Profile.");
                          }, 150);
                        } else if (newVal.length === 4) {
                          setTimeout(() => {
                            setPinModalError(lang === 'vi' ? "Mã PIN không chính xác! Hãy thử lại." : "Incorrect PIN! Please try again.");
                          }, 150);
                        }
                      }
                    }}
                    className="h-12 bg-zinc-800 hover:bg-zinc-700/80 active:scale-95 text-xl font-extrabold text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs border border-zinc-750"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Manual submit action fallback
                      const savedPin = dbCoachPin;
                      if (pinInputValue === savedPin) {
                        setRole('coach');
                        localStorage.setItem('protpick_role', 'coach');
                        setActiveTab('about');
                        setIsPinModalOpen(false);
                        setPinInputValue('');
                        showToast(lang === 'vi' ? "🔓 Đã mở khóa quyền Sửa đổi HLV thành công! Tự động chuyển đến Hồ sơ HLV Phong." : "🔓 Coach Edit privilege activated! Redirecting to Coach Profile.");
                      } else {
                        setPinModalError(lang === 'vi' ? "Mã PIN không chính xác! Hãy thử lại." : "Incorrect PIN! Please try again.");
                      }
                    }}
                    className="h-12 bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-black text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-md"
                  >
                    OK
                  </button>
                </div>

                <div className="text-center text-[10px] text-zinc-500 font-mono">
                  {lang === 'vi' ? '💡 Nhấn số trên màn hình hoặc gõ phím trực tiếp' : '💡 Touch keypads or type on your keyboard'}
                  <span className="block mt-1.5 text-zinc-650">
                    {lang === 'vi' ? 'Mã PIN mặc định là: 1234' : 'Default PIN card is: 1234'}
                  </span>
                </div>
              </div>
            ) : (
              /* CHANGE PIN MODE */
              <div className="space-y-5 text-zinc-100">
                <div className="text-center space-y-2">
                  <div className="bg-rose-500/10 text-rose-500 p-3.5 rounded-3xl inline-block mx-auto">
                    <Key className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {lang === 'vi' ? 'CÀI ĐẶT MÃ PIN MỚI' : 'CHANGE COACH PIN'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {lang === 'vi'
                      ? 'Thiết lập mật mã PIN mới để bảo vệ quyền chỉnh sửa'
                      : 'Set a new PIN to restrict unauthorized workspace edits'}
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">
                      {lang === 'vi' ? '1. Nhập Mã PIN hiện tại *' : '1. Enter Current PIN *'}
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      value={currentPinValueForChange}
                      onChange={(e) => setCurrentPinValueForChange(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full p-2.5 bg-zinc-955 border border-zinc-750 text-white rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">
                      {lang === 'vi' ? '2. Nhập Mã PIN mới *' : '2. Enter New PIN *'}
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      value={newPinValue1}
                      onChange={(e) => setNewPinValue1(e.target.value)}
                      className="w-full p-2.5 bg-zinc-955 border border-zinc-750 text-white rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">
                      {lang === 'vi' ? '3. Nhập lại Mã PIN mới để xác nhận *' : '3. Re-enter New PIN *'}
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      value={newPinValue2}
                      onChange={(e) => setNewPinValue2(e.target.value)}
                      className="w-full p-2.5 bg-zinc-955 border border-zinc-750 text-white rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  {pinModalError && (
                    <p className="text-xs text-rose-500 text-center font-bold">
                      ⚠️ {pinModalError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-350 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const savedPin = dbCoachPin;
                      if (currentPinValueForChange !== savedPin) {
                        setPinModalError(lang === 'vi' ? "Mã PIN hiện tại không khớp!" : "Current PIN is incorrect!");
                        return;
                      }
                      if (!newPinValue1.trim()) {
                        setPinModalError(lang === 'vi' ? "Mã PIN mới không được trống!" : "New PIN cannot be empty!");
                        return;
                      }
                      if (newPinValue1 !== newPinValue2) {
                        setPinModalError(lang === 'vi' ? "Xác nhận Mã PIN mới không khớp!" : "New PIN confirmation does not match!");
                        return;
                      }
                      try {
                        await setDoc(doc(db, 'settings', 'security'), { pin: newPinValue1.trim() });
                        setDbCoachPin(newPinValue1.trim());
                        localStorage.setItem('protpick_coach_pin', newPinValue1.trim());
                        setIsPinModalOpen(false);
                        showToast(lang === 'vi' ? "✅ Đã đổi Mã PIN bảo mật HLV thành công!" : "✅ Coach PIN security configured successfully!");
                      } catch (err) {
                        console.error(err);
                        setPinModalError(lang === 'vi' ? "Lỗi đồng bộ Firebase" : "Firebase sync error");
                      }
                    }}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
                  >
                    {lang === 'vi' ? 'Lưu PIN mới' : 'Save PIN'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NATIVE HISTORICAL CHART MODAL OVERLAY */}
      {selectedSkillForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedSkillForHistory(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-500 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 transition cursor-pointer"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
              <div className="space-y-1">
                <span className="text-[10px] text-rose-500 font-mono font-bold uppercase tracking-widest block">HISTORICAL ATTRIBUTE TRACKER</span>
                <h3 className="text-xl font-black text-zinc-940 dark:text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  {selectedSkillForHistory.name}
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed pt-1.5 border-t border-zinc-100 dark:border-zinc-805">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{lang === 'vi' ? 'Định nghĩa: ' : 'Definition: '}</span>
                  {lang === 'vi' ? selectedSkillForHistory.descriptionVI : selectedSkillForHistory.descriptionEN}
                </p>
              </div>

              {/* CHART DISPLAY ZONE */}
              <div className="bg-zinc-50 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-850 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Biểu đồ tiến trình học tập</span>
                  <div className="flex gap-2 text-[9px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{lang === 'vi' ? 'Điểm đánh giá' : 'Rating scale'}</span>
                  </div>
                </div>

                {(() => {
                  // Format Date to DD/MM/YY
                  const formatDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    const parts = dateStr.split('-');
                    if (parts.length === 3) {
                      const yr = parts[0].substring(2);
                      return `${parts[2]}/${parts[1]}/${yr}`;
                    }
                    return dateStr;
                  };

                  // Retrieve sorted sessions for current selected skill
                  const historyData = sessions
                    .filter(s => s.studentId === activeStudent?.id && s.status === 'Completed' && s.skillScores && s.skillScores[selectedSkillForHistory.name] !== undefined)
                    .sort((a, b) => a.date.localeCompare(b.date));

                  let chartData = historyData.map(s => ({
                    date: formatDate(s.date),
                    score: s.skillScores[selectedSkillForHistory.name],
                    title: s.title
                  }));

                  // If empty, seed with joining date of student
                  if (chartData.length === 0 && activeStudent) {
                    chartData = [
                      {
                        date: formatDate(activeStudent.joiningDate) || 'Gia nhập',
                        score: activeStudent.skills[selectedSkillForHistory.name] || 1,
                        title: 'Đăng ký nhập học'
                      }
                    ];
                  }

                  const pointSpacing = 70;
                  const leftMargin = 55;
                  const rightMargin = 40;
                  const chartHeight = 200;
                  const topMargin = 25;
                  const bottomMargin = 35;
                  
                  const totalPoints = chartData.length;
                  const chartWidth = leftMargin + rightMargin + Math.max(0, totalPoints - 1) * pointSpacing;
                  
                  const getX = (index: number) => {
                    if (totalPoints <= 1) return leftMargin + (chartWidth - leftMargin - rightMargin) / 2;
                    return leftMargin + index * pointSpacing;
                  };
                  
                  const getY = (score: number) => {
                    const usableHeight = chartHeight - topMargin - bottomMargin;
                    const ratingValue = Number(score) || 1;
                    return chartHeight - bottomMargin - ((ratingValue - 1) / 4) * usableHeight;
                  };

                  const pathD = chartData.map((d, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(d.score)}`).join(' ');
                  const areaD = chartData.length > 0 
                    ? `${pathD} L ${getX(chartData.length - 1)} ${chartHeight - bottomMargin} L ${getX(0)} ${chartHeight - bottomMargin} Z`
                    : '';

                  return (
                    <div 
                      ref={chartContainerRefForHistory}
                      className="w-full overflow-x-auto select-none py-1 border border-zinc-200/50 dark:border-zinc-800/45 rounded-xl bg-white dark:bg-zinc-900 scroll-smooth no-scrollbar"
                    >
                      <div style={{ width: chartWidth, height: chartHeight }} className="relative">
                        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                          <defs>
                            <linearGradient id="pop-chart-gradle" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid horizontal guidelines */}
                          {[1, 2, 3, 4, 5].map(val => (
                            <g key={val}>
                              <line 
                                x1={0} 
                                y1={getY(val)} 
                                x2={chartWidth} 
                                y2={getY(val)} 
                                stroke={theme === 'dark' ? "transparent" : "#f4f4f5"} 
                                strokeWidth={1}
                              />
                              <line 
                                x1={leftMargin} 
                                y1={getY(val)} 
                                x2={chartWidth} 
                                y2={getY(val)} 
                                stroke={theme === 'dark' ? "#27272a" : "#e4e4e7"} 
                                strokeWidth={1} 
                                strokeDasharray="3,3" 
                              />
                              <text 
                                x={10} 
                                y={getY(val) + 3.5} 
                                fontSize={9} 
                                className="fill-zinc-400 font-mono"
                              >
                                {val} pt
                              </text>
                            </g>
                          ))}

                          {/* Area & line path */}
                          {chartData.length > 1 && (
                            <>
                              <path 
                                d={areaD} 
                                fill="url(#pop-chart-gradle)" 
                              />
                              <path 
                                d={pathD} 
                                fill="none" 
                                stroke="#f43f5e" 
                                strokeWidth={2.5} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                              />
                            </>
                          )}

                          {/* Data points */}
                          {chartData.map((d, index) => {
                            const cx = getX(index);
                            const cy = getY(d.score);
                            return (
                              <g key={index} className="group">
                                <circle 
                                  cx={cx} 
                                  cy={cy} 
                                  r={9} 
                                  className="fill-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" 
                                />
                                <circle 
                                  cx={cx} 
                                  cy={cy} 
                                  r={4} 
                                  fill="#f43f5e" 
                                  stroke={theme === 'dark' ? "#18181b" : "#ffffff"} 
                                  strokeWidth={1.5} 
                                />
                                <text 
                                  x={cx} 
                                  y={cy - 10} 
                                  textAnchor="middle" 
                                  fontSize={10} 
                                  className="fill-rose-500 font-black font-mono animate-bounce"
                                >
                                  {d.score}đ
                                </text>
                                <text 
                                  x={cx} 
                                  y={chartHeight - 12} 
                                  textAnchor="middle" 
                                  fontSize={9} 
                                  className="fill-zinc-400 dark:fill-zinc-500 font-mono font-medium"
                                >
                                  {d.date}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  );
                })()}
                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 text-center block mt-2 italic font-sans text-stone-500">
                  {lang === 'vi' ? '💡 Nhấn trượt ngang để xem dòng thời gian đến ngày học gần nhất' : '💡 Drag or scroll horizontally to locate the newest sessions towards the right'}
                </span>
              </div>

              {/* DETAILED HISTORICAL LOG LIST */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">{lang === 'vi' ? 'Nhật ký đánh giá chi tiết' : 'Detailed Assessment Logs'}</span>
                {(() => {
                  const items = sessions
                    .filter(s => s.studentId === activeStudent?.id && s.status === 'Completed' && s.skillScores && s.skillScores[selectedSkillForHistory.name] !== undefined)
                    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first for log text

                  if (items.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-center text-xs text-zinc-500 dark:text-zinc-400 italic">
                        {lang === 'vi' ? 'Chưa có buổi học thực chiến ghi nhận kỹ năng này hằng ngày.' : 'No live session grading recorded for this skill yet.'}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                      {items.map(item => {
                        const score = item.skillScores[selectedSkillForHistory.name];
                        return (
                          <div key={item.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl flex items-start gap-3">
                            <span className="px-2 py-1 bg-rose-500/10 text-rose-500 font-mono font-bold text-xs rounded-lg shrink-0 mt-0.5">
                              {score} / 5
                            </span>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                <span className="font-bold truncate text-zinc-700 dark:text-zinc-300">{item.title}</span>
                                <span className="font-mono">{item.date}</span>
                              </div>
                              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-serif italic text-stone-500 mt-1">
                                "{lang === 'vi' ? item.coachFeedbackVI : item.coachFeedbackEN}"
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSkillForHistory(null)}
                  className="w-full py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-705 text-zinc-750 dark:text-zinc-305 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  {lang === 'vi' ? 'Đóng lại' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FIXED BOTTOM NAVIGATION TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-850 pb-safe shadow-xl" id="mobile-bottom-tabs">
        <div className="flex justify-around items-center h-16">
          {[
            { id: 'dashboard', label: lang === 'vi' ? 'Thống kê' : 'Dashboard', icon: <Activity className="w-5 h-5" /> },
            { id: 'students', label: lang === 'vi' ? 'Học viên' : 'Pupils', icon: <Users className="w-5 h-5" /> },
            { id: 'curriculum', label: lang === 'vi' ? 'Giáo án' : 'Syllabus', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'sessions', label: lang === 'vi' ? 'Lịch dạy' : 'Sessions', icon: <Calendar className="w-5 h-5" /> },
            { id: 'about', label: lang === 'vi' ? 'HLV Phong' : 'Coach', icon: <Award className="w-5 h-5" /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all cursor-pointer bg-transparent border-none outline-none"
              >
                <div className={`relative p-1 rounded-full transition-all ${
                  isActive ? 'text-rose-500 scale-110' : 'text-zinc-500 hover:text-zinc-350'
                }`}>
                  {tab.icon}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  )}
                </div>
                <span className={`text-[9px] font-semibold mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-rose-500 font-extrabold' : 'text-zinc-550'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (FAB) FOR COACH */}
      {role === 'coach' && ['students', 'curriculum', 'sessions', 'dashboard'].includes(activeTab) && (
        <button
          onClick={() => {
            if (activeTab === 'students') {
              setEditingStudent({ name: '', targetGoal: '', notes: '', phone: '', email: '', level: '1.0-2.0', isPublic: true });
            } else if (activeTab === 'curriculum') {
              setEditingPlan({ titleVI: '', titleEN: '', descriptionVI: '', descriptionEN: '', skillsFocused: [], durationMin: 60, isPublic: true });
            } else if (activeTab === 'sessions') {
              setNewSession({ studentId: '', lessonPlanId: '', date: new Date().toISOString().split('T')[0], durationMin: 60, status: 'Scheduled', skillScores: {}, isPublic: true, coachFeedbackVI: '', coachFeedbackEN: '', location: '' });
              // Smooth scroll to the form
              setTimeout(() => {
                document.getElementById('session-form-heading')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            } else if (activeTab === 'dashboard') {
              setNewNoti({ titleVI: '', titleEN: '', contentVI: '', contentEN: '', type: 'info', isPublic: true });
            }
          }}
          className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title={lang === 'vi' ? 'Thêm mới' : 'Add New'}
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      )}

    </div>
  );
}
