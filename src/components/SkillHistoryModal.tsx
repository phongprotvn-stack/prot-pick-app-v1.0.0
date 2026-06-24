import { TrendingUp, X } from 'lucide-react';
import { LanguageKey } from '../translations';
import { CurriculumSkill, Session } from '../types';

interface SkillHistoryModalProps {
  selectedSkillForHistory: CurriculumSkill | null;
  setSelectedSkillForHistory: (v: CurriculumSkill | null) => void;
  lang: LanguageKey;
  sessions: Session[];
  resolvedStudents: any[];
}

export default function SkillHistoryModal({
  selectedSkillForHistory, setSelectedSkillForHistory,
  lang, sessions, resolvedStudents
}: SkillHistoryModalProps) {
  if (!selectedSkillForHistory) return null;

  const historyItems = sessions
    .filter(s => s.status === 'Completed')
    .map(s => {
      const student = resolvedStudents.find((st: any) => st.id === s.studentId);
      return { ...s, studentName: student?.name || 'Unknown' };
    })
    .filter(s => s.skillScores && selectedSkillForHistory.name in s.skillScores)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
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

          {historyItems.length > 0 ? (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
              {historyItems.map((item: any) => {
                const score = item.skillScores[selectedSkillForHistory.name];
                return (
                  <div key={item.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl flex items-start gap-3">
                    <span className={`px-2 py-1 font-mono font-bold text-xs rounded-lg shrink-0 mt-0.5 ${
                      score >= 4 ? 'bg-emerald-500/10 text-emerald-500' :
                      score <= 2 ? 'bg-red-500/10 text-red-400' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {score} / 5
                    </span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span className="font-bold truncate text-zinc-700 dark:text-zinc-300">{item.studentName} — {item.title}</span>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-400">{lang === 'vi' ? 'Chưa có dữ liệu lịch sử cho kỹ năng này.' : 'No historical data for this skill yet.'}</p>
            </div>
          )}
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
  );
}
