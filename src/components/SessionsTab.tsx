import React from 'react';
import { PlusCircle, Calendar, Trash2, Info } from 'lucide-react';
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
}) => {
  return (
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
                    <span className="text-[10px] text-zinc-405 uppercase font-mono block">HLV PROT NHẬN XÉT:</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
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
  );
};

export default SessionsTab;
