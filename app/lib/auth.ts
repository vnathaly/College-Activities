import { User } from "@prisma/client";

export type SafeUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'userType' | 'major'>;

const USER_STORAGE_KEY = 'utesa_user_session';

export function getCurrentUser(): SafeUser | null {
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem(USER_STORAGE_KEY);
      return user ? (JSON.parse(user) as SafeUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }
  return null;
}

export function setLocalUser(user: SafeUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
    }
}

export function bootstrapInitialData(): void {}
export function loginWithEmail(email: string, password: string): SafeUser | null { return null; }