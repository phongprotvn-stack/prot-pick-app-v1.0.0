import React from 'react';
import {
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  Flame,
  Calendar
} from 'lucide-react';
import { Student, CurriculumSkill, Session } from '../types';
import { LanguageKey } from '../translations';

interface DashboardTabProps {
  t: Record<string, string>;
  lang: LanguageKey;
  filteredStudents: Student[];
  sessions: Session[];
  resolvedStudents: Student[];
  skillsList: CurriculumSkill[];
  getAverageRating: (student: Student) => number;
  setActiveTab: (tab: string) => void;
  setSelectedStudentId: (id: string) => void;
}

export default function DashboardTab({
  t,
  lang,
  filteredStudents,
  sessions,
  resolvedStudents,
  skillsList,
  getAverageRating,
  setActiveTab,
  setSelectedStudentId,
}: DashboardTabProps) {

  // Stats helper
  const totalStudents = filteredStudents.length;
  const totalSessionsDone = sessions.filter(s => s.status === 'Completed').length;
  const avgRating = resolvedStudents.length > 0
    ? (resolvedStudents.reduce((acc, s) => acc + getAverageRating(s), 0) / resolvedStudents.length).toFixed(1)
    : '0.0';
  const completionRate = totalSessionsDone > 0 ? Math.min(100, Math.round((totalSessionsDone / sessions.length) * 100)) + '%' : '0%';

  // Skill order
  const skillOrder = [
    'Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop',
    'Reset', 'Flick', 'Roll', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
  ];

  // Upcoming sessions (next 3)
  const upcomingSessions = [...sessions]
    .filter(s => s.status === 'Scheduled')
    .slice(0, 3);

  // Top students (by rating)
  const topStudents = [...resolvedStudents]
    .sort((a, b) => getAverageRating(b) - getAverageRating(a))
    .slice(0, 3);

  return (
    <div className="space-y-5 animate-fadeIn" id="tab-dashboard-panel">
      {/* 1️⃣ BUỔI DẠY SẮP TỚI */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-rose-500" />
          {lang === 'vi' ? 'Buổi học sắp tới' : 'Upcoming'}
        </h3>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-2.5">
            {upcomingSessions.map((sess) => {
              const stu = resolvedStudents.find(s => s.id === sess.studentId);
              return (
                <div key={sess.id} className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{sess.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      {stu && <span className="font-semibold">{stu.name}</span>}
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {(() => { const d = sess.date?.split('-'); return d ? `${d[2]}/${d[1]}/${d[0]}` : sess.date; })()}
                      </span>
                      {sess.durationMin && <><span>·</span><span>⏱ {sess.durationMin}p</span></>}
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                    {t.uncompletedSession}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">{lang === 'vi' ? 'Chưa có buổi dạy nào sắp tới' : 'No upcoming sessions'}</p>
        )}
      </div>

      {/* 2️⃣ HỌC VIÊN XUẤT SẮC */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-rose-500" />
          {t.highPerformers}
        </h3>
        {topStudents.length > 0 ? (
          <div className="space-y-2">
            {topStudents.map((stu, i) => (
              <div
                key={stu.id}
                onClick={() => { setSelectedStudentId(stu.id); setActiveTab('students'); }}
                className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
              >
                <span className="font-mono text-sm font-black text-rose-500 w-6 shrink-0">#0{i+1}</span>
                <img src={stu.avatar} className="w-8 h-8 rounded-full object-cover border border-rose-300 shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-100">{stu.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">Level {stu.level}</p>
                </div>
                <div className="flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-lg text-[10px] font-black text-rose-500 font-mono shrink-0">
                  <Star className="w-2.5 h-2.5 fill-rose-500" />
                  <span>{getAverageRating(stu)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">{lang === 'vi' ? 'Chưa có học viên nào' : 'No students yet'}</p>
        )}
      </div>

      {/* 3️⃣ 4 THỐNG KÊ CHÍNH — 2x2 GRID */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">{t.statsTotalStudents}</span>
          <span className="text-2xl font-black text-rose-500 mt-1">{totalStudents}</span>
          <span className="text-[9px] text-zinc-400 mt-1">{lang === 'vi' ? 'Đang hoạt động' : 'Active students'}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">{t.statsTotalSessions}</span>
          <span className="text-2xl font-black text-rose-500 mt-1">{totalSessionsDone}</span>
          <span className="text-[9px] text-zinc-400 mt-1">{lang === 'vi' ? 'Đã hoàn thành' : 'Completed'}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">{t.statsAvgRating}</span>
          <span className="text-2xl font-black text-rose-500 mt-1">{avgRating} <span className="text-sm">/ 5.0</span></span>
          <span className="text-[9px] text-zinc-400 mt-1">{lang === 'vi' ? 'Toàn bộ kỹ năng' : 'All skills'}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">{t.statsCompletionRate}</span>
          <span className="text-2xl font-black text-rose-500 mt-1">{completionRate}</span>
          <span className="text-[9px] text-zinc-400 mt-1">{lang === 'vi' ? 'Hoàn thành buổi dạy' : 'Session completion'}</span>
        </div>
      </div>

      {/* 4️⃣ KỸ NĂNG ĐẠT CHUẨN (ĐIỂM >= 3) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          {lang === 'vi' ? 'Học viên đạt chuẩn (Điểm ≥ 3) theo kỹ năng' : 'Students Meeting Standard (Score >=3) by Skill'}
        </h3>
        <div className="space-y-2.5">
          {[...skillsList].sort((a, b) => {
            const idxA = skillOrder.indexOf(a.name);
            const idxB = skillOrder.indexOf(b.name);
            return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
          }).map((skill) => {
            const qualifiedCount = resolvedStudents.filter(st => (st.skills[skill.name] || 0) >= 3).length;
            const totalCount = resolvedStudents.length || 1;
            const percent = Math.round((qualifiedCount / totalCount) * 100);
            return (
              <div key={skill.id}>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                  <span className="font-mono text-zinc-500">
                    {qualifiedCount}/{totalCount}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
