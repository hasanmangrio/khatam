export interface Khatam {
  id: string;
  completedAt: string; // ISO date string
  notes?: string;
}

export interface Store {
  khatams: Khatam[];
  currentPage: number;
}
