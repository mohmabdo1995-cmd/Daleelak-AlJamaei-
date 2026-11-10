export type ActivePage = 'landing' | 'main' | 'college' | 'subjects' | 'subject-detail' | 'schedule' | 'resources' | 'articles' | 'videos' | 'gpa' | 'pomodoro';

export type SubjectId = 'anatomy' | 'physiology' | 'biochemistry' | 'microbiology' | 'pathology' | 'pharmacology' | string;

export interface ArticleItem {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // rich text / markdown
  coverImage?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published';
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // URL or Base64/Blob
  thumbnailUrl?: string;
  duration?: string;
  order: number;
  visible: boolean; // published or hidden
  fileType?: string;
  createdAt: string;
}

export interface TickerItem {
  id: string;
  text: string;
  badge?: string;
  link?: string;
  visible: boolean;
  order: number;
  createdAt: string;
}

export interface CollegeInfoData {
  title: string;
  tagline: string;
  image: string;
  overview: string;
  creditSystem: string;
  survivalTips: Array<{ id: string; title: string; description: string }>;
  customSections?: Array<{ id: string; title: string; content: string; image?: string }>;
}

export interface Subject {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  icon: string;
  color: string;
  image: string;
  description: string;
  credits: number;
  overview: string;
  keyTopics: string[];
  studyTips: string[];
  recommendedBooks: string[];
  lectureTopics: { id: string; titleAr: string; titleEn: string; duration: string; summary: string }[];
}

export interface Lecture {
  id: string;
  title: string;
  subject: string;
  professor?: string;
  hall?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  dayOfWeek: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  notificationEnabled: boolean;
  createdAt: number;
}

export interface StudyResource {
  id: string;
  title: string;
  subjectId: SubjectId | 'general' | string;
  subjectTag?: string;
  category: 'telegram' | 'book' | 'video' | 'notes' | 'summary' | string;
  description: string;
  link: string;
  url?: string;
  isExternal?: boolean;
  icon?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GpaCourse {
  id: string;
  name: string;
  credits: number;
  gradePoint: number; // 4.0 scale or standard scale
  gradeLetter: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  activeView: ActivePage;
  selectedSubjectId?: SubjectId;
}
