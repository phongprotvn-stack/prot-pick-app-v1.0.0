import React from 'react';
import {
  Search,
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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  searchQuery,
  setSearchQuery,
  filteredStudents,
  sessions,
  resolvedStudents,
  skillsList,
  getAverageRating,
  setActiveTab,
  setSelectedStudentId,
}: DashboardTabProps) {
  return (
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
                'Reset', 'Flick', 'Roll', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
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
  );
}
