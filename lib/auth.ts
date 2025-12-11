const USER_STORAGE_KEY: string = 'utesa_user_session';

interface SafeUser {
    id: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
}

export function getCurrentUser(): SafeUser | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Guarda la información del usuario devuelta por la API
export function setLocalUser(user: SafeUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

// Limpia la sesión
export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
    }
}
