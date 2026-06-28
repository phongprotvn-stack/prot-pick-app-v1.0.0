import { TrendingUp, X, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageKey } from '../translations';
import { CurriculumSkill, Session } from '../types';
import { useRef, useEffect } from 'react';

interface SkillHistoryModalProps {
  selectedSkillForHistory: CurriculumSkill | null;
  setSelectedSkillForHistory: (v: CurriculumSkill | null) => void;
  lang: LanguageKey;
  sessions: Session[];
  resolvedStudents: any[];
  studentId?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function getScoreColor(score: number): string {
  if (score >= 4) return '#10b981';
  if (score <= 2) return '#f43f5e';
  return '#f59e0b';
}

export default function SkillHistoryModal({
  selectedSkillForHistory, setSelectedSkillForHistory,
  lang, sessions, resolvedStudents, studentId
}: SkillHistoryModalProps) {
  if (!selectedSkillForHistory) return null;

  // Filter sessions: only for this student (if studentId provided) + has the skill score
  const historyItems = sessions
    .filter(s => s.status === 'Completed')
    .filter(s => !studentId || s.studentId === studentId)
    .map(s => {
      const student = resolvedStudents.find((st: any) => st.id === s.studentId);
      return { ...s, studentName: student?.name || 'Unknown' };
    })
    .filter(s => s.skillScores && selectedSkillForHistory.name in s.skillScores)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Chart constants
  const PADDING_TOP = 24;
  const PADDING_BOTTOM = 32;
  const PADDING_LEFT = 36;
  const PADDING_RIGHT = 16;
  const CHART_W_PER_POINT = 72;
  const CHART_H = 200;
  const CHART_PLOT_H = CHART_H - PADDING_TOP - PADDING_BOTTOM; // 144
  const MIN_CHART_W = 280;

  const chartWidth = Math.max(
    MIN_CHART_W,
    historyItems.length * CHART_W_PER_POINT + PADDING_LEFT + PADDING_RIGHT
  );

  // Build data points
  const points = historyItems.map((item, i) => {
    const score = Number(item.skillScores[selectedSkillForHistory.name]) || 1;
    const x = PADDING_LEFT + i * CHART_W_PER_POINT + CHART_W_PER_POINT / 2;
    const y = PADDING_TOP + (5 - score) * CHART_PLOT_H / 4;
    return { x, y, score, date: formatDate(item.date), item };
  });

  // Y-axis labels (1-5)
  const yLabels = [1, 2, 3, 4, 5];

  // Trend: first vs last score
  const firstScore = points.length > 0 ? points[0].score : null;
  const lastScore = points.length > 0 ? points[points.length - 1].score : null;
  const trendIcon = firstScore !== null && lastScore !== null
    ? lastScore > firstScore ? <TrendingUp className="w-4 h-4 text-emerald-500" />
      : lastScore < firstScore ? <TrendingDown className="w-4 h-4 text-red-500" />
      : <Minus className="w-4 h-4 text-zinc-400" />
    : null;

  // Auto-scroll chart to the rightmost (newest data)
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [points.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-xs transition-opacity duration-300">
      <div className="card max-w-xl w-full relative overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        <button
          onClick={() => setSelectedSkillForHistory(null)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
          {/* HEADER */}
          <div className="space-y-1">
            <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-widest block">
              {lang === 'vi' ? 'THEO DÕI KỸ NĂNG' : 'SKILL HISTORY'}
            </span>
            <h3 className="text-xl font-black text-zinc-940 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              {selectedSkillForHistory.name}
              {trendIcon}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                {lang === 'vi' ? 'Định nghĩa: ' : 'Definition: '}
              </span>
              {lang === 'vi' ? selectedSkillForHistory.descriptionVI : selectedSkillForHistory.descriptionEN}
            </p>
          </div>

          {/* LINE CHART */}
          {points.length >= 1 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide font-bold">
                  {lang === 'vi' ? 'BIỂU ĐỒ ĐIỂM THEO THỜI GIAN' : 'SCORE TREND OVER TIME'}
                </span>
                <span className="text-[8px] text-zinc-400 italic flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" />
                  {lang === 'vi' ? 'Kéo ngang' : 'Scroll'}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div
                ref={chartRef}
                className="overflow-x-auto -mx-2 px-2 pb-1 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                <svg width={chartWidth} height={CHART_H} className="shrink-0">
                {/* Grid lines & Y-axis labels */}
                {yLabels.map((label) => {
                  const y = PADDING_TOP + (5 - label) * CHART_PLOT_H / 4;
                  return (
                    <g key={label}>
                      <line
                        x1={PADDING_LEFT} y1={y}
                        x2={chartWidth - PADDING_RIGHT} y2={y}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="0" y={y + 4}
                        className="text-[10px] fill-zinc-400 dark:fill-zinc-500"
                        textAnchor="start"
                        fontFamily="monospace"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Line path */}
                {points.length > 1 && (
                  <polyline
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data dots & date labels */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y} r="5"
                      fill="white"
                      stroke={getScoreColor(p.score)}
                      strokeWidth="2.5"
                      className="drop-shadow-sm"
                    />
                    <circle
                      cx={p.x} cy={p.y} r="2.5"
                      fill={getScoreColor(p.score)}
                    />
                    <text
                      x={p.x} y={p.y - 12}
                      className="text-[9px] fill-zinc-600 dark:fill-zinc-300"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {p.score}
                    </text>
                    <text
                      x={p.x} y={CHART_H - 4}
                      className="text-[8px] fill-zinc-400 dark:fill-zinc-600"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            </>
          )}

          {/* HISTORY LIST */}
          {historyItems.length > 0 ? (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide font-bold">
                  {lang === 'vi' ? 'CHI TIẾT BUỔI HỌC' : 'SESSION DETAILS'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">({historyItems.length})</span>
              </div>
              {historyItems.map((item: any) => {
                const score = item.skillScores[selectedSkillForHistory.name];
                return (
                  <div key={item.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl flex items-start gap-3">
                    <span className={`px-2 py-1 font-mono font-bold text-xs rounded-lg shrink-0 mt-0.5 ${
                      score >= 4 ? 'bg-emerald-500/10 text-emerald-500' :
                      score <= 2 ? 'bg-red-500/10 text-red-400' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {score} / 5
                    </span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span className="font-bold truncate text-zinc-700 dark:text-zinc-300">{item.studentName} — {item.title}</span>
                        <span className="font-mono">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic text-stone-500 mt-1">
                        &ldquo;{lang === 'vi' ? item.coachFeedbackVI : item.coachFeedbackEN}&rdquo;
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
            className="w-full py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer text-center"
          >
            {lang === 'vi' ? 'Đóng lại' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
