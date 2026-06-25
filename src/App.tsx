import React, { Suspense, useEffect, lazy } from 'react';
import { useApp, compressImage } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PinModal from './components/PinModal';
import SkillHistoryModal from './components/SkillHistoryModal';
import AudioPlayer from './components/AudioPlayer';
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
    handleAddMedia, showToast, translateViToEn, sortedNotifications,
    isMobileMenuOpen, setIsMobileMenuOpen, isMobileSearchOpen, setIsMobileSearchOpen,
    isNotiHistoryOpen, setIsNotiHistoryOpen, selectedNotiId, setSelectedNotiId, toastMessage, futureIdeas, votedIdeas, setVotedIdeas,
    isFutureIdeasOpen, setIsFutureIdeasOpen, chartContainerRefForHistory,
    isPinModalOpen, setIsPinModalOpen, isChangingPin, setIsChangingPin,
    pinInputValue, setPinInputValue, pinModalError, setPinModalError,
    dbCoachPin, setRole, setActiveTab: setActiveTabRaw,
    currentPinValueForChange, setCurrentPinValueForChange,
    newPinValue1, setNewPinValue1, newPinValue2, setNewPinValue2,
    handleRoleToggle, handleLangToggle, handleThemeToggle,
    translationTimeoutRef,
    setCustomLegendNotes,
    syncCoach,
  } = useApp();

  // Scroll to selected notification
  useEffect(() => {
    if (!selectedNotiId) return;
    const el = document.getElementById(`noti-${selectedNotiId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedNotiId]);

  // Toast notification bar
  const ToastBar = toastMessage ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-zinc-800/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 dark:border-zinc-700 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-slideDown pointer-events-auto max-w-[90vw] text-center">
      {toastMessage}
    </div>
  ) : null;

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans antialiased transition-colors duration-300`}>
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
          sortedNotifications={sortedNotifications}
        />

          <main className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-24 md:py-6" id="protpick-main-canvas">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
          {/* NOTIFICATION CENTER - always visible */}
          {(() => {
            const visible = sortedNotifications.filter(n => role === 'coach' || n.isPublic);
            const focus = selectedNotiId ? visible.find(n => n.id === selectedNotiId) : null;
            const latestNoti = focus || visible[0];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 col-span-1 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/60 rounded-3xl p-6 shadow-md dark:shadow-none transition-all relative overflow-hidden flex flex-col justify-between" id="protpick-notification-center">
                  <div className="absolute right-4 top-4 opacity-[0.06] dark:opacity-10 pointer-events-none">
                    <Bell className="w-24 h-24 text-rose-500 dark:text-rose-400/60" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest font-mono">
                      <Bell className="w-4 h-4 animate-bounce text-rose-600 dark:text-rose-400" />
                      <span>{t.notifications}</span>
                    </div>
                    {latestNoti ? (
                      <div id={`noti-${latestNoti.id}`} className={`space-y-2 transition-all duration-300 ${
                        selectedNotiId === latestNoti.id ? 'ring-2 ring-rose-500/30 rounded-2xl p-4 -m-4' : ''
                      }`}>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                          {lang === 'vi' ? latestNoti.titleVI : latestNoti.titleEN}
                        </h3>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans max-w-2xl">
                          {lang === 'vi' ? latestNoti.contentVI : latestNoti.contentEN}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          <span className="bg-zinc-100 dark:bg-zinc-800/40 px-2 py-0.5 rounded font-bold">{latestNoti.date}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider border ${
                            latestNoti.type === 'success'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/30'
                              : latestNoti.type === 'warning'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/30'
                                : 'bg-sky-500/10 text-sky-600 dark:text-sky-450 border-sky-500/30'
                          }`}>
                            {t[`noti${latestNoti.type.charAt(0).toUpperCase() + latestNoti.type.slice(1) as 'Success' | 'Warning' | 'Info'}`]}
                          </span>
                          {!latestNoti.isPublic && <span className="bg-zinc-150 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 text-[8px] border border-zinc-200 dark:border-zinc-750 px-1.5 py-0.5 rounded-md font-bold">Private</span>}
                          {role === 'coach' && (
                            <button type="button" onClick={() => handleDeleteNoti(latestNoti.id)}
                              className="text-zinc-500 hover:text-rose-500 hover:underline transition-colors ml-auto cursor-pointer font-bold">Delete Announcement</button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">{t.noNoti}</p>
                    )}
                  </div>
                  {role === 'coach' && !newNoti && (
                    <button type="button" onClick={() => setNewNoti({ titleVI: '', titleEN: '', contentVI: '', contentEN: '', type: 'info', isPublic: true })}
                      className="mt-4 text-xs text-rose-650 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-extrabold flex items-center gap-1 cursor-pointer transition-colors">
                      <Plus className="w-3.5 h-3.5" /> {t.sendNotification}
                    </button>
                  )}
                  {newNoti && (
                    <form onSubmit={handleSaveNoti} className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3 text-zinc-900 dark:text-zinc-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">Tiêu đề (VI)</label>
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
                            className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">Title (EN)</label>
                          <input type="text" required value={newNoti.titleEN || ''}
                            onChange={(e) => setNewNoti({ ...newNoti, titleEN: e.target.value })}
                            className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">Nội dung (VI)</label>
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
                            className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl h-20 focus:outline-none focus:ring-1 focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold font-sans">Content (EN)</label>
                          <textarea required value={newNoti.contentEN || ''}
                            onChange={(e) => setNewNoti({ ...newNoti, contentEN: e.target.value })}
                            className="w-full text-xs p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 text-zinc-900 dark:text-zinc-100 rounded-xl h-20 focus:outline-none focus:ring-1 focus:ring-rose-500" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <select value={newNoti.type || 'info'}
                            onChange={(e) => setNewNoti({ ...newNoti, type: e.target.value as 'info' | 'success' | 'warning' })}
                            className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-750 rounded-xl p-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500">
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                          </select>
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-650 dark:text-zinc-300">
                            <input type="checkbox" checked={newNoti.isPublic ?? true}
                              onChange={(e) => setNewNoti({ ...newNoti, isPublic: e.target.checked })}
                              className="accent-rose-500 rounded cursor-pointer" />
                            <span>{t.notiPublicToggle}</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setNewNoti(null)}
                            className="px-3.5 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-400 rounded-xl cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                          <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors">{t.addNotiBtn}</button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'dashboard' && (
            <DashboardTab
              t={t} lang={lang} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              filteredStudents={filteredStudents} sessions={sessions}
              resolvedStudents={resolvedStudents} skillsList={skillsList}
              getAverageRating={getAverageRating}
              setActiveTab={setActiveTab} setSelectedStudentId={setSelectedStudentId}
            />
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
            className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer"
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
          />
        )}

        {/* AUDIO PLAYER */}
        <AudioPlayer lang={lang} role={role} />
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
