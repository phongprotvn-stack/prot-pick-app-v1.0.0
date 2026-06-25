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
}

export default function AboutTab({
  t, lang, role, coach, isEditingCoachAvatar, setIsEditingCoachAvatar,
  tempCoachAvatar, setTempCoachAvatar, handleUpdateCoachAvatar,
  newMediaType, setNewMediaType, newMediaUrl, setNewMediaUrl,
  handleAddMedia, compressImage, showToast,
  setCurrentPinValueForChange, setNewPinValue1, setNewPinValue2,
  setPinModalError, setIsChangingPin, setIsPinModalOpen, syncCoach
}: AboutTabProps) {
  return (
    <div className="space-y-8 animate-fadeIn" id="tab-about-panel">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: COACH RESUME */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={coach.avatar}
                alt="phongprot avatar display"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-rose-500 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-2 bg-rose-600 text-white p-2 rounded-full shadow animate-pulse">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            {/* Mode to change Coach Avatar URL */}
            {role === 'coach' && (
              <div className="flex flex-col items-center">
                {isEditingCoachAvatar ? (
                  <div className="flex flex-col gap-2 w-full max-w-xs justify-center items-center mt-1 p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-2xl">
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
                    <label className="w-full flex flex-col items-center justify-center p-2 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:border-rose-500 transition-all text-center">
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
                        className="flex-1 bg-zinc-700 hover:bg-zinc-650 text-zinc-200 text-[10px] py-1 rounded-lg font-black cursor-pointer transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setTempCoachAvatar(coach.avatar); setIsEditingCoachAvatar(true); }}
                    className="text-[10px] text-rose-500 hover:text-rose-450 font-bold flex items-center justify-center gap-1 cursor-pointer mt-1"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    Thay đổi ảnh HLV
                  </button>
                )}
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tight">COACH {coach.name}</h3>
              <span className="font-mono text-xs text-rose-500 font-extrabold uppercase tracking-wide">
                ⚡ CHIẾN ĐẤU KHÔNG NGỪNG NGHỈ
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans text-justify bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-900">
              {lang === 'vi' ? coach.aboutVI : coach.aboutEN}
            </p>

            <div className="pt-2 text-left space-y-2.5 text-xs border-t border-zinc-150 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>
                  <strong>Youtube:</strong>{' '}
                  <a href="https://www.youtube.com/@phongprot" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-400 font-bold transition-all hover:underline cursor-pointer">
                    @phongprot
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-zinc-400" />
                <span>
                  <strong>Tiktok:</strong>{' '}
                  <a href="https://www.tiktok.com/@phongprot" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-400 font-bold transition-all hover:underline cursor-pointer">
                    @phongprot
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-rose-500" />
                <span><strong>Sân tập:</strong> Cụm sân Pickleball HN & Sài Gòn</span>
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
                    className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-950 dark:text-zinc-200 text-[10px] py-1.5 px-3 rounded-lg font-black tracking-wider uppercase transition-colors border border-zinc-205 dark:border-zinc-750 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    🔑 Cài đặt Mã PIN HLV bảo mật
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BATTLE GALLERY UPDATE */}
          {role === 'coach' && (
            <div className="bg-white dark:bg-zinc-900 border border-rose-500/25 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-black text-rose-505 text-rose-600 uppercase tracking-widest font-mono">🛠 QUẢN LÝ VIDEO VÀ ẢNH GIAO LƯU</h4>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Loại Media</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => { setNewMediaType(e.target.value as any); setNewMediaUrl(''); }}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-805 text-black dark:text-white rounded-lg focus:outline-none"
                  >
                    <option value="video">🎥 YouTube Video URL / ID</option>
                    <option value="photo">🔗 Link ảnh từ trang upload khác (URL)</option>
                    <option value="local_photo">💻 Tải ảnh trực tiếp từ máy (PC/Mobile)</option>
                  </select>
                </div>

                {newMediaType === 'local_photo' ? (
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">Chọn tệp ảnh từ thiết bị</label>
                    <label className="w-full flex flex-col items-center justify-center p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-rose-500 transition-all text-center">
                      <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                      <span className="text-[10px] text-zinc-400">Chọn tệp ảnh từ ổ đĩa (.png, .jpg, .jpeg)</span>
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
                                compressImage(reader.result, 600, 600, 0.75).then(compressed => {
                                  setNewMediaUrl(compressed);
                                  showToast(lang === 'vi' ? 'Đã nạp & tối ưu hóa ảnh từ máy!' : 'Selected local photo (compressed)!');
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {newMediaUrl && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-emerald-500 font-mono">✅ Sẵn sàng tải lên (Kích thước: {Math.round(newMediaUrl.length / 1024)} KB)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">Đường dẫn URL / ID Youtube</label>
                    <input
                      type="text"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder={newMediaType === 'video' ? 'https://www.youtube.com/watch?v=... hoặc Video ID' : 'https://example.com/image.jpg'}
                      className="w-full p-2 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleAddMedia}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-colors"
                >
                  {t.addMediaLink}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: COURSE OPTIONS & PLAYABLE MEDIA */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-black text-rose-505 text-rose-605 text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-5 h-5 animate-pulse" />
              CÁC KHÓA HỌC PICKLEBALL THỰC CHIẾN - PHONGPROT
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.aboutCourseIntro}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              {(lang === 'vi' ? coach.coursesVI : coach.coursesEN).map((course: any, i: number) => (
                <div key={i} className="p-4 bg-zinc-100/30 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-900 rounded-2xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">HOT PACK</div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-tight line-clamp-2">{course.title}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{course.desc}</p>
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-900 pt-2 text-[11px] font-mono font-black text-rose-500 text-right mt-1.5">{course.price}</div>
                </div>
              ))}
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase block">{t.courseSpecial}</span>
              <ul className="text-[11px] text-zinc-650 dark:text-zinc-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>{t.courseSpecial1}</li>
                <li>{t.courseSpecial2}</li>
                <li>{t.courseSpecial3}</li>
              </ul>
            </div>
          </div>

          {/* YOUTUBE EMBED PLAYER */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-rose-505 text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
              <Video className="w-5 h-5 text-rose-600" />
              {t.mediaSection}
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
                        className="text-rose-450 hover:text-rose-600 font-bold transition-all text-[9px] cursor-pointer"
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
              <span className="text-[10px] uppercase font-mono text-rose-500 font-bold block">📸 GIAO LƯU & TẬN HƯỞNG KHOẢNH KHẮC</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {coach.photos.map((ph: string, idx: number) => (
                  <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 group">
                    <img src={ph} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="pickleball session photo" referrerPolicy="no-referrer" />
                    {role === 'coach' && (
                      <button
                        onClick={() => {
                          const newPhotos = coach.photos.filter((_: any, i: number) => i !== idx);
                          syncCoach({ ...coach, photos: newPhotos });
                          showToast('Photo deleted');
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-md text-[9px] transition-all cursor-pointer"
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
              <div className="bg-zinc-50 dark:bg-zinc-955 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-3 mt-4 text-xs">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500 font-bold">
                  <PlusCircle className="w-4 h-4" />
                  <span>Đăng nhanh Video trận đấu hoặc Ảnh khoảnh khắc</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase block font-mono">Loại nội dung</label>
                    <select
                      value={newMediaType}
                      onChange={(e) => { setNewMediaType(e.target.value as any); setNewMediaUrl(''); }}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none text-black dark:text-white"
                    >
                      <option value="video">🎥 Trận đấu (YouTube ID hoặc URL đầy đủ)</option>
                      <option value="photo">🔗 Ảnh giao lưu (Dán URL liên kết ảnh)</option>
                      <option value="local_photo">💻 Tải ảnh trực tiếp từ máy (PC/Mobile dạng file)</option>
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
                        className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-rose-500/10 file:text-rose-500 hover:file:bg-rose-500/20 bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px] uppercase block font-mono">
                        {newMediaType === 'video' ? 'Dán Link YouTube hoặc Video ID' : 'Dán Link ảnh liên kết (URL)'}
                      </label>
                      <input
                        type="text"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        placeholder={newMediaType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/photo.jpg'}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>
                <button onClick={handleAddMedia} className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow">
                  <Plus className="w-3.5 h-3.5" />
                  Đăng lên Thư Viện Media
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
