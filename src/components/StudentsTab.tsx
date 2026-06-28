import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  User,
  Edit2,
  Trash2,
  Upload,
  Activity,
  Star,
  TrendingUp,
  Info,
  Calendar,
} from 'lucide-react';
import { Student, CurriculumSkill, LessonPlan, Session } from '../types';
import { LanguageKey } from '../translations';
import RadarChart from './RadarChart';

interface StudentsTabProps {
  t: Record<string, string>;
  lang: LanguageKey;
  role: 'coach' | 'student';
  filteredStudents: Student[];
  activeStudent: Student | null;
  editingStudent: Student | null;
  setEditingStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  getAverageRating: (student: Student) => number;
  getStrongestSkills: (student: Student) => { name: string; score: number }[];
  getNeedImprovementSkills: (student: Student) => { name: string; score: number }[];
  handleSaveStudent: (e: React.FormEvent) => void;
  handleDeleteStudent: (id: string) => void;
  handleDirectSkillRate: (studentId: string, skillName: string, grade: number) => void;
  handleUpdateStudentAvatar: () => void;
  handleSaveLegend: () => void;
  customLegendNotes: string;
  setCustomLegendNotes: React.Dispatch<React.SetStateAction<string>>;
  isEditingStudentAvatar: boolean;
  setIsEditingStudentAvatar: React.Dispatch<React.SetStateAction<boolean>>;
  tempStudentAvatar: string;
  setTempStudentAvatar: React.Dispatch<React.SetStateAction<string>>;
  setSelectedStudentId: (id: string) => void;
  setSelectedSkillForHistory: (skill: CurriculumSkill) => void;
  showToast: (msg: string) => void;
  skillsList: CurriculumSkill[];
  sessions: Session[];
  lessonPlans: LessonPlan[];
  compressImage: (dataUrl: string, width: number, height: number, quality: number) => Promise<string>;
  translateViToEn?: (text: string) => Promise<string | null>;
}

/** Flag emoji by nationality */
const FLAG_MAP: Record<string, string> = {
  'Việt Nam': '🇻🇳',
  'Mỹ': '🇺🇸',
  'Hàn Quốc': '🇰🇷',
  'Nhật Bản': '🇯🇵',
  'Úc': '🇦🇺',
  'Đức': '🇩🇪',
  'Đài Loan': '🇹🇼',
  'Singapore': '🇸🇬',
  'Malaysia': '🇲🇾',
  'Thái Lan': '🇹🇭',
};

/** Quốc tịch // Nationality — tên đầy đủ song ngữ */
const NATION_NAME_MAP: Record<string, { vi: string; en: string }> = {
  'Việt Nam': { vi: 'Việt Nam', en: 'Vietnam' },
  'Mỹ': { vi: 'Mỹ', en: 'USA' },
  'Hàn Quốc': { vi: 'Hàn Quốc', en: 'South Korea' },
  'Nhật Bản': { vi: 'Nhật Bản', en: 'Japan' },
  'Úc': { vi: 'Úc', en: 'Australia' },
  'Đức': { vi: 'Đức', en: 'Germany' },
  'Đài Loan': { vi: 'Đài Loan', en: 'Taiwan' },
  'Singapore': { vi: 'Singapore', en: 'Singapore' },
  'Malaysia': { vi: 'Malaysia', en: 'Malaysia' },
  'Thái Lan': { vi: 'Thái Lan', en: 'Thailand' },
};

