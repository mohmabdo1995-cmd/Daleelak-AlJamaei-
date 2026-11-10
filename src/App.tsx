import React, { useState, useEffect } from 'react';
import { ActivePage, SubjectId, Lecture } from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { FirebaseService, SiteConfig, DEFAULT_SITE_CONFIG } from './services/firebase';
import { AdminAuthService } from './services/adminAuth';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingHero } from './components/LandingHero';
import { MainDashboard } from './components/MainDashboard';
import { CollegeInfoSection } from './components/CollegeInfoSection';
import { SubjectsSection } from './components/SubjectsSection';
import { ScheduleSection } from './components/ScheduleSection';
import { StudyResourcesSection } from './components/StudyResourcesSection';
import { GpaCalculatorModal } from './components/GpaCalculatorModal';
import { PomodoroTimerModal } from './components/PomodoroTimerModal';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboardLayout } from './components/admin/AdminDashboardLayout';
import { ArticlesSection } from './components/ArticlesSection';
import { VideoLibrarySection } from './components/VideoLibrarySection';
import { NewsTickerBar } from './components/NewsTickerBar';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | undefined>(undefined);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  
  // Real-time Firestore Site Config
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  // Hidden Admin State
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Modals
  const [isGpaOpen, setIsGpaOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [openScheduleAddModal, setOpenScheduleAddModal] = useState(false);

  // Detect URL path or hash for hidden /admin route
  useEffect(() => {
    const checkAdminPath = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      if (pathname === '/admin' || hash === '#admin') {
        setIsAdminRoute(true);
        setIsAdminAuthenticated(AdminAuthService.isAuthenticated());
      } else {
        setIsAdminRoute(false);
      }
    };

    checkAdminPath();
    window.addEventListener('popstate', checkAdminPath);
    window.addEventListener('hashchange', checkAdminPath);

    return () => {
      window.removeEventListener('popstate', checkAdminPath);
      window.removeEventListener('hashchange', checkAdminPath);
    };
  }, []);

  // Real-time Firestore Site Configuration Subscription
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeSiteConfig((config) => {
      setSiteConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Enforce Light Mode & Load Settings/Lectures on Mount
  useEffect(() => {
    // Force Light Mode on desktop and site-wide
    document.documentElement.classList.remove('dark');
    StorageService.saveSettings({ theme: 'light' });

    // Refresh lectures
    const lecs = StorageService.getLectures();
    setLectures(lecs);

    // Start background notification scheduler
    NotificationService.startScheduler(() => StorageService.getLectures());

    // Dismiss initial HTML splash screen once React has painted its root component
    const splashTimer = setTimeout(() => {
      const dismiss = (window as unknown as { __dismissSplash?: () => void }).__dismissSplash;
      if (typeof dismiss === 'function') {
        dismiss();
      } else {
        const splash = document.getElementById('app-splash');
        if (splash) {
          document.body.classList.add('app-mounted');
          splash.classList.add('splash-fade-out');
          setTimeout(() => splash.remove(), 480);
        }
      }
    }, 80);

    return () => {
      clearTimeout(splashTimer);
      NotificationService.stopScheduler();
    };
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.remove('dark');
    StorageService.saveSettings({ theme: 'light' });
  };

  const handleNavigate = (page: ActivePage, subjectId?: SubjectId) => {
    setActivePage(page);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAdminView = () => {
    setIsAdminRoute(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    } else if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingCount = lectures.filter(l => l.date >= todayStr && !l.completed).length;

  // 1. If user is on /admin route and authenticated -> Render Full Admin Dashboard
  if (isAdminRoute && isAdminAuthenticated) {
    return <AdminDashboardLayout onCloseAdmin={exitAdminView} />;
  }

  // 2. If user is on /admin route but not authenticated -> Render Admin Password Login Screen
  if (isAdminRoute && !isAdminAuthenticated) {
    return (
      <AdminLoginModal
        onSuccess={() => setIsAdminAuthenticated(true)}
        onCancel={exitAdminView}
      />
    );
  }

  // 3. Public Web App view (No admin links visible to visitors)
  const vis = siteConfig.sectionVisibility || DEFAULT_SITE_CONFIG.sectionVisibility;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#071A3D] text-[#071A3D] dark:text-white transition-colors duration-300 font-cairo" dir="rtl">
      
      {/* Header Bar */}
      <Header
        activePage={activePage}
        setActivePage={(p) => handleNavigate(p)}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenGpa={() => setIsGpaOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenAddLecture={() => {
          setOpenScheduleAddModal(true);
          handleNavigate('schedule');
        }}
      />

      {/* Breaking News Ticker Bar directly under Header */}
      <NewsTickerBar
        siteConfig={siteConfig}
        onNavigate={(p) => handleNavigate(p)}
      />

      {/* Main Content Render */}
      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingHero
            onEnter={() => handleNavigate('main')}
            siteConfig={siteConfig}
          />
        )}

        {activePage === 'main' && (
          <MainDashboard
            onNavigate={(p) => handleNavigate(p)}
            lectureCount={lectures.length}
            upcomingCount={upcomingCount}
            lectures={lectures}
          />
        )}

        {activePage === 'college' && vis.collegeInfoSection !== false && (
          <CollegeInfoSection
            onBack={() => handleNavigate('main')}
            onNavigateToSubjects={() => handleNavigate('subjects')}
          />
        )}

        {(activePage === 'subjects' || activePage === 'subject-detail') && vis.subjectsSection !== false && (
          <SubjectsSection
            onBack={() => handleNavigate('main')}
            initialSelectedId={selectedSubjectId}
          />
        )}

        {activePage === 'schedule' && vis.scheduleSection !== false && (
          <ScheduleSection
            onBack={() => handleNavigate('main')}
            openAddModalInitially={openScheduleAddModal}
            onLecturesUpdated={() => setLectures(StorageService.getLectures())}
          />
        )}

        {activePage === 'resources' && vis.resourcesSection !== false && (
          <StudyResourcesSection
            onBack={() => handleNavigate('main')}
            onNavigateToSubject={(subId) => handleNavigate('subjects', subId as SubjectId)}
          />
        )}

        {activePage === 'articles' && (
          <ArticlesSection
            onBack={() => handleNavigate('main')}
          />
        )}

        {activePage === 'videos' && (
          <VideoLibrarySection
            onBack={() => handleNavigate('main')}
          />
        )}
      </main>

      {/* Footer */}
      {vis.contactFooter !== false && (
        <Footer onNavigate={(p) => handleNavigate(p)} />
      )}

      {/* Modals & Tools */}
      {vis.gpaCalculator !== false && (
        <GpaCalculatorModal isOpen={isGpaOpen} onClose={() => setIsGpaOpen(false)} />
      )}
      {vis.pomodoroTimer !== false && (
        <PomodoroTimerModal isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />
      )}
      
      {/* PWA Install Prompt */}
      {vis.pwaInstallPrompt !== false && (
        <PwaInstallPrompt />
      )}

    </div>
  );
}

