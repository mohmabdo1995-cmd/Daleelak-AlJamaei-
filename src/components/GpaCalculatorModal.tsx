import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Award, RotateCcw } from 'lucide-react';
import { GpaCourse } from '../types';
import { StorageService } from '../services/storage';
import { Modal } from './common/Modal';

interface GpaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_SCALE = [
  { letter: 'A+', point: 4.0 },
  { letter: 'A', point: 3.75 },
  { letter: 'B+', point: 3.5 },
  { letter: 'B', point: 3.0 },
  { letter: 'C+', point: 2.5 },
  { letter: 'C', point: 2.0 },
  { letter: 'D+', point: 1.5 },
  { letter: 'D', point: 1.0 },
  { letter: 'F', point: 0.0 }
];

export const GpaCalculatorModal: React.FC<GpaCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [courses, setCourses] = useState<GpaCourse[]>([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState<number>(3);
  const [newCourseGrade, setNewCourseGrade] = useState<number>(4.0);

  useEffect(() => {
    if (isOpen) {
      setCourses(StorageService.getGpaCourses());
    }
  }, [isOpen]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const matchedGrade = GRADE_SCALE.find(g => g.point === newCourseGrade) || GRADE_SCALE[0];
    const newCourse: GpaCourse = {
      id: 'gpa-' + Date.now(),
      name: newCourseName.trim(),
      credits: Number(newCourseCredits),
      gradePoint: newCourseGrade,
      gradeLetter: matchedGrade.letter
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    StorageService.saveGpaCourses(updated);

    setNewCourseName('');
    setNewCourseCredits(3);
    setNewCourseGrade(4.0);
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    StorageService.saveGpaCourses(updated);
  };

  const handleReset = () => {
    setCourses([]);
    StorageService.saveGpaCourses([]);
  };

  // Calculation
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const totalPoints = courses.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title="حاسبة المعدل التراكمي (GPA)"
      subtitle="حساب الساعات والدرجات التقديرية بدقة"
      icon={<Calculator className="w-5 h-5 text-[#16958E]" />}
    >
      <div className="space-y-6">
        {/* GPA Result Display Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071A3D] via-[#0a2558] to-[#16958E] text-white flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-[#BCEBFF] font-bold block mb-1">المعدل التراكمي المحسوب</span>
            <div className="text-4xl font-extrabold font-mono tracking-tight">{gpa} / 4.00</div>
            <span className="text-xs text-[#BCEBFF]/90 mt-1 block">إجمالي الساعات المعتمدة: {totalCredits} ساعة</span>
          </div>
          <Award className="w-14 h-14 text-[#BCEBFF] opacity-80" />
        </div>

        {/* Add Course Form */}
        <form onSubmit={handleAddCourse} className="p-4 rounded-2xl bg-[#BCEBFF]/10 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 space-y-3">
          <div className="font-bold text-xs text-[#071A3D] dark:text-slate-300">إضافة مادة جديدة للحساب:</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="اسم المادة (Anatomy...)"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-xs focus:ring-2 focus:ring-[#16958E] outline-none"
            />

            <input
              type="number"
              min={1}
              max={6}
              placeholder="الساعات (3)"
              value={newCourseCredits}
              onChange={(e) => setNewCourseCredits(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-xs font-mono focus:ring-2 focus:ring-[#16958E] outline-none"
            />

            <select
              value={newCourseGrade}
              onChange={(e) => setNewCourseGrade(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-xs focus:ring-2 focus:ring-[#16958E] outline-none"
            >
              {GRADE_SCALE.map((g) => (
                <option key={g.letter} value={g.point}>
                  {g.letter} ({g.point})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إلى قائمة المواد</span>
          </button>
        </form>

        {/* Courses Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
            <span>المقررات المضافة ({courses.length})</span>
            {courses.length > 0 && (
              <button onClick={handleReset} className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" /> إعادة ضبط
              </button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="p-4 rounded-xl text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
              لم تقم بإضافة مواد بعد. أدخل اسم المادة والساعات والتقدير بالأعلى واضغط إضافة.
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="p-3 rounded-xl bg-[#BCEBFF]/15 dark:bg-[#071A3D]/40 border border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#071A3D] dark:text-white block">{course.name}</span>
                  <span className="text-slate-500">{course.credits} ساعات معتمدة</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#16958E]/20 text-[#16958E] font-bold font-mono">
                    {course.gradeLetter} ({course.gradePoint})
                  </span>
                  <button onClick={() => handleDeleteCourse(course.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
