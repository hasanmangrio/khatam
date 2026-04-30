export interface Khatam {
  id: string;
  completedAt: string; // ISO date string
  notes?: string;
}

export interface PageEntry {
  date: string;  // YYYY-MM-DD
  page: number;
}

export interface Store {
  khatams: Khatam[];
  currentPage: number;
  pageHistory: PageEntry[];
  goalDays?: number; // target khatam cycle in days
}

export interface DayReading {
  date: string;       // YYYY-MM-DD
  pagesRead: number | null;  // null = no log that day
  endPage: number | null;
}
