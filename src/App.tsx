import React, { Suspense, useEffect, lazy, useRef } from 'react';
import { useApp, compressImage } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PinModal from './components/PinModal';
import SkillHistoryModal from './components/SkillHistoryModal';
import { Activity, Users, BookOpen, Calendar, Award, Bell, Plus } from 'lucide-react';

// Lazy-loaded tab components for code splitting
const DashboardTab = React.lazy(() => import('./components/DashboardTab'));
const StudentsTab = React.lazy(() => import('./components/StudentsTab'));
const CurriculumTab = React.lazy(() => import('./components/CurriculumTab'));
const SessionsTab = React.lazy(() => import('./components/SessionsTab'));
const AboutTab = React.lazy(() => import('./components/AboutTab'));

function AppContent() {
  const {
    t, lang, role, theme, activeTab, setActiveTab, searchQuery, setSearchQuery,
    filteredStudents, sessions, resolvedStudents, skillsList, lessonPlans, filteredPlans, filteredSessions,
    getAverageRating, getStrongestSkills, getNeedImprovementSkills, coach, customLegendNotes,
    editingStudent, setEditingStudent, editingPlan, setEditingPlan,
    newSession, setNewSession, editingSessionId, setEditingSessionId,
    newNoti, setNewNoti, newSkill, setNewSkill, selectedSkillForHistory, setSelectedSkillForHistory,
    newMediaUrl, setNewMediaUrl, newMediaType, setNewMediaType,
    selectedStudentId, setSelectedStudentId, activeStudent,
    sessionSearchQuery, setSessionSearchQuery, sessionDateFilter, setSessionDateFilter,
    isEditingStudentAvatar, setIsEditingStudentAvatar, tempStudentAvatar, setTempStudentAvatar,
    isEditingCoachAvatar, setIsEditingCoachAvatar, tempCoachAvatar, setTempCoachAvatar,
    handleSaveStudent, handleDeleteStudent, handleSavePlan, handleSaveSkill,
    handleSaveSession, handleDeleteSession, handleSaveNoti, handleDeleteNoti,
    handleDirectSkillRate, handleUpdateStudentAvatar, handleUpdateCoachAvatar, handleSaveLegend,
    handleAddMedia, showToast, translateViToEn, translateEnToVi, sortedNotifications,
    isMobileMenuOpen, setIsMobileMenuOpen, isMobileSearchOpen, setIsMobileSearchOpen,
    isNotiHistoryOpen, setIsNotiHistoryOpen, selectedNotiId, setSelectedNotiId, toastMessage, futureIdeas, votedIdeas, setVotedIdeas,
    isFutureIdeasOpen, setIsFutureIdeasOpen, chartContainerRefForHistory,
    isPinModalOpen, setIsPinModalOpen, isChangingPin, setIsChangingPin,
    pinInputValue, setPinInputValue, pinModalError, setPinModalError,
    dbCoachPin, setRole, setActiveTab: setActiveTabRaw,
    currentPinValueForChange, setCurrentPinValueForChange,
    newPinValue1, setNewPinValue1, newPinValue2, setNewPinValue2,
    handleRoleToggle, handleLangToggle, handleThemeToggle,
    translationTimeoutRef, navStack, goBack,
    setCustomLegendNotes,
    syncCoach,
    helpCategories, syncHelpCategories,
  } = useApp();

  // === SWIPE-LEFT TO GO BACK ===
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeRef.current || navStack.length === 0) return;
    // Skip if touch target is inside a horizontally scrollable container
    // (e.g. student cards strip, horizontal scroll areas)
    const target = e.target as HTMLElement;
    let el: HTMLElement | null = target;
    while (el) {
      const style = window.getComputedStyle(el);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') return;
      el = el.parentElement;
    }
    const touch = e.changedTouches[0];
    const dx = swipeRef.current.x - touch.clientX; // positive = leftward
    const dy = Math.abs(swipeRef.current.y - touch.clientY);
    const dt = Date.now() - swipeRef.current.t;
    if (dx > 80 && dy < dx * 2 && dt < 500) {
      goBack();
    }
    swipeRef.current = null;
  };

  // Scroll to selected notification
  useEffect(() => {
    if (!selectedNotiId) return;
    const el = document.getElementById(`noti-${selectedNotiId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedNotiId]);

  // Toast notification bar
  const ToastBar = toastMessage ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-slideDown pointer-events-auto max-w-[90vw] text-center">
      {toastMessage}
    </div>
  ) : null;

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className={`min-h-screen bg-red-50/30 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans antialiased transition-colors duration-300`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {ToastBar}

        {/* HEADER */}
        <Header
          t={t} lang={lang} role={role} theme={theme}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          notifications={[]} isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isMobileSearchOpen={isMobileSearchOpen}
          setIsMobileSearchOpen={setIsMobileSearchOpen}
          isNotiHistoryOpen={isNotiHistoryOpen}
          setIsNotiHistoryOpen={setIsNotiHistoryOpen}
          selectedNotiId={selectedNotiId}
          setSelectedNotiId={setSelectedNotiId}
          newNoti={newNoti} setNewNoti={setNewNoti}
          handleRoleToggle={handleRoleToggle}
          handleLangToggle={handleLangToggle}
          handleThemeToggle={handleThemeToggle}
          handleSaveNoti={handleSaveNoti}
          handleDeleteNoti={handleDeleteNoti}
          translateViToEn={translateViToEn}
          translationTimeoutRef={translationTimeoutRef}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          navStack={navStack}
          goBack={goBack}
          sortedNotifications={sortedNotifications}
          dbCoachPin={dbCoachPin}
          setRole={setRole}
          showToast={showToast}
          helpCategories={helpCategories}
          syncHelpCategories={syncHelpCategories}
        />
 
          <main className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-24 md:py-6" id="protpick-main-canvas">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
            {activeTab === 'dashboard' && (
              <>
                {/* NOTIFICATION CENTER — only on Dashboard */}
                {(() => {
                  const visible = sortedNotifications.filter(n => role === 'coach' || n.isPublic);
                  const focus = selectedNotiId ? visible.find(n => n.id === selectedNotiId) : null;
                  const latestNoti = focus || visible[0];
                  return (
                    <div className="mb-4 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl p-4 shadow-md dark:shadow-none relative overflow-hidden card" id="protpick-notification-center">
                      <div className="absolute right-3 top-3 opacity-[0.06] dark:opacity-10 pointer-events-none">
                        <Bell className="w-8 h-8 text-red-500 dark:text-red-400/60" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                          {lang === 'vi' ? 'Thông báo' : 'Notifications'}
                        </h3>
                        {latestNoti ? (
                          <div id={`noti-${latestNoti.id}`} className={`space-y-1 transition-all duration-300 ${
                            selectedNotiId === latestNoti.id ? 'ring-2 ring-red-500/30 rounded-xl p-3 -mx-3' : ''
                          }`}>
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                              {lang === 'vi' ? latestNoti.titleVI : latestNoti.titleEN}
                            </h4>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                              {lang === 'vi' ? latestNoti.contentVI : latestNoti.contentEN}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                              <span className="bg-zinc-100 dark:bg-zinc-800/40 px-1.5 py-0.5 rounded font-bold">{latestNoti.date}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-wider border ${
                                latestNoti.type === 'success'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/30'
                                  : latestNoti.type === 'warning'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/30'
                                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-450 border-sky-500/30'
                              }`}>
                                {t[`noti${latestNoti.type.charAt(0).toUpperCase() + latestNoti.type.slice(1) as 'Success' | 'Warning' | 'Info'}`]}
                              </span>
                              {!latestNoti.isPublic && <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-750 px-1 py-0.5 rounded font-bold">Private</span>}
                              {role === 'coach' && (
                                <button type="button" onClick={() => handleDeleteNoti(latestNoti.id)}
                                  className="text-zinc-500 hover:text-red-500 hover:underline transition-colors ml-auto cursor-pointer font-bold">Delete</button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">{t.noNoti}</p>
                        )}
                      </div>
                      {role === 'coach' && !newNoti && (
                        <button type="button" onClick={() => setNewNoti({ titleVI: '', titleEN: '', contentVI: '', contentEN: '', type: 'info', isPublic: true })}
                          className="mt-3 text-[10px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-extrabold flex items-center gap-1 cursor-pointer transition-colors">
                          <Plus className="w-3 h-3" /> {t.sendNotification}
                        </button>
                      )}
                      {newNoti && (
                        <form onSubmit={handleSaveNoti} className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5 text-zinc-900 dark:text-zinc-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lang === 'vi' && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">Tiêu đề (VI)</label>
                                <input type="text" required value={newNoti.titleVI || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewNoti({ ...newNoti, titleVI: val });
                                    if (val.trim()) {
                                      setTimeout(async () => {
                                        const trans = await translateViToEn(val);
                                        if (trans) setNewNoti(prev => prev ? { ...prev, titleEN: trans } : null);
                                      }, 800);
                                    }
                                  }}
                                  className="w-full text-[11px] p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500" />
                                      </div>
                                    )}
                                    {lang === 'en' && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">Title (EN)</label>
                                        <input type="text" required value={newNoti.titleEN || ''}
                                          onChange={(e) => setNewNoti({ ...newNoti, titleEN: e.target.value })}
                                          className="w-full text-[11px] p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500" />
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lang === 'vi' && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">Nội dung (VI)</label>
                                <textarea required value={newNoti.contentVI || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewNoti({ ...newNoti, contentVI: val });
                                    if (val.trim()) {
                                      setTimeout(async () => {
                                        const trans = await translateViToEn(val);
                                        if (trans) setNewNoti(prev => prev ? { ...prev, contentEN: trans } : null);
                                      }, 1000);
                                    }
                                  }}
                                  className="w-full text-[11px] p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl h-16 focus:outline-none focus:ring-1 focus:ring-red-500" />
                              </div>
                            )}
                            {lang === 'en' && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold font-sans">Content (EN)</label>
                                <textarea required value={newNoti.contentEN || ''}
                                  onChange={(e) => setNewNoti({ ...newNoti, contentEN: e.target.value })}
                                  className="w-full text-[11px] p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl h-16 focus:outline-none focus:ring-1 focus:ring-red-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-2">
                              <select value={newNoti.type || 'info'}
                                onChange={(e) => setNewNoti({ ...newNoti, type: e.target.value as 'info' | 'success' | 'warning' })}
                                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 rounded-xl p-1.5 text-[10px] text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500">
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                              </select>
                              <label className="flex items-center gap-1 cursor-pointer font-bold text-zinc-650 dark:text-zinc-300">
                                <input type="checkbox" checked={newNoti.isPublic ?? true}
                                  onChange={(e) => setNewNoti({ ...newNoti, isPublic: e.target.checked })}
                                  className="accent-red-500 rounded cursor-pointer" />
                                <span>{lang === 'vi' ? 'Công khai' : 'Public'}</span>
                              </label>
                            </div>
                            <div className="flex gap-1.5">
                              <button type="button" onClick={() => setNewNoti(null)}
                                className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-400 rounded-xl cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">{lang === 'vi' ? 'Hủy' : 'Cancel'}</button>
                              <button type="submit" className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-red-500/20 transition-all">{lang === 'vi' ? 'Tạo' : 'Broadcast'}</button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })()}

                <DashboardTab
                  t={t} lang={lang}
                  filteredStudents={filteredStudents} sessions={sessions}
                  resolvedStudents={resolvedStudents} skillsList={skillsList}
                  getAverageRating={getAverageRating}
                  setActiveTab={setActiveTab} setSelectedStudentId={setSelectedStudentId}
                />
              </>
            )}

          {activeTab === 'students' && (
            <StudentsTab
              t={t} lang={lang} role={role}
              filteredStudents={filteredStudents}
              activeStudent={activeStudent || null}
              editingStudent={editingStudent} setEditingStudent={setEditingStudent}
              getAverageRating={getAverageRating}
              getStrongestSkills={getStrongestSkills}
              getNeedImprovementSkills={getNeedImprovementSkills}
              handleSaveStudent={handleSaveStudent}
              handleDeleteStudent={handleDeleteStudent}
              handleDirectSkillRate={handleDirectSkillRate}
              handleUpdateStudentAvatar={handleUpdateStudentAvatar}
              handleSaveLegend={handleSaveLegend}
              customLegendNotes={customLegendNotes}
              setCustomLegendNotes={setCustomLegendNotes}
              isEditingStudentAvatar={isEditingStudentAvatar}
              setIsEditingStudentAvatar={setIsEditingStudentAvatar}
              tempStudentAvatar={tempStudentAvatar}
              setTempStudentAvatar={setTempStudentAvatar}
              setSelectedStudentId={setSelectedStudentId}
              setSelectedSkillForHistory={setSelectedSkillForHistory}
              showToast={showToast}
              skillsList={skillsList} sessions={sessions} lessonPlans={lessonPlans}
              compressImage={compressImage}
              translateViToEn={translateViToEn}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumTab
              t={t} lang={lang} role={role}
              filteredPlans={filteredPlans}
              editingPlan={editingPlan} setEditingPlan={setEditingPlan}
              handleSavePlan={handleSavePlan}
              skillsList={skillsList}
              newSkill={newSkill} setNewSkill={setNewSkill}
              handleSaveSkill={handleSaveSkill}
              setNewNoti={setNewNoti}
              setEditingStudent={setEditingStudent}
              setNewSession={setNewSession}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsTab
              t={t} lang={lang} role={role}
              filteredSessions={filteredSessions}
              sessions={sessions} lessonPlans={lessonPlans}
              resolvedStudents={resolvedStudents} skillsList={skillsList}
              newSession={newSession} setNewSession={setNewSession}
              editingSessionId={editingSessionId} setEditingSessionId={setEditingSessionId}
              handleSaveSession={handleSaveSession}
              handleDeleteSession={handleDeleteSession}
              sessionSearchQuery={sessionSearchQuery}
              setSessionSearchQuery={setSessionSearchQuery}
              sessionDateFilter={sessionDateFilter}
              setSessionDateFilter={setSessionDateFilter}
              showToast={showToast}
              translateViToEn={translateViToEn}
              translateEnToVi={translateEnToVi}
            />
          )}

          {activeTab === 'about' && (
            <AboutTab
              t={t} lang={lang} role={role}
              coach={coach} showToast={showToast}
              isEditingCoachAvatar={isEditingCoachAvatar}
              setIsEditingCoachAvatar={setIsEditingCoachAvatar}
              tempCoachAvatar={tempCoachAvatar}
              setTempCoachAvatar={setTempCoachAvatar}
              handleUpdateCoachAvatar={handleUpdateCoachAvatar}
              newMediaUrl={newMediaUrl} setNewMediaUrl={setNewMediaUrl}
              newMediaType={newMediaType} setNewMediaType={setNewMediaType}
              handleAddMedia={handleAddMedia}
              compressImage={compressImage}
              setCurrentPinValueForChange={setCurrentPinValueForChange}
              setNewPinValue1={setNewPinValue1}
              setNewPinValue2={setNewPinValue2}
              setPinModalError={setPinModalError}
              setIsChangingPin={setIsChangingPin}
              setIsPinModalOpen={setIsPinModalOpen}
              syncCoach={syncCoach}
              translateViToEn={translateViToEn}
            />
          )}
        </Suspense>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <BottomNav
          t={t} lang={lang} role={role} activeTab={activeTab}
          setActiveTab={setActiveTab} setSearchQuery={setSearchQuery}
          setEditingStudent={setEditingStudent} setEditingPlan={setEditingPlan}
          setNewSession={setNewSession} setNewNoti={setNewNoti}
        />

        {/* MOBILE FAB */}
        {role === 'coach' && ['students', 'curriculum', 'sessions', 'dashboard'].includes(activeTab) && (
          <button
            onClick={() => {
              if (activeTab === 'students') setEditingStudent({ name: '', targetGoal: '', notes: '', phone: '', email: '', level: '1.0-2.0', isPublic: true });
              else if (activeTab === 'curriculum') setEditingPlan({ titleVI: '', titleEN: '', descriptionVI: '', descriptionEN: '', skillsFocused: [], durationMin: 60, isPublic: true });
              else if (activeTab === 'sessions') {
                setNewSession({ studentId: '', lessonPlanId: '', date: new Date().toISOString().split('T')[0], durationMin: 60, status: 'Scheduled', skillScores: {}, isPublic: true, coachFeedbackVI: '', coachFeedbackEN: '', location: '' });
                setTimeout(() => document.getElementById('session-form-heading')?.scrollIntoView({ behavior: 'smooth' }), 100);
              } else if (activeTab === 'dashboard') setNewNoti({ titleVI: '', titleEN: '', contentVI: '', contentEN: '', type: 'info', isPublic: true });
            }}
            className="md:hidden fixed right-4 z-40 w-14 h-14 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-600/20 transition-all cursor-pointer"
          style={{ bottom: 'calc(4rem + var(--sab,0px) + 0.75rem)' }}
            title={lang === 'vi' ? 'Thêm mới' : 'Add New'}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}


        {/* PIN MODAL */}
        <PinModal
          lang={lang} t={t}
          isPinModalOpen={isPinModalOpen} setIsPinModalOpen={setIsPinModalOpen}
          isChangingPin={isChangingPin} setIsChangingPin={setIsChangingPin}
          pinInputValue={pinInputValue} setPinInputValue={setPinInputValue}
          pinModalError={pinModalError} setPinModalError={setPinModalError}
          dbCoachPin={dbCoachPin} setRole={setRole}
          setActiveTab={setActiveTabRaw} showToast={showToast}
          currentPinValueForChange={currentPinValueForChange}
          setCurrentPinValueForChange={setCurrentPinValueForChange}
          newPinValue1={newPinValue1} setNewPinValue1={setNewPinValue1}
          newPinValue2={newPinValue2} setNewPinValue2={setNewPinValue2}
        />

        {/* SKILL HISTORY MODAL */}
        {selectedSkillForHistory && (
          <SkillHistoryModal
            lang={lang}
            selectedSkillForHistory={selectedSkillForHistory}
            setSelectedSkillForHistory={setSelectedSkillForHistory}
            sessions={sessions}
            resolvedStudents={resolvedStudents}
            studentId={activeStudent?.id}
          />
        )}

      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