function formatDate(d: string): string {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  t,
  lang,
  role,
  filteredStudents,
  activeStudent,
  editingStudent,
  setEditingStudent,
  getAverageRating,
  getStrongestSkills,
  getNeedImprovementSkills,
  handleSaveStudent,
  handleDeleteStudent,
  handleDirectSkillRate,
  handleUpdateStudentAvatar,
  handleSaveLegend,
  customLegendNotes,
  setCustomLegendNotes,
  isEditingStudentAvatar,
  setIsEditingStudentAvatar,
  tempStudentAvatar,
  setTempStudentAvatar,
  setSelectedStudentId,
  setSelectedSkillForHistory,
  showToast,
  skillsList,
  sessions,
  lessonPlans,
  compressImage,
  translateViToEn,
}) => {
  // ── Auto-translate targetGoal & notes khi chuyển sang tiếng Anh ──
  const [enTargetGoal, setEnTargetGoal] = useState('');
  const [enNotes, setEnNotes] = useState('');

  useEffect(() => {
    if (lang === 'en' && translateViToEn && activeStudent) {
      // translate targetGoal
      if (activeStudent.targetGoal && activeStudent.targetGoal !== "Chưa thiết lập mục tiêu huấn luyện cụ thể.") {
        const t1 = setTimeout(async () => {
          const trans = await translateViToEn(activeStudent.targetGoal);
          if (trans) setEnTargetGoal(trans);
        }, 300);
        const t2 = setTimeout(async () => {
          const trans = await translateViToEn(activeStudent.notes);
          if (trans) setEnNotes(trans);
        }, 600);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    } else {
      setEnTargetGoal('');
      setEnNotes('');
    }
  }, [lang, activeStudent?.id, activeStudent?.targetGoal, activeStudent?.notes, translateViToEn]);

  return (
    <div className="space-y-5 md:space-y-8 animate-fadeIn" id="tab-students-panel">

      {/* INSTRUCTOR PANEL TOOLS */}
      {role === 'coach' && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setEditingStudent({ name: '', targetGoal: '', notes: '', phone: '', email: '', level: '1.0-2.0', isPublic: true, nationality: 'Việt Nam', dominantHand: 'Phải', joiningDate: new Date().toISOString().split('T')[0] } as Student)}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.addStudent}
          </button>
        </div>
      )}

      {/* EXPANDED STUDENT EDIT FORM */}
      {editingStudent && (
        <form onSubmit={handleSaveStudent} className="bg-white dark:bg-zinc-900 border-2 border-red-500 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-5 h-5" />
            {editingStudent.id ? t.editStudent : t.addStudent}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-zinc-400">Avatar</label>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  {editingStudent.avatar ? (
                    <img
                      src={editingStudent.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={editingStudent.avatar || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, avatar: e.target.value })}
                    className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-400 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {lang === 'vi' ? 'Tải ảnh từ máy' : 'Upload from device'}
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
                              compressImage(reader.result, 200, 200, 0.7).then((dataUrl) => {
                                setEditingStudent({ ...editingStudent, avatar: dataUrl });
                                showToast(lang === 'vi' ? 'Đã tải ảnh lên!' : 'Image uploaded!');
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ⬇ Vi / En compatible fields — one set only, auto-translated */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400">Name / Tên học viên *</label>
              <input
                type="text"
                required
                value={editingStudent.name || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white"
                placeholder="e.g. Nguyễn Minh Hải"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400">DUPR Simplified Level</label>
              <select
                value={editingStudent.level || '1.0-2.0'}
                onChange={(e) => setEditingStudent({ ...editingStudent, level: e.target.value as any })}
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white"
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
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white"
                placeholder="09..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400">Email</label>
              <input
                type="email"
                value={editingStudent.email || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white"
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
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white focus:outline-none"
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
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white focus:outline-none"
              >
                <option value="Phải">🏓 {lang === 'vi' ? 'Phải' : 'Right'}</option>
                <option value="Trái">🏓 {lang === 'vi' ? 'Trái' : 'Left'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400">Ngày gia nhập / Joined Date</label>
              <input
                type="date"
                value={editingStudent.joiningDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEditingStudent({ ...editingStudent, joiningDate: e.target.value })}
                className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400">Target Goal / Mục tiêu học tập</label>
            <input
              type="text"
              value={editingStudent.targetGoal || ''}
              onChange={(e) => setEditingStudent({ ...editingStudent, targetGoal: e.target.value })}
              className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-black dark:text-white"
              placeholder="e.g. Nâng lên trình 3.5 thi đấu kết hợp dink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400">Coach Secret Dossier / Ghi chú tâm huyết của Thầy</label>
            <textarea
              value={editingStudent.notes || ''}
              onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
              className="w-full text-sm p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl h-24 text-black dark:text-white"
              placeholder="Ghi nhận lỗi bộ pháp chân, tâm lý hay có nôn nóng..."
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={editingStudent.isPublic ?? true}
                onChange={(e) => setEditingStudent({ ...editingStudent, isPublic: e.target.checked })}
                className="rounded border-zinc-500 bg-zinc-950 text-red-500 focus:ring-red-500 w-4 h-4"
              />
              <span>{t.publicState} ({editingStudent.isPublic ? t.statusPublic : t.statusPrivate})</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
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
                  ? 'bg-red-500/10 border-red-500 text-red-500 ring-2 ring-red-500/20'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-red-400 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <img src={s.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-300 dark:border-zinc-800" referrerPolicy="no-referrer" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black truncate max-w-[110px]">{s.name}</span>
                  {!s.isPublic && (
                    <span className="text-[7px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-1 py-0.5 rounded uppercase">Private</span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">Lv {s.level}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* REDESIGNED STUDENT PROFILE CARD */}
      {activeStudent ? (
        <div className="space-y-6">

          {/* ─── HEADER CARD ─── 3 zones + progress + rating + coach buttons */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">

            {/* ZONE 1: Avatar + 3 info lines side by side */}
            <div className="flex flex-row items-center gap-4 md:gap-6">

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative">
                  <img
                    src={activeStudent.avatar}
                    alt="student card avatar"
                    className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-red-500 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-red-600 text-white font-mono text-center font-black rounded-lg px-2 py-0.5 text-xs shadow">
                    LV {activeStudent.level}
                  </div>
                </div>
                {/* Avatar change (coach only) */}
                {role === 'coach' && (
                  <div className="mt-1 flex flex-col items-center">
                    {isEditingStudentAvatar ? (
                      <div className="flex flex-col gap-1.5 w-44 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <span className="text-[8px] font-bold text-zinc-400 block">Dán link ảnh:</span>
                        <input
                          type="text"
                          value={tempStudentAvatar}
                          onChange={(e) => setTempStudentAvatar(e.target.value)}
                          placeholder="Dán URL ảnh (URL)..."
                          className="text-[9px] p-1 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none w-full"
                        />
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800 my-0.5"></div>
                        <span className="text-[8px] font-bold text-zinc-400 block">Hoặc tải file từ máy:</span>
                        <label className="w-full flex items-center justify-center p-1 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded cursor-pointer hover:border-red-500 transition-all text-center">
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
                            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[9px] py-0.5 rounded font-bold cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setTempStudentAvatar(activeStudent.avatar); setIsEditingStudentAvatar(true); }}
                        className="text-[10px] text-red-500 hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        Thay đổi ảnh
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: 3 stacked lines */}
              <div className="flex-1 space-y-3 text-left">

                {/* Line 1: Name */}
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {activeStudent.name}
                </h2>
                {/* Line 2: Nationality — flag + full name */}
                <div className="flex items-center justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-base font-black leading-none">
                    {FLAG_MAP[activeStudent.nationality || 'Việt Nam'] || '🌏'}
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                      {NATION_NAME_MAP[activeStudent.nationality || 'Việt Nam']?.[lang as 'vi' | 'en'] || activeStudent.nationality}
                    </span>
                  </span>
                </div>
                {/* Line 3: Dominant Hand — fully translated */}
                <div className="flex items-center justify-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-black">
                    🏓 {lang === 'vi'
                      ? `Tay thuận: ${activeStudent.dominantHand || 'Phải'}`
                      : activeStudent.dominantHand === 'Phải' ? 'Right-Hand' : 'Left-Hand'}
                  </span>
                </div>
              </div>
            </div>

            {/* ZONE 2: Joined + Phone */}
            <div className="mt-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[#666666] dark:text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#666666] dark:text-zinc-400" />
                  <span>{lang === 'vi' ? 'Tham gia:' : 'Joined:'}</span>
                  <span>{formatDate(activeStudent.joiningDate)}</span>
                </span>
                {activeStudent.phone && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <span>📞</span>
                    <span>{activeStudent.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ZONE 3: Email */}
            {activeStudent.email && (
              <div className="mt-1.5 text-xs text-[#666666] dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                <span>✉</span>
                <span>{activeStudent.email}</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="pt-3 mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase text-[#666666] dark:text-zinc-400 font-semibold">
                  {t.progressBar}
                </span>
                {(() => {
                  const avg = getAverageRating(activeStudent);
                  const pct = Math.min(100, Math.round((avg / 5.0) * 100));
                  return (
                    <span className="text-xs font-mono font-black text-red-500">{pct}%</span>
                  );
                })()}
              </div>
              <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                {(() => {
                  const avg = getAverageRating(activeStudent);
                  const pct = Math.min(100, Math.round((avg / 5.0) * 100));
                  return (
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  );
                })()}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-[#666666] dark:text-zinc-400 font-semibold">
                  {t.studentRating}
                </span>
                <span className="text-lg font-semibold text-red-500">
                  {getAverageRating(activeStudent)}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const score = getAverageRating(activeStudent);
                  return (
                    <Star
                      key={idx}
                      className={`w-5 h-5 ${
                        score >= idx + 1
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-zinc-300 dark:fill-zinc-700 text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Coach edit/delete — absolute top-right of card */}
            {role === 'coach' && (
              <div className="absolute top-4 right-4 flex gap-1.5">
                <button
                  onClick={() => setEditingStudent(activeStudent)}
                  className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white p-2 rounded-xl transition-colors cursor-pointer"
                  title={t.editStudent}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteStudent(activeStudent.id)}
                  className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-red-950 text-red-600 dark:text-red-500 p-2 rounded-xl transition-colors cursor-pointer"
                  title={t.deleteStudent}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* DETAILED STATS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT: ATTRIBUTES & RADAR CHART */}
            <div className="lg:col-span-8 space-y-6">

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h4 className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-red-600" />
                    {t.attributes}
                  </h4>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    {lang === 'vi' ? "16 Kỹ năng cơ bản" : "16 Core Skills"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <RadarChart skillsList={skillsList} studentSkills={activeStudent.skills} size={280} />

                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar text-xs">
                    {[...skillsList].sort((a, b) => {
                      const order = [
                        'Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop',
                        'Reset', 'Flick', 'Roll', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
                      ];
                      const idxA = order.indexOf(a.name);
                      const idxB = order.indexOf(b.name);
                      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
                    }).map((skill) => {
                      const score = activeStudent.skills[skill.name] || 1;

                      let scoreColor = 'bg-stone-500/10 text-stone-400 border border-stone-500/20';
                      if (score === 1) scoreColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                      if (score === 2) scoreColor = 'bg-stone-500/10 text-stone-400 border border-stone-500/20';
                      if (score === 3) scoreColor = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
                      if (score === 4) scoreColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                      if (score === 5) scoreColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

                      return (
                        <div key={skill.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                          <div
                            onClick={() => setSelectedSkillForHistory(skill)}
                            className="flex-1 pr-3 cursor-pointer group hover:opacity-85 transition-opacity"
                            title="Xem lịch sử đánh giá kỹ năng này"
                          >
                            <div className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-red-500 flex items-center gap-1">
                              <span>{skill.name}</span>
                              <TrendingUp className="w-3 h-3 text-zinc-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <div className="text-[10px] text-zinc-500 font-sans leading-relaxed">
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
                                        ? 'bg-red-600 text-white font-extrabold'
                                        : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
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

              </div>

            {/* RIGHT PANEL DATA WRAPPERS */}
            <div className="lg:col-span-4 space-y-6">

              {/* STRONGEST */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
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
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-red-500" />
                  {t.needImprovement}
                </h4>
                {getNeedImprovementSkills(activeStudent).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {getNeedImprovementSkills(activeStudent).map(sk => (
                      <span key={sk.name} className="px-2.5 py-1 text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/25 rounded-lg">
                        ⚠️ {sk.name} ({sk.score}/5)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Các chỉ số rèn luyện đều đạt mức trung bình trở lên.</p>
                )}
              </div>

              {/* TARGETS */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase text-red-500 tracking-wider">🎯 {lang === 'vi' ? 'Mục tiêu' : 'Target'}</h4>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {lang === 'en' && enTargetGoal
                    ? enTargetGoal
                    : (activeStudent.targetGoal || (lang === 'vi' ? "Chưa thiết lập mục tiêu huấn luyện cụ thể." : "Training target not set yet."))}
                </p>
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <div className="text-[10px] uppercase font-mono text-zinc-400 mb-1">{lang === 'vi' ? 'HLV PROT NHẬN XÉT' : 'COACH PROT NOTES'}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic leading-relaxed h-[130px] overflow-y-auto pr-1">
                    {role === 'coach' || activeStudent.isPublic
                      ? (lang === 'en' && enNotes ? enNotes : activeStudent.notes)
                      : (lang === 'vi' ? "🔒 Ghi chú mật HLV." : "🔒 Coach private notes.")}
                  </p>
                </div>
              </div>

              {/* HISTORY LESSON LOGS */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
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
                        <div key={sess.id} className="text-xs bg-zinc-100/50 dark:bg-zinc-800/50 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative">
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

                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 italic leading-relaxed border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-1.5">
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
  );
};

export default StudentsTab;
