import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, ShieldCheck, Lock, CheckCircle2, X } from 'lucide-react';
import { LanguageKey, translations } from '../translations';

interface AudioPlayerProps {
  lang: LanguageKey;
  role?: 'coach' | 'student' | 'viewer';
  compact?: boolean;
}

export default function AudioPlayer({ lang, role, compact }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [musicUrl, setMusicUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = translations[lang];

  // First check saved URL in localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('protpick_music_url');
    if (savedUrl) {
      setMusicUrl(savedUrl);
    }
    const savedVolume = localStorage.getItem('protpick_music_volume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Sync volume of player
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Robust Autoplay effect on mount / URL change
  useEffect(() => {
    const isSoundCloud = musicUrl.includes('soundcloud.com');
    if (!isSoundCloud) {
      const tryPlaying = () => {
        if (!audioRef.current) {
          audioRef.current = new Audio(musicUrl);
          audioRef.current.loop = true;
          audioRef.current.volume = volume;
        } else {
          audioRef.current.src = musicUrl;
        }

        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log("Autoplay blocked by browser. Awaiting first user gesture to start...", err);
          });
      };

      tryPlaying();

      const triggerInteractiveAutoplay = () => {
        tryPlaying();
        window.removeEventListener('click', triggerInteractiveAutoplay);
        window.removeEventListener('touchstart', triggerInteractiveAutoplay);
        window.removeEventListener('keydown', triggerInteractiveAutoplay);
      };

      window.addEventListener('click', triggerInteractiveAutoplay);
      window.addEventListener('touchstart', triggerInteractiveAutoplay);
      window.addEventListener('keydown', triggerInteractiveAutoplay);

      return () => {
        window.removeEventListener('click', triggerInteractiveAutoplay);
        window.removeEventListener('touchstart', triggerInteractiveAutoplay);
        window.removeEventListener('keydown', triggerInteractiveAutoplay);
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [musicUrl]);

  const togglePlay = () => {
    const isSoundCloud = musicUrl.includes('soundcloud.com');
    if (isSoundCloud) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = musicUrl;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio error:", err);
        });
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setMusicUrl(newUrl);
    localStorage.setItem('protpick_music_url', newUrl);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    localStorage.setItem('protpick_music_volume', v.toString());
  };

  const isSoundCloud = musicUrl.includes('soundcloud.com');

  // RENDER COMPACT (In Header)
  if (compact) {
    if (role !== 'coach') {
      // 👥 STUDENT COMPACT VIEW: NO "LOFI", NO "SC", NO CHANGE LINK. Just small play & pause controls.
      return (
        <div 
          className="bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-full px-2.5 py-1 flex items-center gap-2 shadow-xs" 
          id="student-music-controls-compact"
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
            <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-rose-500 animate-bounce' : 'text-zinc-550'}`} />
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-full border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => { if (!isPlaying) togglePlay(); }}
              className={`p-1 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isPlaying 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={lang === 'vi' ? 'Bật nhạc' : 'Play'}
            >
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => { if (isPlaying) togglePlay(); }}
              className={`p-1 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                !isPlaying 
                  ? 'bg-zinc-700 text-white shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={lang === 'vi' ? 'Tạm dừng' : 'Pause'}
            >
              <Pause className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>
        </div>
      );
    }

    // 🛠 COACH VIEW (HLV PHONG): Clicking the background bar opens the gorgeous modal
    return (
      <>
        <div 
          onClick={() => setIsPrivacyOpen(true)}
          className="bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 shadow-sm relative text-zinc-900 dark:text-white cursor-pointer group transition-all" 
          id="coach-music-bar-compact"
          title={lang === 'vi' ? "Click để xem Chính sách bảo mật & Cài đặt" : "Click to view Privacy policy & settings"}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1 rounded-lg shrink-0 ${isPlaying ? 'bg-rose-500/20 text-rose-450 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
              <Music className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono text-[10px] shrink-0 leading-tight">
              <span className="font-sans font-extrabold text-rose-500 text-[10.5px] block group-hover:underline">🎵 NHẠC NỀN & BẢO MẬT</span>
              <span className="text-zinc-400 text-[9px]">Click to open details</span>
            </div>
          </div>

          <div className="text-[11px] p-1 bg-zinc-200 dark:bg-zinc-850 hover:bg-zinc-300 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 rounded-md transition-colors font-extrabold shrink-0 border border-zinc-300 dark:border-zinc-700">
            🛡️ INFO
          </div>
        </div>

        {/* MODAL OVERLAY: PRIVACY POLICY & SETTINGS */}
        {isPrivacyOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-999 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-zinc-900 dark:text-zinc-100 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-scaleUp">
              
              <button 
                onClick={() => setIsPrivacyOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-rose-600/15 rounded-full flex items-center justify-center text-rose-500">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black text-rose-500 tracking-tight uppercase leading-snug">
                  {lang === 'vi' ? "CHÍNH SÁCH BẢO MẬT & ĐIỀU KHOẢN APP" : "PRIVACY POLICY & AUDIO SETTINGS"}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  {lang === 'vi' ? "DÀNH RIÊNG CHO HỆ THỐNG HUẤN LUYỆN PHONGPROT" : "OFFICIAL COACH CONFIGURATION PLATFORM"}
                </p>
              </div>

              {/* GORGEOUS VISUAL COMPONENT: PRIVACY POLICY CERTIFICATE */}
              <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border-2 border-amber-500/25 rounded-2xl p-5 md:p-6 space-y-4 shadow-inner relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-[0.03] select-none pointer-events-none text-9xl text-amber-500 font-black">
                  SEAL
                </div>
                
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-black">
                    {lang === 'vi' ? "Bảo Mật Thông Tin Học Viên" : "Student Privacy Seal"}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed font-sans">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>{lang === 'vi' ? "Tuyệt đối riêng tư:" : "100% Student Confidentials:"}</strong>{' '}
                      {lang === 'vi' 
                        ? "Mọi thông tin liên hệ, email, số điện thoại học viên đều lưu trữ an toàn trong vùng dữ liệu huấn luyện, chỉ hiển thị duy nhất cho HLV Phongprot." 
                        : "All student contact information, emails, and notes are securely stored and visible only to Coach Phongprot."}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>{lang === 'vi' ? "Mã hoá bộ môn:" : "Dynamic Attributes Protection:"}</strong>{' '}
                      {lang === 'vi' 
                        ? "Bản đồ 16 kỹ năng cơ bản và lịch sử ghi nhận điểm thực chiến chỉ do HLV Phongprot phê duyện mới được đồng bộ hóa dữ liệu thời gian thực lên ứng dụng." 
                        : "The basic physical skill points and historic match evaluations are synchronized securely across approved endpoints."}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>{lang === 'vi' ? "Lộ trình cá nhân hoá:" : "Curriculum Standard Assurance:"}</strong>{' '}
                      {lang === 'vi' 
                        ? "Hệ thống tự động đồng bộ hóa lịch trình, tiến độ và địa điểm dạy nhằm bảo đảm giáo trình chuẩn hoá quốc gia không bị sao chép." 
                        : "Schedules, lesson durations, and locations are processed exclusively to organize the training syllabus and block interference."}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 flex justify-between items-center text-[10px] text-zinc-500 italic">
                  <span>Authorised Signature: <strong>Phongprot APPROVED</strong></span>
                  <span className="text-amber-505 text-amber-500">★ Secure & Encrypted ★</span>
                </div>
              </div>

              {/* BACKGROUND LOFI MUSIC SETTINGS (ONLY IN THIS MODAL FOR COACH PHONG) */}
              <div className="bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 space-y-4">
                <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2 uppercase tracking-wide">
                  <Music className="w-4 h-4" />
                  {lang === 'vi' ? "Điều Chỉnh Nhạc Nền (.MP3)" : "Ambient Music URL Control"}
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-bold block">{lang === 'vi' ? "Link bài hát Lofi (.mp3 trực tiếp):" : "Direct (.mp3) link:"}</label>
                    <input
                      type="text"
                      value={musicUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="Paste direct MP3 link..."
                      className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono text-[11px]"
                    />
                    <span className="text-[9px] text-zinc-500 block">
                      {lang === 'vi' ? "💡 Gợi ý: Hãy truyền dán link file .mp3 trực tiếp hoạt động ổn định nhất." : "💡 Tip: Direct .mp3 streaming gives optimal looping performance."}
                    </span>
                    {isSoundCloud && (
                      <span className="text-[10px] text-amber-500 font-bold block font-sans leading-normal mt-1 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                        {lang === 'vi' 
                          ? "⚠️ Bạn đã dán link nhạc SoundCloud. Web browser không thể phát trực tiếp trang web SoundCloud từ thẻ audio. Vui lòng sử dụng link trực tiếp tới file nhạc (đuôi .mp3) để phát nhạc nền nhé."
                          : "⚠️ SoundCloud URL detected. Web browsers cannot play SoundCloud web pages directly in audio tags. Please use a direct link to an audio file (e.g. ending in .mp3)."}
                      </span>
                    )}
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={togglePlay}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer text-[10.5px]"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isPlaying ? (lang === 'vi' ? "Tạm Dừng" : "Pause") : (lang === 'vi' ? "Chạy Thử" : "Play")}
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                      {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 accent-rose-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-zinc-400 text-[10px] shrink-0 w-8 text-right">{(volume * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(false)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase cursor-pointer"
                >
                  {lang === 'vi' ? "Đóng Chính Sách & Đồng Ý" : "Close & Agree"}
                </button>
              </div>

            </div>
          </div>
        )}
      </>
    );
  }

  // STANDARD IN-TAB RENDER fallback (used optionally inside Curriculums or About sections)
  return (
    <div className="bg-rose-50/40 dark:bg-zinc-900/60 border border-rose-100/30 dark:border-zinc-800/60 rounded-3xl p-5 shadow-xs flex flex-col gap-4 text-zinc-800 dark:text-zinc-100" id="protpick-audio-player-standard">
      <div className="flex justify-between items-center pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 text-white p-2 rounded-xl">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{t.musicSettings}</h4>
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 block leading-none mt-0.5">Continuous Ambient Background Loop</span>
          </div>
        </div>

        <button
          onClick={togglePlay}
          className="bg-rose-600 hover:bg-rose-700 transition-colors text-white px-4 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer text-xs font-bold"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isPlaying ? (lang === 'vi' ? "Tạm Dừng" : "Pause") : (lang === 'vi' ? "Chạy Lofi" : "Play")}
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="flex items-center gap-3">
          {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 accent-rose-500 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-[9px] text-zinc-400 w-8 text-right">{(volume * 100).toFixed(0)}%</span>
        </div>

        {role === 'coach' ? (
          <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-800 pt-3">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase font-mono block">🔒 Coach Settings Panel:</span>
              <input
                type="text"
                value={musicUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Dán link mp3..."
                className="w-full text-[11px] p-2 bg-white dark:bg-zinc-955 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl focus:outline-none"
              />
              {isSoundCloud && (
                <span className="text-[10px] text-amber-500 font-bold block font-sans leading-normal mt-1 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                  {lang === 'vi' 
                    ? "⚠️ Bạn đã dán link nhạc SoundCloud. Web browser không thể phát trực tiếp trang web SoundCloud từ thẻ audio. Vui lòng sử dụng link trực tiếp tới file nhạc (đuôi .mp3) để phát nhạc nền nhé."
                    : "⚠️ SoundCloud URL detected. Web browsers cannot play SoundCloud web pages directly in audio tags. Please use a direct link to an audio file (e.g. ending in .mp3)."}
                </span>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-[10px] text-rose-500 underline uppercase tracking-wide block hover:text-rose-600 font-bold cursor-pointer"
            >
              Xem Chính sách bảo mật & phân phối thông tin học viên &gt;
            </button>
          </div>
        ) : (
          <div className="text-[10px] text-zinc-450 dark:text-zinc-500 italic text-center bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-150 dark:border-zinc-900">
            🔒 Bảo bảo mật thông tin tối đa dướng trượng quyền HLV Phongprot.
          </div>
        )}
      </div>

      {isPrivacyOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-999 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full text-zinc-900 dark:text-zinc-100 shadow-2xl relative space-y-4 animate-scaleUp">
            <h3 className="text-sm font-black text-rose-500">CHÍNH SÁCH RẢO MẬT HỌC VIÊN</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              Toàn bộ dữ liệu tập luyện của bạn nằm hoàn toàn bảo mật trong giáo trình quản lý chuyên nghiệp của Coach Phongprot. Sân đấu, điểm số, lịch sử luyện cam kết giữ bí mật nội bộ tuyệt đối để phụng sự học tập hiệu quả.
            </p>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(false)}
              className="mt-2 w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              Tôi Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
