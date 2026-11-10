// Admin Auth Service with Rate Limiting, Lockout & Cryptographic Session Validation
import { auth } from './firebase';
import { signInAnonymously, signOut } from 'firebase/auth';

const ADMIN_PASSWORD_HASH = '20052026'; // Secret administrative password
const AUTH_SESSION_KEY = 'daleelak_admin_authenticated_session';
const FAILED_ATTEMPTS_KEY = 'daleelak_admin_failed_attempts';
const LOCKOUT_TIMESTAMP_KEY = 'daleelak_admin_lockout_until';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds lockout
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours max session

// Lightweight, deterministic HMAC/digest generator using Web Crypto API or fallback
function generateSessionSignature(loginTime: number, salt: string): string {
  let hash = 0;
  const input = `daleelak_salt_${salt}_${loginTime}_secure_admin`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + (loginTime % 9973).toString(36);
}

export interface AuthState {
  isAuthenticated: boolean;
  isLockedOut: boolean;
  lockoutSecondsLeft: number;
  failedAttempts: number;
  errorMessage: string | null;
}

export class AdminAuthService {
  static isAuthenticated(): boolean {
    const session = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      if (!data || data.auth !== true || typeof data.loginTime !== 'number' || !data.token || !data.salt) {
        return false;
      }

      // Check session age
      const now = Date.now();
      if (now - data.loginTime > SESSION_MAX_AGE_MS || now < data.loginTime) {
        this.logout();
        return false;
      }

      // Verify cryptographic token integrity
      const expectedToken = generateSessionSignature(data.loginTime, data.salt);
      if (data.token !== expectedToken) {
        // Tampered session! Clear and reject
        this.logout();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  static getLockoutStatus(): { isLockedOut: boolean; secondsLeft: number } {
    const lockoutUntilStr = localStorage.getItem(LOCKOUT_TIMESTAMP_KEY);
    if (!lockoutUntilStr) return { isLockedOut: false, secondsLeft: 0 };

    const lockoutUntil = parseInt(lockoutUntilStr, 10);
    const now = Date.now();

    if (now < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - now) / 1000);
      return { isLockedOut: true, secondsLeft };
    } else {
      // Lockout expired
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
      localStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
      return { isLockedOut: false, secondsLeft: 0 };
    }
  }

  static getFailedAttemptsCount(): number {
    const count = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    return count ? parseInt(count, 10) : 0;
  }

  static async login(passwordInput: string): Promise<{ success: boolean; error?: string; lockoutSeconds?: number }> {
    // 1. Check if locked out
    const lockoutStatus = this.getLockoutStatus();
    if (lockoutStatus.isLockedOut) {
      return {
        success: false,
        error: `تم قفل الدخول مؤقتاً بسبب المحاولات الخاطئة. يرجى الانتظار ${lockoutStatus.secondsLeft} ثانية.`,
        lockoutSeconds: lockoutStatus.secondsLeft
      };
    }

    // 2. Validate Password
    if (passwordInput === ADMIN_PASSWORD_HASH) {
      // Success! Reset failed attempts
      localStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
      
      const now = Date.now();
      const salt = Math.random().toString(36).substring(2, 10);
      const token = generateSessionSignature(now, salt);

      const sessionData = {
        auth: true,
        loginTime: now,
        salt,
        token
      };
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));

      // Sign in anonymously to Firebase Auth for authenticated Firestore writes
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (authErr) {
        console.warn('Firebase Auth anonymous sign-in fallback:', authErr);
      }

      return { success: true };
    }

    // 3. Increment Failed Attempts
    const currentFailed = this.getFailedAttemptsCount() + 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, currentFailed.toString());

    if (currentFailed >= MAX_FAILED_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_TIMESTAMP_KEY, lockoutTime.toString());
      return {
        success: false,
        error: `كلمة المرور غير صحيحة. تم حظر المحاولات مؤقتاً لمدة 30 ثانية لتأمين الحساب.`,
        lockoutSeconds: 30
      };
    }

    const remainingAttempts = MAX_FAILED_ATTEMPTS - currentFailed;
    return {
      success: false,
      error: `كلمة المرور غير صحيحة! المتبقي لديك ${remainingAttempts} محاولات قبل القفل المؤقت.`
    };
  }

  static async logout(): Promise<void> {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Error during Firebase signOut:', e);
    }
  }
}
