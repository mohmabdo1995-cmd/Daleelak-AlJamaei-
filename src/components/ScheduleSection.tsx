import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lecture } from '../types';
import { StorageService } from '../services/storage';
import { NotificationService } from '../services/notifications';
import { 
  Calendar, Plus, Trash2, Edit3, CheckCircle2, Clock, MapPin, User, Search, 
  Filter, Bell, BellOff, Sparkles, AlertCircle, ArrowRight, Check, Play, Volume2,
  CalendarDays, ChevronRight, ChevronLeft, List, CalendarCheck, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from './common/Modal';

interface ScheduleSectionProps {
  onBack: () => void;
  openAddModalInitially?: boolean;
  onLecturesUpdated?: () => void;
}

const DAYS_OF_WEEK = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const SUBJECT_OPTIONS = ['Anatomy', 'Physiology', 'Biochemistry', 'Microbiology', 'Pathology', 'Pharmacology', 'عام / مقرر آخر'];

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ onBack, openAddModalInitially = false, onLecturesUpdated }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Calendar View State
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [calendarSubjectFilter, setCalendarSubjectFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(openAddModalInitially);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Notification Permission State
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    NotificationService.getPermissionState()
  );

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState(SUBJECT_OPTIONS[0]);
  const [formProfessor, setFormProfessor] = useState('');
  const [formHall, setFormHall] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('09:00');
  const [formDayOfWeek, setFormDayOfWeek] = useState(DAYS_OF_WEEK[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formNotifEnabled, setFormNotifEnabled] = useState(true);

  // Load lectures from persistent storage on mount
  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = () => {
    const data = StorageService.getLectures();
    setLectures(data);
  };

  const handleRequestNotifPermission = async () => {
    const granted = await NotificationService.requestPermission();
    setNotifPermission(NotificationService.getPermissionState());
    if (granted) {
      NotificationService.sendNotification('تم تفعيل التنبيهات بنجاح 🔔', {
        body: 'ستتلقى إشعارات فورية بمواعيد المحاضرات الأكاديمية.'
      });
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormSubject(SUBJECT_OPTIONS[0]);
    setFormProfessor('');
    setFormHall('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('09:00');
    setFormDayOfWeek(DAYS_OF_WEEK[0]);
    setFormNotes('');
    setFormPriority('medium');
    setFormNotifEnabled(true);
    setEditingLecture(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lec: Lecture) => {
    setEditingLecture(lec);
    setFormTitle(lec.title);
    setFormSubject(lec.subject);
    setFormProfessor(lec.professor || '');
    setFormHall(lec.hall || '');
    setFormDate(lec.date);
    setFormTime(lec.time);
    setFormDayOfWeek(lec.dayOfWeek);
    setFormNotes(lec.notes || '');
    setFormPriority(lec.priority);
    setFormNotifEnabled(lec.notificationEnabled);
    setIsModalOpen(true);
  };

  const handleSaveLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingLecture) {
      const updated: Lecture = {
        ...editingLecture,
        title: formTitle.trim(),
        subject: formSubject,
        professor: formProfessor.trim(),
        hall: formHall.trim(),
        date: formDate,
        time: formTime,
        dayOfWeek: formDayOfWeek,
        notes: formNotes.trim(),
        priority: formPriority,
        notificationEnabled: formNotifEnabled
      };
      StorageService.updateLecture(updated);
    } else {
      StorageService.addLecture({
        title: formTitle.trim(),
        subject: formSubject,
        professor: formProfessor.trim(),
        hall: formHall.trim(),
        date: formDate,
        time: formTime,
        dayOfWeek: formDayOfWeek,
        notes: formNotes.trim(),
        priority: formPriority,
        completed: false,
        notificationEnabled: formNotifEnabled
      });
    }

    loadLectures();
    onLecturesUpdated?.();
    setIsModalOpen(false);
    resetForm();
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleDeleteLecture = (id: string) => {
    if (confirm('هل أنت تأكد من رغبتك في حذف هذه المحاضرة؟')) {
      StorageService.deleteLecture(id);
      loadLectures();
      onLecturesUpdated?.();
    }
  };

  const handleToggleCompleted = (id: string) => {
    StorageService.toggleLectureCompleted(id);
    loadLectures();
    onLecturesUpdated?.();
  };

  const handleTestNotification = (lec: Lecture) => {
    NotificationService.notifyLectureDue(lec);
  };

  // Filter Logic
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredLectures = lectures.filter(lec => {
    // Search
    const matchesSearch = 
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lec.professor && lec.professor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lec.hall && lec.hall.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Subject Filter
    if (selectedSubjectFilter !== 'all' && lec.subject !== selectedSubjectFilter) {
      return false;
    }

    // Tab Filter
    if (filterTab === 'today') {
      return lec.date === todayStr;
    }
    if (filterTab === 'upcoming') {
      return lec.date >= todayStr && !lec.completed;
    }
    if (filterTab === 'past') {
      return lec.date < todayStr || lec.completed;
    }

    return true;
  });

  // Calendar Helpers & Calculations
  const handleAddLectureForDate = (dateStr: string) => {
    resetForm();
    setFormDate(dateStr);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayIdx = dateObj.getDay();
    setFormDayOfWeek(DAYS_OF_WEEK[dayIdx]);
    setIsModalOpen(true);
  };

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();

  const monthNameAr = calendarDate.toLocaleDateString('ar-EG', {
    month: 'long',
    year: 'numeric'
  });

  const goToPrevMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarDate(today);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  // Group lectures by date
  const lecturesByDate = React.useMemo(() => {
    const map: Record<string, Lecture[]> = {};
    lectures.forEach(lec => {
      if (!map[lec.date]) {
        map[lec.date] = [];
      }
      map[lec.date].push(lec);
    });
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [lectures]);

  const calendarCells = React.useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
    const daysInCurMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const cells: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
    }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(calendarYear, calendarMonth - 1, d);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        dateStr: `${y}-${m}-${dayStr}`,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurMonth; d++) {
      const y = calendarYear;
      const m = String(calendarMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        dateStr: `${y}-${m}-${dayStr}`,
        isCurrentMonth: true
      });
    }

    // Next month padding (total cells to 35 or 42)
    const totalNeeded = Math.ceil(cells.length / 7) * 7;
    const remaining = totalNeeded - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(calendarYear, calendarMonth + 1, d);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        dateStr: `${y}-${m}-${dayStr}`,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [calendarYear, calendarMonth]);

  const getSubjectColor = (subject: string) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('anat') || s.includes('تشريح')) {
      return {
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
        border: 'border-rose-300 dark:border-rose-800'
      };
    }
    if (s.includes('physio') || s.includes('وظائف')) {
      return {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        border: 'border-amber-300 dark:border-amber-800'
      };
    }
    if (s.includes('bio') || s.includes('كيمياء')) {
      return {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        border: 'border-emerald-300 dark:border-emerald-800'
      };
    }
    if (s.includes('micro') || s.includes('أحياء')) {
      return {
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-200 border-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500',
        border: 'border-purple-300 dark:border-purple-800'
      };
    }
    if (s.includes('patho') || s.includes('أمراض')) {
      return {
        badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800',
        dot: 'bg-cyan-500',
        border: 'border-cyan-300 dark:border-cyan-800'
      };
    }
    if (s.includes('pharm') || s.includes('أدوية')) {
      return {
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800',
        dot: 'bg-indigo-500',
        border: 'border-indigo-300 dark:border-indigo-800'
      };
    }
    return {
      badge: 'bg-[#BCEBFF]/50 text-[#071A3D] dark:bg-[#16958E]/30 dark:text-[#BCEBFF] border-[#16958E]/30',
      dot: 'bg-[#16958E]',
      border: 'border-[#16958E]/30'
    };
  };

  const monthLectures = lectures.filter(l => {
    const [y, m] = l.date.split('-');
    return Number(y) === calendarYear && Number(m) === calendarMonth + 1;
  });
  const monthLecturesCount = monthLectures.length;
  const monthCompletedCount = monthLectures.filter(l => l.completed).length;

  const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
  const selectedDateFormatted = selectedDateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const selectedDayLectures = (lecturesByDate[selectedDateStr] || []).filter(lec => {
    if (calendarSubjectFilter !== 'all' && lec.subject !== calendarSubjectFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 h-9 sm:h-10 px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] font-bold text-xs sm:text-sm transition-all mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للرئيسية</span>
          </button>

          <div className="flex items-center gap-2 text-[#16958E] dark:text-[#BCEBFF] font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#16958E]" />
            <span>القسم الثالث - التنظيم والتذكير</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-tajawal text-[#071A3D] dark:text-white mt-1">
            جدول المحاضرات والتذكيرات 🗓️
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            إدارة كاملة لمواعيد محاضراتك الأكاديمية مع التنبيهات الفورية والتخزين الدائم.
          </p>
        </div>

        {/* Action Controls - Unified height & proportion */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {notifPermission !== 'granted' && (
            <button
              onClick={handleRequestNotifPermission}
              className="flex-1 md:flex-none h-11 sm:h-12 px-4 sm:px-5 rounded-2xl bg-[#BCEBFF]/30 border border-[#16958E]/40 text-[#071A3D] dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#BCEBFF]/60 transition-all shadow-sm active:scale-95"
            >
              <Bell className="w-4 h-4 text-[#16958E] animate-bounce" />
              <span>تفعيل التنبيهات</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-none h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-[#071A3D] to-[#16958E] hover:from-[#0a2558] hover:to-[#1ba8a0] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#071A3D]/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>إضافة محاضرة جديدة</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Monthly Calendar View vs List View */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#BCEBFF]/50 dark:border-[#16958E]/20">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#BCEBFF]/25 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-none h-10 flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-gradient-to-r from-[#071A3D] to-[#16958E] text-white shadow-md'
                : 'text-[#071A3D] dark:text-slate-300 hover:text-[#16958E]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>عرض التقويم الشهري 🗓️</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-none h-10 flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-[#071A3D] to-[#16958E] text-white shadow-md'
                : 'text-[#071A3D] dark:text-slate-300 hover:text-[#16958E]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>عرض القائمة والبطاقات 📋</span>
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تصفية المادة:</span>
            <select
              value={calendarSubjectFilter}
              onChange={(e) => setCalendarSubjectFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-xs font-bold text-[#071A3D] dark:text-white outline-none focus:ring-2 focus:ring-[#16958E]"
            >
              <option value="all">جميع المواد ({lectures.length})</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 1. MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Month Header & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm">
            
            {/* Prev / Next Month Nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                title="الشهر السابق"
                className="w-10 h-10 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] border border-[#16958E]/30 flex items-center justify-center transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="text-center px-4 min-w-[180px]">
                <h2 className="text-xl sm:text-2xl font-black font-tajawal text-[#071A3D] dark:text-white">
                  {monthNameAr}
                </h2>
                <span className="text-[11px] text-[#16958E] dark:text-[#BCEBFF] font-medium">
                  {calendarYear} م
                </span>
              </div>

              <button
                onClick={goToNextMonth}
                title="الشهر القادم"
                className="w-10 h-10 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] border border-[#16958E]/30 flex items-center justify-center transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Monthly Stats */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToToday}
                className="h-10 px-4 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#BCEBFF]" />
                <span>العودة لليوم</span>
              </button>

              <div className="h-10 flex items-center gap-2 px-3.5 rounded-xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/40 dark:border-[#16958E]/30 text-xs font-medium">
                <span className="text-slate-500 dark:text-slate-400">محاضرات الشهر:</span>
                <span className="font-bold font-mono text-[#071A3D] dark:text-white">{monthLecturesCount}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{monthCompletedCount} مكتملة</span>
              </div>
            </div>

          </div>

          {/* Subject Color Legend */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl bg-[#BCEBFF]/15 dark:bg-[#071A3D]/40 border border-[#BCEBFF]/30 text-xs font-medium">
            <span className="text-slate-500 font-bold ml-1">دليل المواد:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Anatomy (تشريح)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Physiology (وظائف)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Biochemistry (كيمياء)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Microbiology (أحياء)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Pathology (أمراض)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Pharmacology (أدوية)</span>
            </span>
          </div>

          {/* Interactive Monthly Calendar Grid */}
          <div className="rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 p-2 sm:p-5 shadow-lg overflow-hidden">
            
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {DAYS_OF_WEEK.map((dayName) => (
                <div
                  key={dayName}
                  className="py-2.5 text-center font-bold font-tajawal text-xs sm:text-sm text-[#071A3D] dark:text-[#BCEBFF] bg-[#BCEBFF]/20 dark:bg-[#071A3D]/80 rounded-xl border border-[#BCEBFF]/40 dark:border-[#16958E]/20"
                >
                  <span className="hidden sm:inline">{dayName}</span>
                  <span className="sm:hidden">{dayName.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell, idx) => {
                const dayLectures = (lecturesByDate[cell.dateStr] || []).filter(l => {
                  if (calendarSubjectFilter !== 'all' && l.subject !== calendarSubjectFilter) return false;
                  return true;
                });
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDateStr;
                const completedCount = dayLectures.filter(l => l.completed).length;

                return (
                  <div
                    key={cell.dateStr + '-' + idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[75px] sm:min-h-[115px] p-1.5 sm:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-[#16958E] ring-2 ring-[#16958E] bg-[#16958E]/10 dark:bg-[#16958E]/20 shadow-md'
                        : isToday
                        ? 'border-[#16958E] bg-[#BCEBFF]/15 dark:bg-[#071A3D]/70 shadow-sm'
                        : cell.isCurrentMonth
                        ? 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#071A3D]/30 hover:border-[#16958E]/50 hover:bg-[#BCEBFF]/10'
                        : 'border-transparent bg-transparent opacity-35 hover:opacity-75'
                    }`}
                  >
                    {/* Top Row in Day Cell: Number & Badges */}
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs sm:text-sm font-bold font-mono ${
                          isToday
                            ? 'w-6 h-6 rounded-full bg-[#16958E] text-white flex items-center justify-center font-bold text-xs shadow-sm'
                            : isSelected
                            ? 'text-[#16958E] font-black'
                            : cell.isCurrentMonth
                            ? 'text-[#071A3D] dark:text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* Day events indicator */}
                      {dayLectures.length > 0 && (
                        <div className="flex items-center gap-1">
                          {isToday && (
                            <span className="hidden sm:inline px-1.5 py-0.5 rounded-md bg-[#16958E]/20 text-[#16958E] dark:text-[#BCEBFF] text-[9px] font-bold">
                              اليوم
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              completedCount === dayLectures.length
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-[#071A3D] text-white dark:bg-[#16958E] dark:text-white'
                            }`}
                            title={`${dayLectures.length} محاضرات (${completedCount} مكتملة)`}
                          >
                            {dayLectures.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle Section: Lectures badges */}
                    <div className="space-y-1 my-1 flex-1 overflow-hidden">
                      {/* Desktop View: Mini Pills */}
                      <div className="hidden sm:block space-y-1">
                        {dayLectures.slice(0, 2).map((lec) => {
                          const col = getSubjectColor(lec.subject);
                          return (
                            <div
                              key={lec.id}
                              title={`${lec.title} (${lec.time} - ${lec.subject})`}
                              className={`px-1.5 py-0.5 rounded-md text-[10px] truncate flex items-center gap-1 font-medium border ${col.badge} ${
                                lec.completed ? 'line-through opacity-60' : ''
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${col.dot}`} />
                              <span className="font-mono text-[9px] font-bold">{lec.time}</span>
                              <span className="truncate">{lec.title}</span>
                              {lec.priority === 'high' && <span>🔥</span>}
                            </div>
                          );
                        })}
                        {dayLectures.length > 2 && (
                          <div className="text-[10px] font-bold text-[#16958E] text-center">
                            +{dayLectures.length - 2} المزيد
                          </div>
                        )}
                      </div>

                      {/* Mobile View: Color Dots */}
                      <div className="flex sm:hidden flex-wrap items-center gap-1 pt-1">
                        {dayLectures.slice(0, 4).map((lec) => {
                          const col = getSubjectColor(lec.subject);
                          return (
                            <span
                              key={lec.id}
                              className={`w-2 h-2 rounded-full ${col.dot} ${
                                lec.completed ? 'opacity-40' : ''
                              }`}
                            />
                          );
                        })}
                        {dayLectures.length > 4 && (
                          <span className="text-[9px] text-[#16958E] font-bold">+</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Button on Hover/Tap */}
                    <div className="pt-0.5 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddLectureForDate(cell.dateStr);
                        }}
                        title={`إضافة محاضرة في يوم ${cell.day}`}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-[#16958E] text-white hover:bg-[#127d77] transition-opacity text-[10px]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Selected Day Detailed Panel (أحداث اليوم المحدد) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-md">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#BCEBFF]/40 dark:border-[#16958E]/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#16958E] text-white flex items-center justify-center shadow-md">
                  <CalendarDays className="w-6 h-6 text-[#BCEBFF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black font-tajawal text-[#071A3D] dark:text-white">
                      محاضرات ومهام: {selectedDateFormatted}
                    </h3>
                    {selectedDateStr === todayStr && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#16958E] text-white font-bold text-[10px]">
                        اليوم 📍
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDayLectures.length === 0
                      ? 'لا توجد محاضرات مجدولة لهذا اليوم حتى الآن'
                      : `${selectedDayLectures.length} محاضرات مجدولة (${selectedDayLectures.filter(l => l.completed).length} مكتملة)`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAddLectureForDate(selectedDateStr)}
                className="px-5 py-2.5 rounded-xl bg-[#16958E] hover:bg-[#127d77] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة محاضرة في هذا اليوم</span>
              </button>
            </div>

            {/* List of Lectures for Selected Day */}
            {selectedDayLectures.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-[#16958E]/40 mx-auto mb-3" />
                <h4 className="text-base font-bold font-tajawal text-[#071A3D] dark:text-white">
                  يوم دراسي فارغ أو راحة أكاديمية ✨
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  يمكنك استغلال هذا اليوم في المذاكرة والمراجعة، أو إضافة محاضرة أو تكليف أكاديمي جديد.
                </p>
                <button
                  onClick={() => handleAddLectureForDate(selectedDateStr)}
                  className="mt-4 px-5 py-2 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs shadow transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة محاضرة لهذا اليوم</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {selectedDayLectures.map((lec) => {
                  const col = getSubjectColor(lec.subject);
                  return (
                    <div
                      key={lec.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        lec.completed
                          ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-slate-200'
                          : 'bg-white dark:bg-[#071A3D] border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.badge}`}>
                            {lec.subject}
                          </span>
                          {lec.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px]">
                              مهمة جداً 🔥
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTestNotification(lec)}
                            title="تجربة الإشعار"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#16958E] hover:bg-[#BCEBFF]/20"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(lec)}
                            title="تعديل المحاضرة"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#16958E] hover:bg-[#BCEBFF]/20"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLecture(lec.id)}
                            title="حذف المحاضرة"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className={`text-base font-extrabold font-tajawal mb-2 ${lec.completed ? 'line-through text-slate-400' : 'text-[#071A3D] dark:text-white'}`}>
                        {lec.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 mb-3">
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 text-[#16958E]" />
                          <span>{lec.time}</span>
                        </div>
                        {lec.hall && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60">
                            <MapPin className="w-3.5 h-3.5 text-[#16958E]" />
                            <span className="truncate">{lec.hall}</span>
                          </div>
                        )}
                        {lec.professor && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 col-span-2">
                            <User className="w-3.5 h-3.5 text-[#16958E]" />
                            <span className="truncate">{lec.professor}</span>
                          </div>
                        )}
                      </div>

                      {lec.notes && (
                        <p className="text-xs text-slate-500 mb-3 bg-[#BCEBFF]/10 dark:bg-[#071A3D]/50 p-2.5 rounded-xl border border-[#BCEBFF]/20">
                          {lec.notes}
                        </p>
                      )}

                      <div className="pt-3 border-t border-[#BCEBFF]/30 dark:border-[#16958E]/20 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleCompleted(lec.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            lec.completed
                              ? 'bg-[#16958E]/20 text-[#16958E] border border-[#16958E]/30'
                              : 'bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D]'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${lec.completed ? 'text-[#16958E]' : 'text-slate-400'}`} />
                          <span>{lec.completed ? 'تمت المحاضرة' : 'تحديد كـ منتهية'}</span>
                        </button>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          {lec.notificationEnabled ? <Bell className="w-3.5 h-3.5 text-[#16958E]" /> : <BellOff className="w-3.5 h-3.5" />}
                          {lec.notificationEnabled ? 'تنبيه مفعّل' : 'بدون'}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* 2. CARDS / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-8 animate-fade-in">
          {/* Filter Tabs & Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            
            {/* Tabs */}
            <div className="md:col-span-7 flex items-center gap-1 bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 p-1.5 rounded-2xl border border-[#BCEBFF]/50 dark:border-[#16958E]/30 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 min-w-[90px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  filterTab === 'all'
                    ? 'bg-[#071A3D] text-white shadow-sm'
                    : 'text-[#071A3D] dark:text-slate-300 hover:text-[#16958E]'
                }`}
              >
                الكل ({lectures.length})
              </button>

              <button
                onClick={() => setFilterTab('today')}
                className={`flex-1 min-w-[90px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  filterTab === 'today'
                    ? 'bg-[#071A3D] text-white shadow-sm'
                    : 'text-[#071A3D] dark:text-slate-300 hover:text-[#16958E]'
                }`}
              >
                محاضرات اليوم
              </button>

              <button
                onClick={() => setFilterTab('upcoming')}
                className={`flex-1 min-w-[90px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  filterTab === 'upcoming'
                    ? 'bg-[#071A3D] text-white shadow-sm'
                    : 'text-[#071A3D] dark:text-slate-300 hover:text-[#16958E]'
                }`}
              >
                القادمة
              </button>

              <button
                onClick={() => setFilterTab('past')}
                className={`flex-1 min-w-[90px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  filterTab === 'past'
                    ? 'bg-[#071A3D] text-white shadow-sm'
                    : 'text-[#071A3D] dark:text-slate-300 hover:text-[#16958E]'
                }`}
              >
                السابقة / المنتهية
              </button>
            </div>

            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، المادة، الدكتور، أو المدرج..."
                className="w-full pr-11 pl-4 py-3 rounded-2xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#16958E] transition-all shadow-sm"
              />
            </div>

          </div>

          {/* Lectures List */}
          {filteredLectures.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 my-8 shadow-sm">
              <Calendar className="w-16 h-16 text-[#16958E]/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-2">لا توجد محاضرات في هذا العرض</h3>
              <p className="text-slate-500 text-sm mb-6">قم بإضافة محاضرة جديدة أو تغيير خيارات البحث والتصفية.</p>
              <button
                onClick={handleOpenAddModal}
                className="px-6 py-3 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة محاضرة جديدة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredLectures.map((lec) => (
                  <motion.div
                    key={lec.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-6 rounded-3xl bg-white dark:bg-[#071A3D] border ${
                      lec.completed
                        ? 'opacity-65 border-[#BCEBFF]/40 dark:border-[#16958E]/20 bg-[#BCEBFF]/10 dark:bg-[#071A3D]/40'
                        : lec.date === todayStr
                        ? 'border-[#16958E] shadow-lg shadow-[#16958E]/10 ring-1 ring-[#16958E]'
                        : 'border-[#BCEBFF]/80 dark:border-[#16958E]/30'
                    } transition-all duration-300 flex flex-col justify-between shadow-sm`}
                  >
                    <div>
                      {/* Top Subject Tag & Options */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#BCEBFF]/40 text-[#071A3D] font-bold text-xs border border-[#16958E]/30">
                            {lec.subject}
                          </span>

                          {lec.priority === 'high' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                              مهمة جداً 🔥
                            </span>
                          )}

                          {lec.date === todayStr && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#16958E] text-white font-bold text-[10px] animate-pulse">
                              اليوم 📍
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTestNotification(lec)}
                            title="تجربة إشعار التذكير"
                            className="p-2 rounded-xl text-slate-400 hover:text-[#16958E] hover:bg-[#BCEBFF]/20 transition-all"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(lec)}
                            title="تعديل المحاضرة"
                            className="p-2 rounded-xl text-slate-400 hover:text-[#16958E] hover:bg-[#BCEBFF]/20 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteLecture(lec.id)}
                            title="حذف المحاضرة"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-[#BCEBFF]/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lecture Title */}
                      <h3 className={`text-xl font-bold font-tajawal mb-4 ${lec.completed ? 'line-through text-slate-400' : 'text-[#071A3D] dark:text-white'}`}>
                        {lec.title}
                      </h3>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
                          <Clock className="w-4 h-4 text-[#16958E]" />
                          <span className="font-mono font-bold text-[#071A3D] dark:text-slate-200">{lec.time}</span>
                          <span>({lec.dayOfWeek})</span>
                        </div>

                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
                          <Calendar className="w-4 h-4 text-[#071A3D] dark:text-[#BCEBFF]" />
                          <span className="font-mono text-[#071A3D] dark:text-slate-200">{lec.date}</span>
                        </div>

                        {lec.professor && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 col-span-2 sm:col-span-1">
                            <User className="w-4 h-4 text-[#16958E]" />
                            <span className="truncate">{lec.professor}</span>
                          </div>
                        )}

                        {lec.hall && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 col-span-2 sm:col-span-1">
                            <MapPin className="w-4 h-4 text-[#16958E]" />
                            <span className="truncate">{lec.hall}</span>
                          </div>
                        )}
                      </div>

                      {lec.notes && (
                        <div className="p-3 rounded-xl bg-[#BCEBFF]/15 dark:bg-[#071A3D]/40 text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed border border-[#BCEBFF]/30">
                          <strong className="text-[#071A3D] dark:text-slate-200 block mb-1">ملاحظات:</strong>
                          {lec.notes}
                        </div>
                      )}
                    </div>

                    {/* Footer Complete Button */}
                    <div className="pt-3 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleCompleted(lec.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          lec.completed
                            ? 'bg-[#16958E]/20 text-[#16958E] border border-[#16958E]/30'
                            : 'bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D]'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${lec.completed ? 'text-[#16958E]' : 'text-slate-400'}`} />
                        <span>{lec.completed ? 'تمت الحضور والمذاكرة' : 'تحديد كـ منتهية'}</span>
                      </button>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        {lec.notificationEnabled ? <Bell className="w-3.5 h-3.5 text-[#16958E]" /> : <BellOff className="w-3.5 h-3.5" />}
                        {lec.notificationEnabled ? 'تذكير مُمكّن' : 'بدون تذكير'}
                      </span>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Lecture Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingLecture ? 'تعديل بيانات المحاضرة' : 'إضافة محاضرة جديدة إلى الجدول'}
        subtitle="توثيق موعد القاعة والمحاضر في الجدول الدراسي"
        icon={<Calendar className="w-5 h-5 text-[#16958E]" />}
      >
        <form onSubmit={handleSaveLecture} className="space-y-4 text-right">
              {/* Lecture Name */}
              <div>
                <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                  اسم المحاضرة / العنوان الأكاديمي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: Anatomy - Upper Limb Brachial Plexus"
                  className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none"
                />
              </div>

              {/* Subject Select */}
              <div>
                <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                  المادة الأكاديمية
                </label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                    تاريخ المحاضرة
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm font-mono focus:ring-2 focus:ring-[#16958E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                    وقت المحاضرة
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm font-mono focus:ring-2 focus:ring-[#16958E] outline-none"
                  />
                </div>
              </div>

              {/* Day & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                    يوم الأسبوع
                  </label>
                  <select
                    value={formDayOfWeek}
                    onChange={(e) => setFormDayOfWeek(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                    درجة الأهمية
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none"
                  >
                    <option value="high">عالية جداً (امتحان/مهم)</option>
                    <option value="medium">متوسطة (محاضرة أساسية)</option>
                    <option value="low">منخفضة (حضور اختيارية)</option>
                  </select>
                </div>
              </div>

              {/* Professor & Hall */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                    اسم الأستاذ / الدكتور
                  </label>
                  <input
                    type="text"
                    value={formProfessor}
                    onChange={(e) => setFormProfessor(e.target.value)}
                    placeholder="أ.د. محمد أحمد"
                    className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                    القاعة / المدرج
                  </label>
                  <input
                    type="text"
                    value={formHall}
                    onChange={(e) => setFormHall(e.target.value)}
                    placeholder="مدرج A3"
                    className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1">
                  ملاحظات أو مهام خاصة بالمحاضرة
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات المذاكرة، تحضير الأدوات..."
                  className="w-full px-4 py-3 rounded-xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/60 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none resize-none"
                />
              </div>

              {/* Notification Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="notifCheck"
                  checked={formNotifEnabled}
                  onChange={(e) => setFormNotifEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#16958E] rounded border-slate-300 focus:ring-[#16958E]"
                />
                <label htmlFor="notifCheck" className="text-xs font-bold text-[#071A3D] dark:text-slate-300 cursor-pointer">
                  تفعيل التنبيه التلقائي للمتصفح عند حلول موعد المحاضرة
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] font-bold text-xs"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs shadow-md transition-all"
                >
                  {editingLecture ? 'حفظ التعديلات' : 'إضافة المحاضرة'}
                </button>
              </div>
            </form>
      </Modal>

    </div>
  );
};
