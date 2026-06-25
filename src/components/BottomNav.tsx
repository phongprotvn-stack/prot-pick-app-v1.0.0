import { Activity, Users, BookOpen, Calendar, Award, Plus } from 'lucide-react';
import { LanguageKey } from '../translations';

interface BottomNavProps {
  t: Record<string, string>;
  lang: LanguageKey;
  role: 'coach' | 'student';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (q: string) => void;
  setEditingStudent: (v: any) => void;
  setEditingPlan: (v: any) => void;
  setNewSession: (v: any) => void;
  setNewNoti: (v: any) => void;
}

export default function BottomNav({
  t, lang, role, activeTab, setActiveTab, setSearchQuery,
  setEditingStudent, setEditingPlan, setNewSession, setNewNoti
}: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: lang === 'vi' ? 'Thống kê' : 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { id: 'students', label: lang === 'vi' ? 'Học viên' : 'Pupils', icon: <Users className="w-5 h-5" /> },
    { id: 'curriculum', label: lang === 'vi' ? 'Giáo án' : 'Syllabus', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'sessions', label: lang === 'vi' ? 'Lịch dạy' : 'Sessions', icon: <Calendar className="w-5 h-5" /> },
    { id: 'about', label: lang === 'vi' ? 'HLV Phong' : 'Coach', icon: <Award className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* MOBILE FIXED BOTTOM NAVIGATION TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 pb-safe shadow-xl" id="mobile-bottom-tabs">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all cursor-pointer bg-transparent border-none outline-none"
              >
                <div className={`relative p-1 rounded-full transition-all ${
                  isActive ? 'text-rose-500 scale-110' : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350'
                }`}>
                  {tab.icon}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  )}
                </div>
                <span className={`text-[9px] font-semibold mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-rose-500 font-extrabold' : 'text-zinc-600 dark:text-zinc-550'
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
    </>
  );
}
