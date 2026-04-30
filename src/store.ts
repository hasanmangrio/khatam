import { format, subDays } from 'date-fns';
import type { Store, Khatam, PageEntry, DayReading } from './types';

const KEY = 'khatam-tracker';
export const TOTAL_PAGES = 604;

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // migrate stores that predate pageHistory
      if (!parsed.pageHistory) parsed.pageHistory = [];
      return parsed;
    }
  } catch {}
  return { khatams: [], currentPage: 1, pageHistory: [] };
}

function save(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getStore(): Store {
  return load();
}

export function addKhatam(date: string, notes?: string): Store {
  const store = load();
  const khatam: Khatam = {
    id: crypto.randomUUID(),
    completedAt: date,
    notes,
  };
  store.khatams = [khatam, ...store.khatams].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  store.currentPage = 1;
  save(store);
  return store;
}

export function deleteKhatam(id: string): Store {
  const store = load();
  store.khatams = store.khatams.filter((k) => k.id !== id);
  save(store);
  return store;
}

export function updateCurrentPage(page: number): Store {
  const store = load();
  const clamped = Math.max(1, Math.min(TOTAL_PAGES, page));
  store.currentPage = clamped;

  // Record today's page snapshot — one entry per day, always latest wins
  const today = format(new Date(), 'yyyy-MM-dd');
  const existing = store.pageHistory.findIndex((e) => e.date === today);
  const entry: PageEntry = { date: today, page: clamped };
  if (existing >= 0) {
    store.pageHistory[existing] = entry;
  } else {
    store.pageHistory.push(entry);
  }

  save(store);
  return store;
}

// Returns the last recorded page on or before a given date
function pageOnOrBefore(history: PageEntry[], date: string): number | null {
  const candidates = history
    .filter((e) => e.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date));
  return candidates.length ? candidates[candidates.length - 1].page : null;
}

export function setGoal(days: number): Store {
  const store = load();
  store.goalDays = days;
  save(store);
  return store;
}

export function getDailyReadings(history: PageEntry[], numDays = 7): DayReading[] {
  return Array.from({ length: numDays }, (_, i) => {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const prevDate = format(subDays(new Date(), i + 1), 'yyyy-MM-dd');

    const todayEntry = history.find((e) => e.date === date);
    if (!todayEntry) return { date, pagesRead: null, endPage: null };

    const prevPage = pageOnOrBefore(history, prevDate);
    const pagesRead = prevPage !== null ? Math.max(0, todayEntry.page - prevPage) : null;

    return { date, pagesRead, endPage: todayEntry.page };
  });
}
