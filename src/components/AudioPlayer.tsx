import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, Music, X, Upload, Link as LinkIcon } from 'lucide-react';
import { LanguageKey } from '../translations';

interface AudioPlayerProps {
  lang: LanguageKey;
  role?: string;
}

export default function AudioPlayer({ lang, role }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [musicUrl, setMusicUrl] = useState('');
  const [currentSrc, setCurrentSrc] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [fileName, setFileName] = useState('');

  // Load saved music URL from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('protpick_music_url');
      if (saved) {
        setMusicUrl(saved);
        setCurrentSrc(saved);
      }
    } catch {}
  }, []);

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (!currentSrc) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [currentSrc, isPlaying]);

  // Set URL source
  const applyUrl = useCallback(() => {
    if (!musicUrl.trim()) return;
    setCurrentSrc(musicUrl.trim());
    setFileName('');
    localStorage.setItem('protpick_music_url', musicUrl.trim());
    // Auto-play after setting
    setIsPlaying(true);
  }, [musicUrl]);

  // File upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCurrentSrc(url);
    setFileName(file.name);
    setMusicUrl('');
    setIsPlaying(true);
  }, []);

  // Volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Remove "Upload" area for non-coach
  const isCoach = role === 'coach';

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/30 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        aria-label={lang === 'vi' ? 'Mở nhạc nền' : 'Open music player'}
      >
        {isPlaying ? (
          <Music className="w-5 h-5 animate-pulse" />
        ) : (
          <Music className="w-5 h-5" />
        )}
      </button>

      {/* Panel Modal */}
      {showPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPanel(false); }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Music className="w-4 h-4 text-rose-500" />
                {lang === 'vi' ? 'Nhạc nền' : 'Background Music'}
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Audio element (hidden) */}
            <audio
              ref={audioRef}
              src={currentSrc}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false);
                if (currentSrc && !currentSrc.startsWith('blob:')) {
                  // Only clear blob (uploaded) URLs on error
                }
              }}
              loop
            />

            {/* Player Controls */}
            <div className="px-5 py-3 space-y-3">
              {/* Now playing indicator */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!currentSrc}
                  className="shrink-0 w-10 h-10 bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                    {currentSrc
                      ? fileName || (lang === 'vi' ? 'Đang phát nhạc' : 'Now playing')
                      : (lang === 'vi' ? 'Chưa có nhạc' : 'No music')}
                  </p>
                  <p className="text-[9px] text-zinc-400 mt-0.5 truncate font-mono">
                    {currentSrc
                      ? fileName ? fileName : musicUrl.slice(0, 40) + (musicUrl.length > 40 ? '…' : '')
                      : (lang === 'vi' ? 'Thêm nhạc bên dưới' : 'Add music below')}
                  </p>
                </div>
                {/* Volume */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 accent-rose-500 h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Source: Tabs for URL / Upload */}
              {isCoach && (
                <div className="space-y-3">
                  {/* Mode toggle */}
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 text-[10px] font-bold">
                    <button
                      onClick={() => setInputMode('url')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                        inputMode === 'url'
                          ? 'bg-white dark:bg-zinc-700 text-rose-500 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      {lang === 'vi' ? 'Link URL' : 'URL Link'}
                    </button>
                    <button
                      onClick={() => setInputMode('upload')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                        inputMode === 'upload'
                          ? 'bg-white dark:bg-zinc-700 text-rose-500 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      {lang === 'vi' ? 'Tải lên' : 'Upload'}
                    </button>
                  </div>

                  {/* URL input */}
                  {inputMode === 'url' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder={
                          lang === 'vi'
                            ? 'https://example.com/nhac.mp3'
                            : 'https://example.com/music.mp3'
                        }
                        value={musicUrl}
                        onChange={(e) => setMusicUrl(e.target.value)}
                        className="flex-1 text-[11px] p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-zinc-400"
                      />
                      <button
                        onClick={applyUrl}
                        disabled={!musicUrl.trim()}
                        className="px-3 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-[10px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {lang === 'vi' ? 'Áp' : 'Set'}
                      </button>
                    </div>
                  )}

                  {/* Upload */}
                  {inputMode === 'upload' && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-1.5 p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-500 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-600 transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/50"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-bold">
                          {lang === 'vi' ? 'Chọn file nhạc từ máy' : 'Choose music file'}
                        </span>
                        <span className="text-[9px] text-zinc-400">
                          MP3, WAV, M4A, OGG, AAC (tất cả trình duyệt)
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Tip */}
                  <p className="text-[9px] text-zinc-400 italic text-center px-2">
                    {lang === 'vi'
                      ? '💡 Nhạc được lưu trong trình duyệt, chỉ bạn mới nghe được'
                      : '💡 Music is saved locally, only you can hear it'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[9px] text-zinc-400">
              <span>{lang === 'vi' ? '🔊 Phát nền, tự động lặp lại' : '🔊 Plays in background, loops automatically'}</span>
              {currentSrc && isPlaying && (
                <span className="text-emerald-500 font-bold">{lang === 'vi' ? 'Đang phát' : 'Playing'}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
