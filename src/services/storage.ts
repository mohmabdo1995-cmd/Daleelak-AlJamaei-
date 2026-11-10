import { Lecture, GpaCourse, UserSettings } from '../types';

const STORAGE_KEYS = {
  LECTURES: 'daleelak_lectures_v2',
  GPA_COURSES: 'daleelak_gpa_v1',
  SETTINGS: 'daleelak_settings_v1',
  TASKS: 'daleelak_tasks_v1'
};

export class StorageService {
  // --- Lectures ---
  static getLectures(): Lecture[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LECTURES);
      if (!data) {
        return [];
      }
      const parsed: Lecture[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      // Clean up legacy demo items if any exist
      return parsed.filter(l => l && l.id && !l.id.startsWith('demo-'));
    } catch (e) {
      console.error('Error reading lectures from storage:', e);
      return [];
    }
  }

  static saveLectures(lectures: Lecture[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures));
    } catch (e) {
      console.error('Error saving lectures to storage:', e);
    }
  }

  static addLecture(lecture: Omit<Lecture, 'id' | 'createdAt'>): Lecture {
    const lectures = this.getLectures();
    const newLecture: Lecture = {
      ...lecture,
      id: 'lec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now()
    };
    const updated = [newLecture, ...lectures];
    this.saveLectures(updated);
    return newLecture;
  }

  static updateLecture(updatedLecture: Lecture): void {
    const lectures = this.getLectures();
    const index = lectures.findIndex(l => l.id === updatedLecture.id);
    if (index !== -1) {
      lectures[index] = updatedLecture;
      this.saveLectures(lectures);
    }
  }

  static deleteLecture(id: string): void {
    const lectures = this.getLectures();
    const filtered = lectures.filter(l => l.id !== id);
    this.saveLectures(filtered);
  }

  static toggleLectureCompleted(id: string): void {
    const lectures = this.getLectures();
    const updated = lectures.map(l => l.id === id ? { ...l, completed: !l.completed } : l);
    this.saveLectures(updated);
  }

  // --- GPA Courses ---
  static getGpaCourses(): GpaCourse[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GPA_COURSES);
      return data ? JSON.parse(data) : [
        { id: '1', name: 'Anatomy', credits: 4, gradePoint: 4.0, gradeLetter: 'A+' },
        { id: '2', name: 'Physiology', credits: 4, gradePoint: 3.7, gradeLetter: 'A' },
        { id: '3', name: 'Biochemistry', credits: 3, gradePoint: 3.3, gradeLetter: 'B+' }
      ];
    } catch (e) {
      return [];
    }
  }

  static saveGpaCourses(courses: GpaCourse[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GPA_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Error saving GPA courses:', e);
    }
  }

  // --- User Settings ---
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      theme: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      activeView: 'landing'
    };
  }

  static saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  }
}
