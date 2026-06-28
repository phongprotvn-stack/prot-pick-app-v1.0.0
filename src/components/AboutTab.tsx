import { useState, useEffect, useCallback } from 'react';
import { Flame, Edit2, Upload, Youtube, Video, Award, PlusCircle, Plus, X, Lock } from 'lucide-react';
import { LanguageKey } from '../translations';
import { CoachProfile, Student } from '../types';

interface AboutTabProps {
  t: Record<string, string>;
  lang: LanguageKey;
  role: 'coach' | 'student';
  coach: CoachProfile & { youtubeYoutIds: string[]; photos: string[] };
  isEditingCoachAvatar: boolean;
  setIsEditingCoachAvatar: (v: boolean) => void;
  tempCoachAvatar: string;
  setTempCoachAvatar: (v: string) => void;
  handleUpdateCoachAvatar: () => void;
  newMediaType: 'video' | 'photo' | 'local_photo';
  setNewMediaType: (v: 'video' | 'photo' | 'local_photo') => void;
  newMediaUrl: string;
  setNewMediaUrl: (v: string) => void;
  handleAddMedia: () => void;
  compressImage: (base64: string, w?: number, h?: number, q?: number) => Promise<string>;
  showToast: (msg: string) => void;
  setCurrentPinValueForChange: (v: string) => void;
  setNewPinValue1: (v: string) => void;
  setNewPinValue2: (v: string) => void;
  setPinModalError: (v: string) => void;
  setIsChangingPin: (v: boolean) => void;
  setIsPinModalOpen: (v: boolean) => void;
  syncCoach: (coach: any) => void;
  translateViToEn: (text: string) => Promise<string>;
}

