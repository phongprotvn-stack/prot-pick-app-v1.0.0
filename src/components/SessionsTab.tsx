import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Trash2, Info, Search } from 'lucide-react';
import { Session, LessonPlan, Student } from '../types';
import { LanguageKey } from '../translations';

interface SessionsTabProps {
  t: Record<string, string>;
  lang: LanguageKey;
  role: 'coach' | 'student';
  newSession: Partial<Session> | null;
  setNewSession: React.Dispatch<React.SetStateAction<Partial<Session> | null>>;
  editingSessionId: string | null;
  setEditingSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  sessionSearchQuery: string;
  setSessionSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sessionDateFilter: string;
  setSessionDateFilter: React.Dispatch<React.SetStateAction<string>>;
  resolvedStudents: (Student & { level: string })[];
  lessonPlans: LessonPlan[];
  filteredSessions: Session[];
  handleSaveSession: (e: React.FormEvent, forceStatus?: 'Scheduled' | 'Completed') => void;
  handleDeleteSession: (id: string) => void;
  showToast: (msg: string) => void;
  translateViToEn?: (text: string) => Promise<string | null>;
  translateEnToVi?: (text: string) => Promise<string | null>;
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  t,
  lang,
  role,
  newSession,
  setNewSession,
  editingSessionId,
  setEditingSessionId,
  sessionSearchQuery,
  setSessionSearchQuery,
  sessionDateFilter,
  setSessionDateFilter,
  resolvedStudents,
  lessonPlans,
  filteredSessions,
  handleSaveSession,
  handleDeleteSession,
  showToast,
  translateViToEn,
  translateEnToVi,
}) => {
  // ── Auto-translate coachFeedbackVI → coachFeedbackEN ──
  const [enFeedback, setEnFeedback] = useState('');
  useEffect(() => {
    if (lang === 'en' && translateViToEn && newSession?.coachFeedbackVI) {
      const t = setTimeout(async () => {
        const trans = await translateViToEn(newSession.coachFeedbackVI);
        if (trans && trans !== newSession.coachFeedbackEN) {
          setNewSession({ ...newSession, coachFeedbackEN: trans });
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [lang, newSession?.coachFeedbackVI, translateViToEn, newSession?.id]);

  // ── Auto-translate coachFeedbackEN → coachFeedbackVI ──
  useEffect(() => {
    if (lang === 'vi' && translateEnToVi && newSession?.coachFeedbackEN) {
      const t = setTimeout(async () => {
        const trans = await translateEnToVi(newSession.coachFeedbackEN);
        if (trans && trans !== newSession.coachFeedbackVI) {
          setNewSession({ ...newSession, coachFeedbackVI: trans });
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [lang, newSession?.coachFeedbackEN, translateEnToVi, newSession?.id]);

  return (
    <div className="space-y-8 animate-fadeIn" id="tab-sessions-panel">
      {/* NEW SESSIONS LOG FORM */}
      {role === 'coach' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 id="session-form-heading" className="text-base font-black text-red-600 text-red-600 uppercase tracking-widest flex items-center gap-1.5">
            <PlusCircle className="w-5 h-5 text-red-600 animate-pulse" />
            {lang === 'vi' ? 'GHI LỊCH DẠY & ĐÁNH GIÁ HỌC VIÊN' : 'SESSION LOG & STUDENT EVALUATION'}
          </h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
            {lang === 'vi'
              ? 'Khi HLV Phongprot lên lịch dợt và đánh giá kỹ năng học tập, hệ thống sẽ đồng bộ thông tin thời gian thực. Bấm trực tiếp vào các buổi học ở Nhật Ký Tập phía dưới để điền tiếp đánh giá!'
              : 'When Coach Phongprot schedules training and evaluates skills, the system syncs in real time. Click directly on sessions in the Training Log below to continue grading!'}
          </p>

          {(() => {
            const isScheduledMode = (newSession?.status || 'Scheduled') === 'Scheduled';
            return (
              <form onSubmit={(e) => handleSaveSession(e)} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">{lang === 'vi' ? 'Chọn Học Viên *' : 'Select Student *'}</label>
                    <select
                      required
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                      value={newSession?.studentId || ''}
                      onChange={(e) => setNewSession({ ...newSession, studentId: e.target.value, skillScores: {} })}
                    >
                      <option value="">{lang === 'vi' ? '-- Lựa chọn Học viên --' : '-- Select Student --'}</option>
                      {resolvedStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Lv {s.level})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">{lang === 'vi' ? 'Chọn Giáo Án Áp Dụng *' : 'Select Lesson Plan *'}</label>
                    <select
                      required
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
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
                      <option value="">{lang === 'vi' ? '-- Lựa chọn Giáo án --' : '-- Select Lesson Plan --'}</option>
                      {lessonPlans.map(lp => (
                        <option key={lp.id} value={lp.id}>{lp.titleVI}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">{lang === 'vi' ? 'Thời gian buổi dạy *' : 'Session Date *'}</label>
                    <div className="relative">
                      {/* Native date input — fully visible, clickable anywhere to open picker */}
                      <input
                        type="date"
                        required
                        className="w-full p-3 pl-9 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-black dark:text-white cursor-pointer"
                        value={newSession?.date || ''}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">{lang === 'vi' ? 'Địa điểm dạy' : 'Location'}</label>
                    <input
                      type="text"
                      placeholder={lang === 'vi' ? 'e.g. Sân Pickleball...' : 'e.g. Pickleball Court...'}
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                      value={newSession?.location || ''}
                      onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">{lang === 'vi' ? 'Thời lượng & Trạng thái' : 'Duration & Status'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="120"
                        className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl text-center"
                        value={newSession?.durationMin ?? ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '' || /^\d+$/.test(raw)) {
                            setNewSession({ ...newSession, durationMin: raw === '' ? (undefined as any) : Number(raw) });
                          }
                        }}
                      />
                      <select
                        className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl text-xs"
                        value={newSession?.status || 'Scheduled'}
                        onChange={(e) => setNewSession({ ...newSession, status: e.target.value as any })}
                      >
                        <option value="Scheduled">{lang === 'vi' ? 'Lên lịch chờ' : 'Scheduled'}</option>
                        <option value="Completed">{lang === 'vi' ? 'Hoàn thành' : 'Completed'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-zinc-400">{lang === 'vi' ? 'Tiêu đề Buổi huấn luyện / Trận đánh' : 'Training / Match Title'}</label>
                  <input
                  type="text"
                  className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-2xl"
                  placeholder={lang === 'vi' ? 'e.g. Dợt bóng Dink Kitchen bền bỉ & Chặn bóng đột kích' : 'e.g. Endurance Kitchen Dink Drills & Blocking Counterattacks'}
                    value={newSession?.title || ''}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  />
                </div>

                {/* DYNAMIC SCORING CONTROLLER */}
                {newSession?.lessonPlanId && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-red-500 tracking-wider block font-mono">
                        {lang === 'vi' ? '⚙ CHẤM ĐIỂM CÁC KỸ NĂNG TIÊU ĐIỂM (Scale 1 - 5):' : '⚙ RATE FOCUS SKILLS (Scale 1 - 5):'}
                      </span>
                      {isScheduledMode && (
                        <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                          {lang === 'vi' ? 'Khóa chấm điểm (Chọn Trạng thái Hoàn thành để mở)' : 'Scoring locked (Set status to Completed to edit)'}
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
                              <div key={sk} className="flex items-center justify-between p-2.5 bg-zinc-100/50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                                <span className="font-black text-zinc-700 dark:text-zinc-300">{sk}</span>
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
                                        isScheduledMode ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-red-600 hover:text-white'
                                      } ${
                                        currentScore === val
                                          ? 'bg-red-600 text-white font-black'
                                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
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

                {lang === 'vi' ? (
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-zinc-400">
                      Nhận xét {isScheduledMode && "🔒"}
                    </label>
                    <textarea
                      disabled={isScheduledMode}
                      className={`w-full p-3 border text-black dark:text-white rounded-2xl h-20 transition-all ${
                        isScheduledMode 
                          ? 'bg-zinc-150/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                      }`}
                      placeholder={isScheduledMode ? "(Chỉ có thể nhập nhận xét khi thiết lập Trạng thái Hoàn thành)" : "Hải có tư duy ép bóng tốt. Đề xuất hôm sau dạy quả Roll xoáy mượt."}
                      value={newSession?.coachFeedbackVI || ''}
                      onChange={(e) => setNewSession({ ...newSession, coachFeedbackVI: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-zinc-400">
                      Coach Feedback {isScheduledMode && "🔒"}
                    </label>
                    <textarea
                      disabled={isScheduledMode}
                      className={`w-full p-3 border text-black dark:text-white rounded-2xl h-20 transition-all ${
                        isScheduledMode 
                          ? 'bg-zinc-150/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                      }`}
                      placeholder={isScheduledMode ? "(Auto-translate updates after typing Vietnamese)" : "Excellent pacing. Suggest next lesson cover deep backhand dinks."}
                      value={newSession?.coachFeedbackEN || ''}
                      onChange={(e) => setNewSession({ ...newSession, coachFeedbackEN: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end text-xs font-bold pt-2">
                  {editingSessionId ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSession(null);
                          setEditingSessionId(null);
                        }}
                        className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                      >
                        {lang === 'vi' ? 'Huỷ chỉnh sửa' : 'Cancel Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSaveSession(e, 'Completed')}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg cursor-pointer transition-all font-black"
                      >
                        {lang === 'vi' ? 'Đánh giá' : 'Evaluate'}
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
                        className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
                      >
                        {lang === 'vi' ? 'Clear form' : 'Clear form'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSaveSession(e, 'Scheduled')}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        {lang === 'vi' ? 'Lên lịch' : 'Schedule'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSaveSession(e, 'Completed')}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg cursor-pointer transition-all"
                      >
                        {lang === 'vi' ? 'Đánh giá' : 'Evaluate'}
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
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-zinc-150 dark:border-zinc-800">
          <div className="space-y-1">
            <h3 className="text-base font-black text-red-600 text-red-600 uppercase tracking-widest flex items-center gap-2 animate-pulse">
              <Calendar className="w-5 h-5 flex-shrink-0 text-red-600" />
              {lang === 'vi' ? 'NHẬT KÝ TẬP' : 'TRAINING LOG'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-wide">
              {t.analyzeSkills}
            </p>
          </div>
          <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl font-mono">
            {filteredSessions.length} {lang === 'vi' ? 'buổi' : 'sessions'}
          </span>
        </div>

        {/* SPECIALIZED SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === 'vi' ? "Tìm theo tên học viên hoặc giáo án..." : "Search by student name or lesson plan..."}
              value={sessionSearchQuery}
              onChange={(e) => setSessionSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 font-sans"
            />
          </div>
          <div className="relative flex-1 min-w-0">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
            <input
              type="date"
              value={sessionDateFilter}
              onChange={(e) => setSessionDateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 font-sans [color-scheme:light] dark:[color-scheme:dark]"
            />
            {sessionDateFilter && (
              <button
                type="button"
                onClick={() => setSessionDateFilter('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-zinc-800 w-5 h-5 flex items-center justify-center rounded-full cursor-pointer text-xs leading-none z-10"
                aria-label={lang === 'vi' ? 'Xoá ngày' : 'Clear date'}
              >
                ✕
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
                className={`p-3.5 sm:p-4 bg-zinc-100/30 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-900 rounded-2xl relative overflow-hidden transition-all text-xs ${
                  role === 'coach' 
                    ? 'cursor-pointer hover:border-red-500 hover:ring-2 hover:ring-red-500/15'
                    : 'hover:border-zinc-200 dark:hover:border-zinc-800'
                }`}
              >
                {/* Status badge - top right corner */}
                <span className={`absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  sess.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {sess.status === 'Completed' ? "Completed" : "Scheduled"}
                </span>

                <div className="flex items-start gap-3 pr-14">
                  {student && (
                    <img
                      src={student.avatar}
                      alt="student avatar snippet"
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-red-500/40 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-black text-zinc-800 dark:text-white block truncate">{student?.name || 'Unknown Student'}</span>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400 font-mono">{student?.level}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-red-500 uppercase mt-1 leading-tight">{sess.title}</h4>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-400 mt-2.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {(() => { const d = sess.date?.split('-'); return d ? `${d[2]}/${d[1]}/${d[0]}` : sess.date; })()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-[11px]">⏱</span> {sess.durationMin} min
                  </span>
                  {sess.location && (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-zinc-400">📍</span> {sess.location}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-200 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">{lang === 'vi' ? 'HLV PROT NHẬN XÉT' : 'COACH PROT NOTES'}:</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                      " {lang === 'vi' ? sess.coachFeedbackVI : sess.coachFeedbackEN} "
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">{lang === 'vi' ? 'Chấm điểm kỹ năng thực chiến:' : 'Live Skill Ratings:'}</span>
                    {Object.keys(sess.skillScores).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(sess.skillScores).map(([key, value]) => (
                          <span key={key} className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-lg font-extrabold">
                            {key}: {value}/5
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400">{lang === 'vi' ? 'Chưa xếp hạng điểm số buổi này.' : 'No skill ratings yet for this session.'}</p>
                    )}
                  </div>

                </div>

                {sess.notes && (role === 'coach' || sess.isPublic) && (
                  <div className="mt-3.5 bg-red-500/5 p-3 rounded-xl text-xs flex items-start gap-2 border border-red-500/10">
                    <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[10px] font-mono text-red-500 uppercase block">{lang === 'vi' ? 'HLV Ghi chú thực thi giáo án:' : 'COACH Execution Internal Note:'}</strong>
                      <p className="text-zinc-550 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">{sess.notes}</p>
                    </div>
                  </div>
                )}

                {role === 'coach' && (
                  <div className="mt-4 pt-2 border-t border-zinc-150 dark:border-zinc-850 flex justify-between items-center text-[10px]">
                    <span className="text-red-600 dark:text-red-400 font-extrabold animate-pulse">
                      👉 {lang === 'vi' ? "Nhấp vào khung này để đánh giá & chấm điểm!" : "Click this card to evaluate & grade!"}
                    </span>
                    <span>{lang === 'vi' ? 'Trạng thái hiển thị:' : 'Visibility:'} <strong className="text-red-500">{sess.isPublic ? (lang === 'vi' ? 'Công khai' : 'Public in card') : (lang === 'vi' ? 'HLV riêng tư' : 'Private Coach only')}</strong></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t.deleteConfirm)) handleDeleteSession(sess.id);
                      }}
                      className="text-red-400 hover:text-red-600 font-bold transition-all cursor-pointer flex items-center gap-1"
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
  );
};

export default SessionsTab;
