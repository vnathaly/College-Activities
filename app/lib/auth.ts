import { User, INITIAL_USERS, saveToStorage, readFromStorage, INITIAL_NOTIFICATIONS, INITIAL_EVENTS } from "./data";

const STORAGE_USER_KEY = "agenda:user";

export function loginWithEmail(email: string, password: string): User | null {
  const users = readFromStorage<User[]>("agenda:users", INITIAL_USERS);
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) return null;
  const toStore: Omit<User, "password"> = { id: found.id, name: found.name, email: found.email, role: found.role, status: found.status };
  saveToStorage(STORAGE_USER_KEY, toStore);
  return toStore as User;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_USER_KEY);
}

export function getCurrentUser(): User | null {
  return readFromStorage<User | null>(STORAGE_USER_KEY, null);
}

export function bootstrapInitialData() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("agenda:users")) saveToStorage("agenda:users", INITIAL_USERS);
  if (!localStorage.getItem("agenda:events")) saveToStorage("agenda:events", INITIAL_EVENTS);
  if (!localStorage.getItem("agenda:notifs")) saveToStorage("agenda:notifs", INITIAL_NOTIFICATIONS);
}