export default function AboutTab({
  t, lang, role, coach, isEditingCoachAvatar, setIsEditingCoachAvatar,
  tempCoachAvatar, setTempCoachAvatar, handleUpdateCoachAvatar,
  newMediaType, setNewMediaType, newMediaUrl, setNewMediaUrl,
  handleAddMedia, compressImage, showToast,
  setCurrentPinValueForChange, setNewPinValue1, setNewPinValue2,
  setPinModalError, setIsChangingPin, setIsPinModalOpen, syncCoach, translateViToEn
}: AboutTabProps) {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAboutVI, setTempAboutVI] = useState(coach.aboutVI);
  const [tempAboutEN, setTempAboutEN] = useState(coach.aboutEN);
  const [isEditingCourts, setIsEditingCourts] = useState(false);
  const [tempCourts, setTempCourts] = useState(coach.courts || '');
  const [enCourts, setEnCourts] = useState('');

  const [isEditingCourses, setIsEditingCourses] = useState(false);
  const [tempCoursesVI, setTempCoursesVI] = useState<{title:string;desc:string;price:string}[]>(coach.coursesVI ? [...coach.coursesVI] : []);
  const [isEditingSpecials, setIsEditingSpecials] = useState(false);
  const [tempSpecialsVI, setTempSpecialsVI] = useState<string[]>(coach.courseSpecialsVI ? [...coach.courseSpecialsVI] : []);
  const [exRate, setExRate] = useState<number>(25400); // VND/USD default
  const [enCourses, setEnCourses] = useState<{title:string;desc:string;price:string}[]>([]);

  // Fetch VND/USD exchange rate
  useEffect(() => {
    const controller = new AbortController();
    fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal })
      .then(r => r.json()).then(d => { if (d?.rates?.VND) setExRate(d.rates.VND); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Auto-translate courses VI→EN when lang switches
  useEffect(() => {
    if (lang !== 'en' || !tempCoursesVI.length) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const translated = await Promise.all(tempCoursesVI.map(async (c) => ({
        title: c.title ? await translateViToEn(c.title) : '',
        desc: c.desc ? await translateViToEn(c.desc) : '',
        price: exRate > 0 ? `${Math.round(parseInt(c.price?.replace(/[^0-9]/g,'')||'0')/exRate)} USD` : c.price,
      })));
      if (!cancelled) setEnCourses(translated);
    }, 800);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [lang, tempCoursesVI, exRate]);

  // Auto-translate courts to English
  useEffect(() => {
    if (!coach.courts || !coach.courts.trim()) { setEnCourts(''); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const trans = await translateViToEn(coach.courts || '');
      if (!cancelled) setEnCourts(trans || coach.courts || '');
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [coach.courts, lang]);

  return (
    <div className="space-y-8 animate-fadeIn" id="tab-about-panel">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: COACH RESUME */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={coach.avatar}
                alt="phongprot avatar display"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-red-500 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-2 bg-red-600 text-white p-2 rounded-full shadow animate-pulse">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            {/* Mode to change Coach Avatar URL */}
            {role === 'coach' && (
              <div className="flex flex-col items-center">
                {isEditingCoachAvatar ? (
                  <div className="flex flex-col gap-2 w-full max-w-xs justify-center items-center mt-1 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
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
                    <label className="w-full flex flex-col items-center justify-center p-2 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:border-red-500 transition-all text-center">
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
                                showToast(lang === 'vi' ? 'Đã nạp file ảnh cục bộ!' : 'Local image file loaded!');
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
                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[10px] py-1 rounded-lg font-black cursor-pointer transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setTempCoachAvatar(coach.avatar); setIsEditingCoachAvatar(true); }}
                    className="text-[10px] text-red-500 hover:text-red-400 font-bold flex items-center justify-center gap-1 cursor-pointer mt-1"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    Thay đổi ảnh HLV
                  </button>
                )}
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tight">{lang === 'vi' ? 'HLV PROT' : 'COACH PROT'}</h3>
              <span className="font-mono text-xs text-red-500 font-extrabold uppercase tracking-wide">
                ⚡ {lang === 'vi' ? 'CHIẾN ĐẤU KHÔNG NGỪNG NGHỈ' : 'COMBAT NEVER ENDS'}
              </span>
            </div>

            {role === 'coach' && isEditingAbout ? (
              <div className="space-y-2">
                <textarea value={tempAboutVI} onChange={e => setTempAboutVI(e.target.value)} rows={4} placeholder="Tiếng Việt" className="w-full p-2.5 text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none" />
                <textarea value={tempAboutEN} onChange={e => setTempAboutEN(e.target.value)} rows={4} placeholder="English" className="w-full p-2.5 text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none" />
                <div className="flex gap-2">
                  <button onClick={() => { syncCoach({...coach, aboutVI: tempAboutVI, aboutEN: tempAboutEN}); setIsEditingAbout(false); showToast(lang === 'vi' ? 'Đã lưu!' : 'Saved!'); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1.5 rounded-lg font-black cursor-pointer transition-colors shadow-xs">✅ {lang === 'vi' ? 'Lưu' : 'Save'}</button>
                  <button onClick={() => setIsEditingAbout(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[10px] py-1.5 rounded-lg font-black cursor-pointer transition-colors">{lang === 'vi' ? 'Hủy' : 'Cancel'}</button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans text-justify bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-900">
                  {lang === 'vi' ? coach.aboutVI : coach.aboutEN}
                </p>
                {role === 'coach' && (
                  <button onClick={() => { setTempAboutVI(coach.aboutVI); setTempAboutEN(coach.aboutEN); setIsEditingAbout(true); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Edit2 className="w-2.5 h-2.5" />
                    {lang === 'vi' ? 'Sửa' : 'Edit'}
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 text-left space-y-2.5 text-xs border-t border-zinc-150 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>
                  <strong>Youtube:</strong>{' '}
                  <a href="https://www.youtube.com/@phongprot" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 font-bold transition-all hover:underline cursor-pointer">
                    @phongprot
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-zinc-400" />
                <span>
                  <strong>Tiktok:</strong>{' '}
                  <a href="https://www.tiktok.com/@phongprot" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 font-bold transition-all hover:underline cursor-pointer">
                    @phongprot
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Award className="w-4 h-4 text-red-500 shrink-0" />
                {role === 'coach' && isEditingCourts ? (
                                  <>
                                    <strong className="text-nowrap">{lang === 'vi' ? 'Sân tập:' : 'Training Court:'}</strong>
                                    <input type="text" value={tempCourts} onChange={e => setTempCourts(e.target.value)} className="flex-1 min-w-[100px] p-1 text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                                    <button onClick={() => { syncCoach({...coach, courts: tempCourts}); setIsEditingCourts(false); showToast(lang === 'vi' ? 'Đã lưu!' : 'Saved!'); }} className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-0.5 rounded font-bold cursor-pointer">{lang === 'vi' ? 'Lưu' : 'Save'}</button>
                                    <button onClick={() => setIsEditingCourts(false)} className="text-[9px] bg-zinc-600 hover:bg-zinc-500 text-white px-1.5 py-0.5 rounded font-bold cursor-pointer">{lang === 'vi' ? 'Hủy' : 'Cancel'}</button>
                                  </>
                                ) : (
                                  <>
                                    <strong className="text-nowrap">{lang === 'vi' ? 'Sân tập:' : 'Training Court:'}</strong>
                                    <span className="flex-1">{lang === 'vi' ? coach.courts : enCourts}</span>
                    {role === 'coach' && (
                      <button onClick={() => { setTempCourts(coach.courts || ''); setIsEditingCourts(true); }} className="text-[9px] text-red-500 hover:text-red-400 font-bold flex items-center gap-0.5 cursor-pointer transition-colors shrink-0">
                        <Edit2 className="w-2.5 h-2.5" />
                        {lang === 'vi' ? 'Sửa' : 'Edit'}
                      </button>
                    )}
                  </>
                )}
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
                    className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-800 text-zinc-950 dark:text-zinc-200 text-[10px] py-1.5 px-3 rounded-lg font-black tracking-wider uppercase transition-colors border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    🔑 Cài đặt Mã PIN HLV bảo mật
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* RIGHT: COURSE OPTIONS & PLAYABLE MEDIA */}
        <div className="lg:col-span-8 space-y-8">
          <div className="card space-y-5">
            <h3 className="text-base font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-5 h-5 animate-pulse" />
              {lang === 'vi' ? 'CÁC KHÓA HỌC' : 'COURSES'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.aboutCourseIntro}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              {(isEditingCourses
                ? tempCoursesVI
                : (lang === 'vi' ? coach.coursesVI : (enCourses.length ? enCourses : coach.coursesEN))
              )?.map((course: any, i: number) => (
                <div key={i} className="card p-4 bg-zinc-100/30 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-900 rounded-2xl space-y-3 relative flex flex-col justify-between pt-5">
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-pink-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl rounded-tr-2xl z-10 shadow-lg tracking-wider">{lang==='vi'?'HOT PACK':'HOT PACK'}</div>
                  {role === 'coach' && isEditingCourses ? (
                    <div className="space-y-1.5">
                      <input value={course.title||''} onChange={e=>{const n=[...tempCoursesVI];n[i]={...n[i],title:e.target.value};setTempCoursesVI(n);}} placeholder="Tiêu đề khóa học" className="w-full text-[10px] p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50" />
                      <textarea value={course.desc||''} onChange={e=>{const n=[...tempCoursesVI];n[i]={...n[i],desc:e.target.value};setTempCoursesVI(n);}} placeholder="Nội dung khóa học" rows={3} className="w-full text-[10px] p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50" />
                      <div className="flex items-center gap-1">
                        <input value={course.price||''} onChange={e=>{const n=[...tempCoursesVI];n[i]={...n[i],price:e.target.value};setTempCoursesVI(n);}} placeholder="Giá (VND)" className="flex-1 text-[10px] p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50" />
                        <span className="text-[9px] text-zinc-400 font-mono">VND</span>
                      </div>
                      <div className="text-[8px] text-zinc-400 italic">
                        {lang==='en' ? `→ ${Math.round(parseInt(course.price?.replace(/[^0-9]/g,'')||'0')/exRate)} USD` : `→ EN: auto-translate`}
                      </div>
                      <button onClick={()=>{const n=tempCoursesVI.filter((_:any,idx:number)=>idx!==i);setTempCoursesVI(n);}} className="text-[9px] text-red-500 hover:text-red-400 font-bold cursor-pointer">🗑️ {lang==='vi'?'Xóa':'Delete'}</button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-tight line-clamp-2">{course.title}</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{course.desc}</p>
                      </div>
                      <div className="border-t border-zinc-100 dark:border-zinc-900 pt-2 text-[11px] font-mono font-black text-red-500 text-right mt-1.5">{course.price}</div>
                    </>
                  )}
                </div>
              ))}
              {role === 'coach' && isEditingCourses && (
                <button onClick={() => { setTempCoursesVI([...tempCoursesVI, { title: '📝 Khóa mới', desc: 'Mô tả...', price: 'Liên hệ' }]); }} className="p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex items-center justify-center text-xs text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all cursor-pointer">
                  <Plus className="w-4 h-4 mr-1" /> {lang === 'vi' ? 'Thêm khóa học' : 'Add Course'}
                </button>
              )}
            </div>
            {role === 'coach' && (
              <div className="flex gap-2">
                {isEditingCourses ? (
                  <>
                    <button onClick={async () => {
                      const translated = await Promise.all(tempCoursesVI.map(async (c) => ({
                        title: c.title || '',
                        desc: c.desc || '',
                        price: c.price || 'Liên hệ',
                      })));
                      const translatedEN = await Promise.all(tempCoursesVI.map(async (c) => ({
                        title: c.title ? await translateViToEn(c.title) : '',
                        desc: c.desc ? await translateViToEn(c.desc) : '',
                        price: c.price ? `${Math.round(parseInt(c.price.replace(/[^0-9]/g,'')||'0')/exRate)} USD` : 'Contact',
                      })));
                      syncCoach({...coach, coursesVI: translated, coursesEN: translatedEN});
                      setEnCourses(translatedEN);
                      setIsEditingCourses(false);
                      showToast(lang === 'vi' ? 'Đã lưu khóa học!' : 'Courses saved!');
                    }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold cursor-pointer">✅ {lang === 'vi' ? 'Lưu khóa học' : 'Save Courses'}</button>
                    <button onClick={() => { setTempCoursesVI(coach.coursesVI ? [...coach.coursesVI] : []); setEnCourses(coach.coursesEN ? [...coach.coursesEN] : []); setIsEditingCourses(false); }} className="bg-zinc-600 hover:bg-zinc-500 text-white text-[10px] px-3 py-1 rounded-lg font-bold cursor-pointer">{lang === 'vi' ? 'Hủy' : 'Cancel'}</button>
                  </>
                ) : (
                  <button onClick={() => { setTempCoursesVI(coach.coursesVI ? [...coach.coursesVI] : []); setIsEditingCourses(true); }} className="text-[10px] text-red-500 hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer">
                    <Edit2 className="w-3 h-3" /> {lang === 'vi' ? 'Chỉnh sửa khóa học' : 'Edit Courses'}
                  </button>
                )}
              </div>
            )}

            {/* Course Specials (editable by coach) */}
            {role === 'coach' && isEditingSpecials ? (
              <div className="card p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-500 uppercase block">{t.courseSpecial}</span>
                  <button onClick={() => { setIsEditingSpecials(false); }} className="text-[9px] text-zinc-400 hover:text-zinc-300 cursor-pointer"><X className="w-3 h-3" /></button>
                </div>
                {tempSpecialsVI.map((s: string, i: number) => (
                  <div key={i} className="flex gap-1 items-start">
                    <input value={tempSpecialsVI[i]} onChange={e => { const n = [...tempSpecialsVI]; n[i] = e.target.value; setTempSpecialsVI(n); }} placeholder="Đặc quyền (VI)" className="flex-1 text-[10px] p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50" />
                    <button onClick={() => { setTempSpecialsVI(tempSpecialsVI.filter((_: any, idx: number) => idx !== i)); }} className="text-[9px] text-red-400 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => { setTempSpecialsVI([...tempSpecialsVI, '']); }} className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> {lang === 'vi' ? 'Thêm' : 'Add'}</button>
                <div className="flex gap-2 pt-1">
                  <button onClick={async () => {
                    const translatedEN = await Promise.all(tempSpecialsVI.map(s => s ? translateViToEn(s) : Promise.resolve('')));
                    syncCoach({...coach, courseSpecialsVI: tempSpecialsVI, courseSpecialsEN: translatedEN});
                    setIsEditingSpecials(false);
                    showToast(lang === 'vi' ? 'Đã lưu đặc quyền!' : 'Specials saved!');
                  }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold cursor-pointer">✅ {lang === 'vi' ? 'Lưu' : 'Save'}</button>
                  <button onClick={() => { setTempSpecialsVI(coach.courseSpecialsVI ? [...coach.courseSpecialsVI] : []); setIsEditingSpecials(false); }} className="bg-zinc-600 hover:bg-zinc-500 text-white text-[10px] px-3 py-1 rounded-lg font-bold cursor-pointer">{lang === 'vi' ? 'Hủy' : 'Cancel'}</button>
                </div>
              </div>
            ) : (
              <div className="card p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-500 uppercase block">{t.courseSpecial}</span>
                  {role === 'coach' && (
                    <button onClick={() => { setTempSpecialsVI(coach.courseSpecialsVI ? [...coach.courseSpecialsVI] : []); setIsEditingSpecials(true); }} className="text-[9px] text-red-500 hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer">
                      <Edit2 className="w-2.5 h-2.5" /> {lang === 'vi' ? 'Sửa' : 'Edit'}
                    </button>
                  )}
                </div>
                {(lang === 'vi' ? coach.courseSpecialsVI : coach.courseSpecialsEN) && (lang === 'vi' ? coach.courseSpecialsVI : coach.courseSpecialsEN).length > 0 ? (
                  <ul className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                    {(lang === 'vi' ? coach.courseSpecialsVI : coach.courseSpecialsEN || coach.courseSpecialsVI)?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>{t.courseSpecial1}</li>
                    <li>{t.courseSpecial2}</li>
                    <li>{t.courseSpecial3}</li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* YOUTUBE EMBED PLAYER */}
          <div className="card space-y-4">
            <h3 className="text-base font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
              <Video className="w-5 h-5 text-red-600" />
              {lang === 'vi' ? 'TẬN HƯỞNG KHOẢNH KHẮC' : 'ENJOY THE MOMENT'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coach.youtubeYoutIds.map((ytId: string, idx: number) => (
                <div key={idx} className="space-y-1 relative group">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block flex justify-between items-center">
                    <span>🎥 Battle Video Showcase #{idx + 1}</span>
                    {role === 'coach' && (
                      <button
                        onClick={() => {
                          const updatedIds = coach.youtubeYoutIds.filter((_: any, i: number) => i !== idx);
                          syncCoach({ ...coach, youtubeYoutIds: updatedIds });
                          showToast('Video removed');
                        }}
                        className="text-red-400 hover:text-red-600 font-bold transition-all text-[9px] cursor-pointer"
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
              <span className="text-[10px] uppercase font-mono text-red-500 font-bold block">{lang === 'vi' ? '📸 ẢNH GIAO LƯU' : '📸 EXCHANGE PHOTOS'}</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {coach.photos.map((ph: string, idx: number) => (
                  <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 group">
                    <img src={ph} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="pickleball session photo" referrerPolicy="no-referrer" />
                    {role === 'coach' && (
                      <button
                        onClick={() => {
                          const newPhotos = coach.photos.filter((_: any, i: number) => i !== idx);
                          syncCoach({ ...coach, photos: newPhotos });
                          showToast('Photo deleted');
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-md text-[9px] transition-all cursor-pointer"
                      >
                        Del
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inline adding form */}
            {role === 'coach' && (
              <div className="card bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-3 mt-4 text-xs">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-bold">
                  <PlusCircle className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Đăng Video hoặc Ảnh' : 'Post Video or Photo'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase block font-mono">{lang === 'vi' ? 'Loại nội dung' : 'Content Type'}</label>
                    <select
                      value={newMediaType}
                      onChange={(e) => { setNewMediaType(e.target.value as any); setNewMediaUrl(''); }}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none text-black dark:text-white"
                    >
                      <option value="video">{lang === 'vi' ? '🎥 Trận đấu (YouTube ID hoặc URL đầy đủ)' : '🎥 Match (YouTube ID or Full URL)'}</option>
                      <option value="photo">{lang === 'vi' ? '🔗 Ảnh giao lưu (Dán URL liên kết ảnh)' : '🔗 Exchange Photo (Paste Image URL)'}</option>
                      <option value="local_photo">{lang === 'vi' ? '💻 Tải ảnh trực tiếp từ máy (PC/Mobile dạng file)' : '💻 Upload from Device (File)'}</option>
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
                                  showToast(lang === 'vi' ? 'Đã nạp & tối ưu hóa ảnh khoảnh khắc!' : 'Moment photo compressed!');
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px] uppercase block font-mono">
                        {newMediaType === 'video' 
                          ? (lang === 'vi' ? 'Dán Link YouTube hoặc Video ID' : 'Paste YouTube Link or Video ID')
                          : (lang === 'vi' ? 'Dán Link ảnh liên kết (URL)' : 'Paste Image Link (URL)')}
                      </label>
                      <input
                        type="text"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        placeholder={newMediaType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/photo.jpg'}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>
                <button onClick={handleAddMedia} className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow">
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'vi' ? 'Đăng lên Thư Viện Media' : 'Post to Media Library'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
