import React from 'react';
import { Layers, BookOpen, PlusCircle, Plus } from 'lucide-react';
import { CurriculumSkill, LessonPlan } from '../types';

interface CurriculumTabProps {
  t: Record<string, string>;
  lang: string;
  role: 'coach' | 'student';
  skillsList: CurriculumSkill[];
  lessonPlans: LessonPlan[];
  filteredPlans: LessonPlan[];
  newSkill: Partial<CurriculumSkill> | null;
  setNewSkill: React.Dispatch<React.SetStateAction<Partial<CurriculumSkill> | null>>;
  editingPlan: LessonPlan | null;
  setEditingPlan: React.Dispatch<React.SetStateAction<LessonPlan | null>>;
  handleSaveSkill: (e: React.FormEvent) => void;
  handleSavePlan: (e: React.FormEvent) => void;
  syncLessonPlans: (plans: LessonPlan[]) => void;
  showToast: (msg: string) => void;
}

const CurriculumTab: React.FC<CurriculumTabProps> = ({
  t,
  lang,
  role,
  skillsList,
  lessonPlans,
  filteredPlans,
  newSkill,
  setNewSkill,
  editingPlan,
  setEditingPlan,
  handleSaveSkill,
  handleSavePlan,
  syncLessonPlans,
  showToast,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn" id="tab-curriculum-panel">
      
      {/* ADD SKILL FORM BLOCK */}
      {role === 'coach' && !newSkill && (
        <button
          onClick={() => setNewSkill({ name: '', category: 'Basics', descriptionVI: '', descriptionEN: '' })}
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md cursor-pointer transition-colors"
        >
          + Bổ sung Kỹ năng mới vào Giáo án
        </button>
      )}

      {newSkill && (
        <form onSubmit={handleSaveSkill} className="bg-white dark:bg-zinc-900 border-2 border-red-500 rounded-3xl p-6 shadow-xl space-y-3">
          <h4 className="text-sm font-black text-red-500 uppercase tracking-widest font-mono">Thêm Kỹ Năng Mới</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-bold">Skill Name (EN) *</label>
              <input
                type="text"
                required
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl focus:ring-1 focus:ring-red-500"
                placeholder="e.g. Backhand Drive"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-bold">Category / Nhóm kỹ năng</label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl"
              >
                <option value="BASIC">BASIC</option>
                <option value="ADVANCED">ADVANCED</option>
                <option value="TACTICS">TACTICS</option>
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
                className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 font-bold">English Description</label>
              <input
                type="text"
                value={newSkill.descriptionEN}
                onChange={(e) => setNewSkill({ ...newSkill, descriptionEN: e.target.value })}
                className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-xl focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
            <button type="button" onClick={() => setNewSkill(null)} className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg cursor-pointer">Hủy</button>
            <button type="submit" className="px-5 py-1.5 bg-red-600 text-white rounded-lg cursor-pointer">Lưu lại</button>
          </div>
        </form>
      )}

      {/* CURRICULUMS EDUCATION BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: 16 CORE SKILLS */}
        <div className="lg:col-span-7 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-5 h-5 animate-pulse" />
            {lang === 'vi' ? 'GIÁO ÁN 16 KỸ NĂNG HUẤN LUYỆN CHUẨN HOÁ' : '16 SKILL STANDARD CURRICULUM'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {lang === 'vi'
              ? 'Học viên tập luyện với HLV Prot được đánh giá sát sao, tự tin theo đuổi giáo trình bao quát đầy đủ cả kỹ năng lẫn tư duy thực chiến đối kháng dưới áp lực.'
              : 'Students training with Coach Prot receive meticulous evaluation, confidently following a comprehensive curriculum covering both skills and competitive tactical thinking under pressure.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {[...skillsList].sort((a, b) => {
              const order = [
                'Forehand', 'Backhand', 'Serve', 'Return', 'Block', 'Dink', 'Volley', 'Drop',
                'Reset', 'Flick', 'Roll', 'Lob', 'Smash', 'Footwork', 'Transition Zone', 'Strategy'
              ];
              const idxA = order.indexOf(a.name);
              const idxB = order.indexOf(b.name);
              return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
            }).map((skill, index) => {
              return (
                <div key={skill.id} className="p-3 bg-zinc-100/40 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-900 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Skill #{index + 1}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      (skill.category === 'BASIC' || skill.category === 'BASICS') ? 'bg-red-500/10 text-red-500' :
                      (skill.category === 'ADVANCED' || skill.category === 'ADVANCEDS') ? 'bg-amber-500/10 text-amber-500' :
                      skill.category === 'TACTICS' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>{skill.category}</span>
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
          
          <div className="border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <h3 className="text-sm font-black text-red-600 text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-red-600" />
                DANH SÁCH GIÁO ÁN KHÓA HỌC
              </h3>
              
              {role === 'coach' && (
                <button
                  onClick={() => setEditingPlan({ titleVI: '', titleEN: '', descriptionVI: '', descriptionEN: '', skillsFocused: [], durationMin: 60, isPublic: true })}
                  className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-1.5 rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-white cursor-pointer"
                  title="Tạo giáo án mới"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {editingPlan && (
              <form onSubmit={handleSavePlan} className="bg-zinc-150/50 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-zinc-450">Tên giáo án (VI) *</label>
                    <input
                      type="text"
                      required
                      value={editingPlan.titleVI || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, titleVI: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-455">Lesson Plan Title (EN)</label>
                    <input
                      type="text"
                      value={editingPlan.titleEN || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, titleEN: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-zinc-455">Mô tả chi tiết (VI)</label>
                    <textarea
                      value={editingPlan.descriptionVI || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, descriptionVI: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg h-14"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-455">Description Detail (EN)</label>
                    <textarea
                      value={editingPlan.descriptionEN || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, descriptionEN: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg h-14"
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
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-455">Trạng thái hiển thị</label>
                    <select
                      value={editingPlan.isPublic ? 'true' : 'false'}
                      onChange={(e) => setEditingPlan({ ...editingPlan, isPublic: e.target.value === 'true' })}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-black dark:text-white rounded-lg"
                    >
                      <option value="true">Công khai cho học viên</option>
                      <option value="false">Riêng tư bí mật</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-450 font-bold block">Skills Targeted / Kỹ năng tiêu điểm (Lựa chọn dán)</label>
                  <div className="flex flex-wrap gap-1.5 h-20 overflow-y-auto bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 p-2 rounded-lg text-[10px] text-zinc-900 dark:text-white">
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
                            isChosen ? 'bg-red-600 text-white font-bold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {sk.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" onClick={() => setEditingPlan(null)} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="px-3.5 py-1 bg-red-600 text-white font-bold rounded-lg cursor-pointer">{t.save}</button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {filteredPlans.map(plan => {
                return (
                  <div key={plan.id} className="p-4 bg-zinc-100/30 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-900 rounded-2xl relative">
                    <span className="absolute top-3 right-3 text-[9px] font-mono bg-zinc-250 dark:bg-zinc-800 text-red-500 border border-zinc-150 dark:border-zinc-800 px-2 py-0.5 rounded-full font-bold">
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
                          <span key={sk} className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {role === 'coach' && (
                      <div className="flex items-center justify-end gap-2.5 mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-900 text-[10px]">
                        <span>Status: <strong className="text-red-500">{plan.isPublic ? "Public" : "Private"}</strong></span>
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="text-zinc-500 hover:text-red-500 cursor-pointer"
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
                          className="text-red-500 hover:underline cursor-pointer"
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
  );
};

export default CurriculumTab;
