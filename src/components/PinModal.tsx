import React from 'react';
import { X, Lock } from 'lucide-react';
import { LanguageKey } from '../translations';

interface PinModalProps {
  lang: LanguageKey;
  t: Record<string, string>;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (v: boolean) => void;
  isChangingPin: boolean;
  setIsChangingPin: (v: boolean) => void;
  pinInputValue: string;
  setPinInputValue: (v: string) => void;
  pinModalError: string;
  setPinModalError: (v: string) => void;
  dbCoachPin: string;
  setRole: (r: 'coach' | 'student') => void;
  setActiveTab: (t: string) => void;
  showToast: (msg: string) => void;
  currentPinValueForChange: string;
  setCurrentPinValueForChange: (v: string) => void;
  newPinValue1: string;
  setNewPinValue1: (v: string) => void;
  newPinValue2: string;
  setNewPinValue2: (v: string) => void;
}

export default function PinModal({
  lang, t, isPinModalOpen, setIsPinModalOpen,
  isChangingPin, setIsChangingPin,
  pinInputValue, setPinInputValue, pinModalError, setPinModalError,
  dbCoachPin, setRole, setActiveTab, showToast,
  currentPinValueForChange, setCurrentPinValueForChange,
  newPinValue1, setNewPinValue1,
  newPinValue2, setNewPinValue2
}: PinModalProps) {
  if (!isPinModalOpen) return null;

  const handlePinSuccess = () => {
    setRole('coach');
    localStorage.setItem('protpick_role', 'coach');
    setActiveTab('about');
    setIsPinModalOpen(false);
    setPinInputValue('');
    showToast(lang === 'vi'
      ? '🔓 Đã mở khóa quyền Sửa đổi HLV thành công! Tự động chuyển đến Hồ sơ HLV Phong.'
      : '🔓 Coach Edit privilege activated! Redirecting to Coach Profile.');
  };

  const handlePinDigit = (num: number) => {
    let draft = pinInputValue;
    if (draft.length === 4 || pinModalError) {
      draft = '';
      setPinModalError('');
    }
    if (draft.length < 4) {
      const newVal = draft + num;
      setPinInputValue(newVal);
      if (newVal === dbCoachPin) {
        setTimeout(handlePinSuccess, 150);
      } else if (newVal.length === 4) {
        setTimeout(() => {
          setPinModalError(lang === 'vi' ? 'Mã PIN không chính xác! Hãy thử lại.' : 'Incorrect PIN! Please try again.');
        }, 150);
      }
    }
  };

  const handlePhysicalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (pinInputValue.length === 4 || pinModalError) {
      val = val.slice(-1);
      setPinModalError('');
    } else if (val.length > 4) {
      val = val.slice(0, 4);
    }
    setPinInputValue(val);
    setPinModalError('');
    if (val === dbCoachPin) {
      setRole('coach');
      localStorage.setItem('protpick_role', 'coach');
      setActiveTab('about');
      setIsPinModalOpen(false);
      setPinInputValue('');
      showToast(lang === 'vi'
        ? '🔓 Đã mở khóa quyền Sửa đổi HLV thành công! Tự động chuyển đến Hồ sơ HLV Phong.'
        : '🔓 Coach Edit privilege activated! Redirecting to Coach Profile.');
    } else if (val.length === 4) {
      setTimeout(() => {
        setPinModalError(lang === 'vi' ? 'Mã PIN không chính xác! Hãy thử lại.' : 'Incorrect PIN! Please try again.');
      }, 150);
    }
  };

  const handleSaveNewPin = async () => {
    const savedPin = dbCoachPin;
    if (currentPinValueForChange !== savedPin) {
      setPinModalError(lang === 'vi' ? 'Mã PIN hiện tại không khớp!' : 'Current PIN is incorrect!');
      return;
    }
    if (!newPinValue1.trim()) {
      setPinModalError(lang === 'vi' ? 'Mã PIN mới không được trống!' : 'New PIN cannot be empty!');
      return;
    }
    if (newPinValue1 !== newPinValue2) {
      setPinModalError(lang === 'vi' ? 'Xác nhận Mã PIN mới không khớp!' : 'New PIN confirmation does not match!');
      return;
    }
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await setDoc(doc(db, 'settings', 'security'), { pin: newPinValue1.trim() });
      localStorage.setItem('protpick_coach_pin', newPinValue1.trim());
      setIsPinModalOpen(false);
      showToast(lang === 'vi' ? '✅ Đã đổi Mã PIN bảo mật HLV thành công!' : '✅ Coach PIN security configured successfully!');
    } catch (err) {
      console.error(err);
      setPinModalError(lang === 'vi' ? 'Lỗi đồng bộ Firebase' : 'Firebase sync error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="card rounded-3xl p-6 md:p-8 shadow-2xl animate-scaleIn relative overflow-hidden max-w-sm w-full border-zinc-200 dark:border-red-500/25">
        <button
          onClick={() => setIsPinModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-805 transition cursor-pointer"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {!isChangingPin ? (
          /* VERIFICATION / LOGIN MODE */
          <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
            <div className="text-center space-y-2">
              <div className="bg-red-500/10 text-red-500 p-4 rounded-3xl inline-block mx-auto">
                <Lock className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {lang === 'vi' ? 'XÁC THỰC QUYỀN HLV' : 'VERIFY COACH PRIVILEGE'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                {lang === 'vi'
                  ? 'Vui lòng nhập Mã PIN bảo mật để chuyển sang Chế độ HLV.'
                  : 'Please enter the security PIN code to activate Coach Mode.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative flex flex-col items-center justify-center p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <input
                  type="tel"
                  pattern="[0-9]*"
                  maxLength={5}
                  autoFocus
                  value={pinInputValue}
                  onChange={handlePhysicalInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  placeholder="Enter PIN"
                />
                <div className="flex justify-center items-center gap-6 my-4 select-none pointer-events-none">
                  {[0, 1, 2, 3].map((index) => {
                    const hasDigit = pinInputValue.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          hasDigit
                            ? 'bg-red-500 border-red-500 scale-115 shadow-md shadow-red-500/25'
                            : 'bg-transparent border-zinc-600'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {pinModalError && (
                <p className="text-xs text-red-500 text-center font-bold animate-pulse">
                  ⚠️ {pinModalError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinDigit(num)}
                  className="h-12 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700/80 active:scale-95 text-xl font-extrabold text-zinc-900 dark:text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs border border-zinc-300 dark:border-zinc-750"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setPinInputValue(''); setPinModalError(''); }}
                className="h-12 bg-zinc-200/40 dark:bg-zinc-800/40 hover:bg-zinc-300 dark:hover:bg-zinc-800/80 hover:text-red-600 dark:hover:text-red-500 active:scale-95 text-xs font-black text-zinc-600 dark:text-zinc-400 rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit(0)}
                className="h-12 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700/80 active:scale-95 text-xl font-extrabold text-zinc-900 dark:text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs border border-zinc-300 dark:border-zinc-750"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  const savedPin = dbCoachPin;
                  if (pinInputValue === savedPin) {
                    handlePinSuccess();
                  } else {
                    setPinModalError(lang === 'vi' ? 'Mã PIN không chính xác! Hãy thử lại.' : 'Incorrect PIN! Please try again.');
                  }
                }}
                className="h-12 bg-red-600 hover:bg-red-700 active:scale-95 text-xs font-black text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-md"
              >
                OK
              </button>
            </div>

            <div className="text-center text-[10px] text-zinc-500 font-mono">
              {lang === 'vi' ? '💡 Nhấn số trên màn hình hoặc gõ phím trực tiếp' : '💡 Touch keypads or type on your keyboard'}
              <span className="block mt-1.5 text-zinc-650">
                {lang === 'vi' ? 'Mã PIN mặc định là: 1234' : 'Default PIN card is: 1234'}
              </span>
            </div>
          </div>
        ) : (
          /* CHANGE PIN MODE */
          <div className="space-y-5 text-zinc-900 dark:text-zinc-100">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                {lang === 'vi' ? 'ĐỔI MÃ PIN BẢO MẬT' : 'CHANGE SECURITY PIN'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {lang === 'vi' ? 'Nhập mã cũ và mã mới' : 'Enter current and new PIN'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">
                  {lang === 'vi' ? '1. Mã PIN hiện tại *' : '1. Current PIN *'}
                </label>
                <input
                  type="password"
                  maxLength={12}
                  value={currentPinValueForChange}
                  onChange={(e) => setCurrentPinValueForChange(e.target.value)}
                  className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-white rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">
                  {lang === 'vi' ? '2. Mã PIN mới (tối đa 12 ký tự) *' : '2. New PIN (max 12 chars) *'}
                </label>
                <input
                  type="password"
                  maxLength={12}
                  value={newPinValue1}
                  onChange={(e) => setNewPinValue1(e.target.value)}
                  className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-white rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">
                  {lang === 'vi' ? '3. Nhập lại Mã PIN mới để xác nhận *' : '3. Re-enter New PIN *'}
                </label>
                <input
                  type="password"
                  maxLength={12}
                  value={newPinValue2}
                  onChange={(e) => setNewPinValue2(e.target.value)}
                  className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-955 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-white rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {pinModalError && (
                <p className="text-xs text-red-500 text-center font-bold">
                  ⚠️ {pinModalError}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="flex-1 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-350 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveNewPin}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                {lang === 'vi' ? 'Lưu PIN mới' : 'Save PIN'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
