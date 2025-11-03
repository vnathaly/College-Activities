export type Role = "admin" | "organizer" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; 
  status?: "active" | "inactive";
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  place?: string;
  maxCapacity: number;
  status?: "active" | "cancelled";
}

export interface NotificationItem {
  id: string;
  userId?: string | null; 
  type: "reminder" | "alert" | "info";
  message: string;
  sentAt?: string;
  read?: boolean;
}

export const INITIAL_USERS: User[] = [
  { id: "u1", name: "Admin UTESA", email: "admin@utesa.edu.do", role: "admin", password: "admin123", status: "active" },
  { id: "u2", name: "Organizador", email: "orga@utesa.edu.do", role: "organizer", password: "orga123", status: "active" },
  { id: "u3", name: "Juan Pérez", email: "juan@utesa.edu.do", role: "student", password: "juan123", status: "active" }
];

export const INITIAL_EVENTS: EventItem[] = [
  { id: "e1", title: "Charla: Innovación Educativa", description: "Charla sobre nuevas metodologías.", date: new Date().toISOString(), place: "Auditorio A", maxCapacity: 100, status: "active" },
  { id: "e2", title: "Taller de Git y GitHub", description: "Prácticas básicas", date: new Date(Date.now() + 86400000).toISOString(), place: "Laboratorio 2", maxCapacity: 30, status: "active" }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", userId: null, type: "info", message: "Bienvenido a Agenda UTESA", sentAt: new Date().toISOString(), read: false }
];

export const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const readFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};
