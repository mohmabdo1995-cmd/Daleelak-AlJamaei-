import { Lecture } from '../types';

export class NotificationService {
  private static checkInterval: number | null = null;

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static getPermissionState(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  static async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    const defaultOptions: NotificationOptions = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      dir: 'rtl',
      lang: 'ar',
      ...options
    };

    // Play chime sound
    this.playNotificationSound();

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, defaultOptions);
        return;
      } catch (e) {
        console.warn('Service Worker notification failed, fallback to Web Notification:', e);
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, defaultOptions);
    }
  }

  static notifyLectureDue(lecture: Lecture): void {
    const title = lecture.title;
    const body = `موعد المحاضرة: ${lecture.time} | المكان: ${lecture.hall || 'المدرج الرئيسي'} | المادة: ${lecture.subject}`;
    this.sendNotification(title, { body, tag: `lec-${lecture.id}` });
  }

  static playNotificationSound(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Web Audio chime sound failed:', e);
    }
  }

  // Background scheduler to check lectures every minute
  static startScheduler(getLectures: () => Lecture[]): void {
    if (this.checkInterval) return;

    const check = () => {
      const lectures = getLectures();
      const now = new Date();
      const currentDateStr = now.toISOString().split('T')[0];
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      lectures.forEach(lec => {
        if (!lec.completed && lec.notificationEnabled && lec.date === currentDateStr) {
          if (lec.time === currentTimeStr) {
            this.notifyLectureDue(lec);
          }
        }
      });
    };

    // Run immediately and every 30 seconds
    check();
    this.checkInterval = window.setInterval(check, 30000);
  }

  static stopScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
